// import Mail from '@ioc:Adonis/Addons/Mail'
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import Mail from "@ioc:Adonis/Addons/Mail";
import { string } from "@ioc:Adonis/Core/Helpers";
import User from "App/Models/User";
import Env from "@ioc:Adonis/Core/Env";
import { v4 as uuidv4 } from "uuid";
import jwt_decode from "jwt-decode";
import Hash from "@ioc:Adonis/Core/Hash";
import Database from "@ioc:Adonis/Lucid/Database";
import Employee from "App/Models/Employee";
import Student from "App/Modules/Academic/Models/Student";
import UserRole from "App/Models/UserRole";
import Account from "App/Modules/Finance/Models/Account";

enum ROLE {
  EMPLOYEE = "employee",
  STUDENT = "student",
  PARENT = "parent",
  ALUMNI = "alumni",
}

interface UserGoogle {
  email: string;
  name: string;
  email_verified: boolean;
}
export default class UsersController {
  public async login({ request, response, auth }: HttpContextContract) {
    const loginSchema = schema.create({
      email: schema.string({ trim: true }, [
        rules.exists({ table: "users", column: "email" }),
      ]),
      password: schema.string({}, [rules.minLength(6)]),
    });

    const payload = await request.validate({ schema: loginSchema });

    try {
      const token = await auth
        .use("api")
        .attempt(payload.email, payload.password);
      const user = await User.query()
        .where("id", auth.user!.id)
        .preload("roles", (query) => query.select("role_name").preload('role', r => r.select('name', 'permissions')))
        .preload("employee", (e) => {
          e.select("name");
          e.preload("teacher", (t) => t.select("id"));
        })
        .firstOrFail();

      const userObject = JSON.parse(JSON.stringify(user))
      const roles = userObject.roles
      const name: any = []
      const descriptions: any = []
      const modules = roles.reduce((prev, v) => {
        name.push(v.role_name)
        descriptions.push(v.descriptions)
        return [...prev, v.role.permissions.modules]
      }, [])
      const modulesMerge: any = []
      modules.map(value => {
        value.map(m => {
          modulesMerge.push(m)
        })
      })

      userObject["role_name"] = name.toString()
      userObject["role"] = { name: name.toString(), descriptions: descriptions.toString(), permissions: { modules: modulesMerge } }
      delete userObject["roles"]

      response.ok({
        message: "login succesfull",
        token,
        data: userObject,
      });
    } catch (error) {
      console.log(error);

      return response.badRequest({ message: "Invalid credentials", error });
    }
  }

  public async loginParent({ request, response, auth }: HttpContextContract) {
    const loginParentValidator = schema.create({
      va_number: schema.string({ trim: true }, [
        rules.exists({ table: "finance.accounts", column: "number" }),
      ]),
      birthdate: schema.date({ format: "yyyy-MM-dd" }, [
        rules.exists({ table: "academic.students", column: "birth_day" }),
      ]),
    })

    const payload = await request.validate({ schema: loginParentValidator });
    const birthdate = payload.birthdate.toSQLDate()!

    try {
      const account = await Account.query()
        .preload('student', qStudent => qStudent.select('name'))
        .whereHas('student', qStudent => {
          qStudent.where('birth_day', birthdate)
        })
        .andWhere('number', payload.va_number)
        .firstOrFail()

      const token = await auth.use('parent_api').login(account)

      response.ok({
        message: "login succesfull",
        token,
        data: account,
      });
    } catch (error) {
      // console.log(error);
      return response.badRequest({ message: "Invalid credentials", error });
    }
  }

  public async googleCallback({
    request,
    response,
    auth,
  }: HttpContextContract) {
    const { cred } = await request.validate({
      schema: schema.create({
        cred: schema.string([rules.trim()]),
      }),
    });

    const userGoogle: UserGoogle = jwt_decode(cred);

    const userDetails = {
      email: userGoogle.email,
      name: userGoogle.name,
      verified: userGoogle.email_verified,
      provider: "google",
    };

    try {
      const user = await User.query()
        .where("email", "=", userGoogle.email)
        .preload("roles", (query) => query.select("role_name").preload('role', r => r.select('name', 'permissions')))
        .preload("employee", (e) => e.preload("teacher", (t) => t.select("id")))
        .firstOrFail();

      const userObject = JSON.parse(JSON.stringify(user))
      const roles = userObject.roles
      const name: any = []
      const descriptions: any = []
      const modules = roles.reduce((prev, v) => {
        name.push(v.role_name)
        descriptions.push(v.descriptions)
        return [...prev, v.role.permissions.modules]
      }, [])
      const modulesMerge: any = []
      modules.map(value => {
        value.map(m => {
          modulesMerge.push(m)
        })
      })

      userObject["role_name"] = name.toString()
      userObject["role"] = { name: name.toString(), descriptions: descriptions.toString(), permissions: { modules: modulesMerge } }
      delete userObject["roles"]

      const tokenAuth = await auth.use("api").login(user);

      response.ok({ message: "login berhasil", token: tokenAuth, data: userObject });
    } catch (error) {
      return response.send({
        message: "Anda belum memiliki akun",
        email: userDetails.email,
      });
    }
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.use("api").logout();
    await Database.manager.close("pg");
    response.ok({ message: "logged out" });
  }

  public async logoutParent({ auth, response }: HttpContextContract) {
    await auth.use('parent_api').revoke();
    await Database.manager.close("pg");
    response.ok({ message: "logged out (parent)" });
  }

