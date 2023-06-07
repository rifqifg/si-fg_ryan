import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import ProgramSemester from "../../Models/ProgramSemester";
import { validate as uuidValidation } from "uuid";
import User from "App/Models/User";

export default class ProgramSemestersController {
  public async index({ request, response, auth }: HttpContextContract) {
    const {
      page = 1,
      limit = 10,
      mode = "page",
      subjectId = "",
    } = request.qs();

    try {
      let data = {};
      const user = await auth.user!;
      const teacherId = await User.query()
        .where("id", user ? user.id : "")
        .preload("employee", (e) => e.preload("teacher", (t) => t.select("id")))
        .firstOrFail();

      if (mode === "page") {
        data = await ProgramSemester.query()
          .select("*")
          .preload("teachers", (t) =>
            t.preload("employee", (e) => e.select("name"))
          )
          .preload("mapel", (m) => m.select("name"))
          .if(subjectId, (q) => q.where("subjectId", subjectId))
          .if(user.role === "super_admin", (q) =>
            q.where("teacherId", teacherId.employee.teacher.id)
          )
          .paginate(page, limit);
      } else if (mode === "list") {
        data = await ProgramSemester.query()
          .select("*")
          .preload("teachers", (t) =>
            t.preload("employee", (e) => e.select("name"))
          )
          .if(subjectId, (q) => q.where("subjectId", subjectId))
          .if(user.role === "super_admin", (q) =>
            q.where("teacherId", teacherId.employee.teacher.id)
          )
          .preload("mapel", (m) => m.select("name"));
      } else {
        return response.badRequest({
          message: "Mode tidak dikenali, (pilih: page / list)",
        });
      }

      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message,
      });
    }
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const user = await auth.user!;
    const teacherId = await User.query()
      .where("id", user ? user.id : "")
      .preload("employee", (e) => e.preload("teacher", (t) => t.select("id")))
      .firstOrFail();

    const newProsemAdminSchema = schema.create({
      teacherId: schema.string([rules.uuid({ version: 4 })]),
      subjectId: schema.string([rules.uuid({ version: 4 })]),
      totalPertemuan: schema.number(),
    });

    const newProsemNonAdminSchema = schema.create({
      teacherId: schema.string([
        rules.uuid({ version: 4 }),
        rules.trim(),
        rules.exists({
          table: "academic.teachers",
          column: "id",
          where: {
            id: teacherId.employee.teacher.id,
          },
        }),
      ]),
      totalPertemuan: schema.number(),
      subjectId: schema.string([rules.uuid({ version: 4 })]),
    });

    let payload;

    if (user.role !== "super_admin") {
      try {
        payload = await request.validate({ schema: newProsemNonAdminSchema });
      } catch (error) {
        return response.badRequest({
          message: "Buatlah prosem sesuai dengan mapel anda",
          error: error.message,
        });
      }
    } else {
      payload = await request.validate({ schema: newProsemAdminSchema });
    }
    try {
      const data = await ProgramSemester.create(payload);

      response.ok({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      response.badRequest({
        message: "Gagal menyimpan data",
        error: error.message,
      });
    }
  }

  public async show({ response, params }: HttpContextContract) {
    const { id } = params;

    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Program Semeter ID tidak valid" });
    }

    try {
      const data = await ProgramSemester.query()
        .where("id", id)
        .preload("mapel", (m) => m.select("name"))
        .preload("teachers", (t) =>
          t.preload("employee", (e) => e.select("name"))
        )
        .preload("programSemesterDetail", (prosemDetail) =>
          prosemDetail.select("*")
        )
        .firstOrFail();

      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message,
      });
    }
  }

  public async update({ request, response, params }: HttpContextContract) {
    const { id } = params;

    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Program Semeter ID tidak valid" });
    }

    const payload = await request.validate({
      schema: schema.create({
        teacherId: schema.string.optional([
          rules.uuid({ version: 4 }),
          rules.trim(),
        ]),
        subjectId: schema.string.optional([
          rules.uuid({ version: 4 }),
          rules.trim(),
        ]),
        totalPertemuan: schema.number.optional(),
      }),
    });

    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    try {
      const prosem = await ProgramSemester.findOrFail(id);
      const data = await prosem.merge(payload).save();

      response.ok({ message: "Berhasil memperbarui data", data });
    } catch (error) {
      response.badRequest({
        message: "Gagal memperbarui data",
        error: error.message,
      });
    }
  }

  public async destroy({ response, params }: HttpContextContract) {
    const { id } = params;

    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Program Semeter ID tidak valid" });
    }

    try {
      const data = await ProgramSemester.findOrFail(id);
      await data.delete();

      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      response.badRequest({
        message: "Gagal menghapus data",
        error: error.message,
      });
    }
  }
}
