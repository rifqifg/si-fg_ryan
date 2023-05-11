// import Mail from '@ioc:Adonis/Addons/Mail'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
// import Env from '@ioc:Adonis/Core/Env'
import { v4 as uuidv4 } from 'uuid'
import Hash from '@ioc:Adonis/Core/Hash'
// import Permission from 'App/Models/Permission'
// import PermissionList from 'App/Models/PermissionList'
import Database from '@ioc:Adonis/Lucid/Database'

export default class UsersController {
    public async login({ request, response, auth }: HttpContextContract) {
        const loginSchema = schema.create({
            email: schema.string({ trim: true }, [
                rules.exists({ table: 'users', column: 'email' })
            ]),
            password: schema.string({}, [rules.minLength(6)])
        })


        try {
            const payload = await request.validate({ schema: loginSchema })
            const token = await auth.use('api').attempt(payload.email, payload.password)
            // const acl = await Permission.query().select('role_id', 'menu_id', 'type', 'function').where('role_id', auth.user!.role)
            // const acl2 = await PermissionList.query().select('role_id', 'id', 'type').where('role_id', auth.user!.role)
            const user = await User.query().where('id', auth.user!.id).preload('roles', query => query.select('name', 'permissions'))

            response.ok({
                message: 'login succesfull',
                token,
                data: user,
            })
        } catch (error) {
            console.log(error);

            return response.badRequest({ "message": 'Invalid credentials', error })
        }
    }

    public async logout({ auth, response }: HttpContextContract) {
        await auth.use('api').logout()
        await Database.manager.close('pg')
        response.ok({ message: "logged out" })
    }



    // public async register({ request, response }: HttpContextContract) {
    //     let payload = await request.validate(RegisterAlumnusValidator)
    //     const verifyToken = (Math.floor(Math.random() * 3000)).toString()
    //     let user
    //     payload['role'] = 'alumni'
    //     payload['verifyToken'] = verifyToken
    //     console.log({ payload });

    //     const extraInfos = request.body().extraInfos

    //     try {
    //         user = await User.create(payload)
    //     } catch (error) {
    //         response.unprocessableEntity(error)
    //         console.log(error.messages);
    //     }
    //     let errMsg
    //     await extraInfos.forEach(async element => {
    //         try {
    //             await ExtraInfoAnswer.create({
    //                 ...element,
    //                 userId: user.id
    //             })
    //         } catch (error) {
    //             response.badRequest(error)
    //             errMsg = { ...error }
    //         }
    //     });

    //     if (errMsg) {
    //         console.log("masuk sini nih");
    //         console.log(errMsg);

    //         return response.unprocessableEntity({ message: errMsg })
    //     } else {
    //         await Mail.send((message) => {
    //             message
    //                 .from(Env.get('SMTP_USERNAME'))
    //                 .to(payload.email)
    //                 .subject('Welcome Onboard!')
    //                 .htmlView('emails/registered', { email: payload.email, verifyToken })
    //         })
    //         response.created({
    //             message: 'user created, check email for verification'
    //         })
    //     }
    // }

    public async verify({ request, response }: HttpContextContract) {
        const { email, token } = request.body()
        console.log(email, token);

        try {
            const user = await User.query().where('email', email).where('verifyToken', token).firstOrFail()

            await user.merge({
                verifyToken: "",
                verified: true
            }).save()

            response.ok({ message: 'account verified' })
        } catch (error) {
            response.badRequest({ message: "email tidak ditemukan / token tidak cocok", error })
        }
    }


    public async password_encrypt({ request, response }: HttpContextContract) {
        const { password } = request.qs()
        const encrypted_password = await Hash.make(password)
        const new_uuid = await uuidv4()
        response.ok({ encrypted_password, new_uuid, password })
    }


    public async resetUserPassword({ request, response, auth }: HttpContextContract) {
        // TODO: old password, new password, confirm password

        const resetUserSchema = schema.create({
            old_password: schema.string({}, [rules.minLength(6)]),
            password: schema.string({}, [rules.minLength(6), rules.confirmed()])
        })

        const payload = await request.validate({ schema: resetUserSchema })

        try {
            const verifyPassword = await auth.use('api').verifyCredentials(auth.user!.email, payload.old_password)
            console.log('password verified', verifyPassword);

        } catch (error) {
            response.unprocessableEntity({ message: 'Password lama salah', error: error.message })
            console.log(error)
            return false
        }

        try {
            const user = await User.findOrFail(auth.user!.id)
            await user.merge({ password: payload.password }).save()

            response.ok({ message: "Password reset success" })
        } catch (error) {
            return response.badRequest(error)
        }
    }

    public async getUsers({ request, response }: HttpContextContract) {
        const { keyword, division = "" } = request.qs()
        try {
            const data = await User.query()
                .preload(division)
                .whereILike('name', '%' + keyword + '%')
            response.ok({ message: "Get data success", data })
        } catch (error) {
            console.log(error);
            response.internalServerError(error)

        }
    }
}