  public async register({ request, response }: HttpContextContract) {
    let payload = await request.validate({
      schema: schema.create({
        name: schema.string([rules.minLength(5), rules.escape(), rules.trim()]),
        email: schema.string([
          rules.email(),
          rules.unique({ table: "users", column: "email" }),
          rules.trim(),
        ]),
        role: schema.string([
          rules.exists({ table: "roles", column: "name" }),
          rules.trim(),
        ]),
        nik: schema.string.optional([
          rules.trim(),
          rules.maxLength(16),
          rules.minLength(16),
          rules.exists({ table: "employees", column: "nik" }),
        ]),
        nisn: schema.string.optional([
          rules.trim(),
          rules.exists({ table: "academic.students", column: "nisn" }),
        ]),
        password: schema.string([rules.minLength(6), rules.confirmed()]),
      }),
      messages: {
        'email.unique': "Email sudah digunakan user lain",
        exists: "{{ field }} yang dimasukkan tidak terdaftar di sistem",
      }
    });

    let employee;
    let student;
    let user;
    const verifyToken = string.generateRandom(64);

    const verify_url = Env.get("BE_URL") + "/auth/verify-email?token=" + verifyToken;

    try {
      await Mail.send((message) => {
        message
          .from(Env.get("SMTP_USERNAME"))
          .to(payload.email)
          .subject("Welcome Onboard!")
          .htmlView("emails/registered", { verify_url });
      });
    } catch (error) {
      return response.internalServerError({ message: "Gagal mengirim email verifikasi", error: error.message });
    }

    if (payload.role === ROLE.EMPLOYEE) {
      try {
        employee = await Employee.findByOrFail("nik", payload.nik);
      } catch (error) {
        return response.badRequest({ message: "NIK anda belum terdaftar" });
      }
      user = await User.create({
        name: payload.name,
        email: payload.email,
        verifyToken,
        employeeId: employee.id,
        password: payload.password,
      });
      const userObject = JSON.parse(JSON.stringify(user))
      await UserRole.create({
        userId: userObject.id,
        roleName: ROLE.EMPLOYEE
      })
    } else {
      try {
        student = await Student.findByOrFail("nisn", payload.nisn);
      } catch (error) {
        return response.send({ message: "NISN tidak terdaftar" });
      }
      if (student && payload.role === ROLE.STUDENT) {
        user = await User.create({
          name: payload.name,
          password: payload.password,
          studentId: student.id,
          email: payload.email,
          verifyToken,
        });
        const userObject = JSON.parse(JSON.stringify(user))
        await UserRole.create({
          userId: userObject.id,
          roleName: ROLE.STUDENT
        })
      } else if (student && payload.role === ROLE.PARENT) {
        user = await User.create({
          name: payload.name,
          password: payload.password,
          email: payload.email,
          verifyToken,
        });
        const userObject = JSON.parse(JSON.stringify(user))
        await UserRole.create({
          userId: userObject.id,
          roleName: ROLE.PARENT
        })
      } else {
        user = await User.create({
          name: payload.name,
          password: payload.password,
          email: payload.email,
          verifyToken,
        });
        const userObject = JSON.parse(JSON.stringify(user))
        await UserRole.create({
          userId: userObject.id,
          roleName: ROLE.ALUMNI
        })
      }
    }

    response.ok({
      message: "Berhasil melakukan register/nSilahkan verifikasi email anda",
      user,
    });
  }

  public async verify({ request, response, view }: HttpContextContract) {
    const token = request.input("token");

    try {
      const user = await User.query().where("verifyToken", token).firstOrFail();

      await user.merge({ verifyToken: "", verified: true, }).save();

      const LOGIN_URL = Env.get("FE_URL")
      return view.render('user_verification_success', { LOGIN_URL })
    } catch (error) {
      return response.badRequest({ message: "email tidak ditemukan / token tidak cocok", error });
    }
  }

  public async password_encrypt({ request, response }: HttpContextContract) {
    const { password } = request.qs();
    const encrypted_password = await Hash.make(password);
    const new_uuid = await uuidv4();
    response.ok({ encrypted_password, new_uuid, password });
  }

  public async resetUserPassword({
    request,
    response,
    auth,
  }: HttpContextContract) {
    // TODO: old password, new password, confirm password

    const resetUserSchema = schema.create({
      old_password: schema.string({}, [rules.minLength(6)]),
      password: schema.string({}, [rules.minLength(6), rules.confirmed()]),
    });

    const payload = await request.validate({ schema: resetUserSchema });

    try {
      const verifyPassword = await auth
        .use("api")
        .verifyCredentials(auth.use('api').user!.email, payload.old_password);
      console.log("password verified", verifyPassword);
    } catch (error) {
      response.unprocessableEntity({
        message: "Password lama salah",
        error: error.message,
      });
      console.log(error);
      return false;
    }

    try {
      const user = await User.findOrFail(auth.user!.id);
      await user.merge({ password: payload.password }).save();

      response.ok({ message: "Password reset success" });
    } catch (error) {
      return response.badRequest(error);
    }
  }

  public async getUsers({ request, response }: HttpContextContract) {
    const { keyword, division = "" } = request.qs();
    try {
      const data = await User.query()
        .preload(division)
        .whereILike("name", "%" + keyword + "%");
      response.ok({ message: "Get data success", data });
    } catch (error) {
      console.log(error);
      response.internalServerError(error);
    }
  }
}
