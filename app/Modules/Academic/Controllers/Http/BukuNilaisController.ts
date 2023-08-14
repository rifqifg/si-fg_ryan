import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { validate as uuidValidation } from "uuid";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import BukuNilai from "../../Models/BukuNilai";
import User from "App/Models/User";
export default class BukuNilaisController {
  public async index({ request, response, auth }: HttpContextContract) {
    const {
      page = 1,
      limit = 10,
      subjectId = "",
      teacherId = "",
      studentId = "",
      classId = "",
    } = request.qs();
    try {
      const user = await auth.user!;
      const userId = await User.query()
        .where("id", user.id)
        .preload("employee", (e) => (e.select("id"), e.preload("teacher")))
        .preload(
          "studentParents",
          (sp) => (
            sp.select("id", "nik", "name"),
            sp.preload("student", (s) => s.select("id", "name", "nis", "nisn"))
          )
        )
        .firstOrFail();

      if (user.role === "teacher" && teacherId !== userId.employee.teacher.id)
        return response.badRequest({
          message: "Anda tidak bisa melihat data pengguna lain",
        });

      if (
        (user.role === "student" && studentId !== userId.studentId) ||
        (user.role === "parent" &&
          studentId !== userId.studentParents.studentId)
      )
        return response.badRequest({
          message: "Anda tidak bisa melihat data pengguna lain",
        });

      const data = await BukuNilai.query()
        .if(teacherId, (t) => t.where("teacherId", teacherId))
        .if(studentId, (s) => s.where("studentId", studentId))
        .if(subjectId, (sb) => sb.where("subjectId", subjectId))
        .if(classId, (c) => c.where("classId", classId))
        .preload("students", (s) => s.select("name", "nisn", "nis"))
        .preload("teachers", (t) =>
          t.preload("employee", (e) => e.select("name", "nip", "nik"))
        )
        .preload("mapels", (m) => m.select("name"))
        .preload("programSemesterDetail", (prosemDetail) =>
          prosemDetail.select(
            "kompetensiDasar",
            "kompetensiDasarIndex",
            "pertemuan"
          )
        )
        .preload("classes", (c) => c.select("name"))
        .paginate(page, limit);

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
      .where("id", user.id)
      .preload("employee", (e) => e.preload("teacher", (t) => t.select("id")))
      .firstOrFail();
    // return teacherId.employee

    let payload;

    if (user.role !== "super_admin") {
      const schemaForTeacher = schema.create({
        bukuNilai: schema.array().members(
          schema.object().members({
            subjectId: schema.string([rules.uuid({ version: 4 })]),
            programSemesterDetailId: schema.string.optional([
              rules.uuid({ version: 4 }),
            ]),
            studentId: schema.string([rules.uuid({ version: 4 })]),
            classId: schema.string([rules.uuid({ version: 4 })]),
            teacherId: schema.string([
              rules.uuid({ version: 4 }),
              rules.exists({
                table: "academic.teachers",
                column: "id",
                where: {
                  id: teacherId.employee.teacher.id,
                },
              }),
            ]),
            nilai: schema.number(),
            type: schema.enum(["HARIAN", "UTS", "UAS"]),
          })
        ),
      });
      payload = await request.validate({ schema: schemaForTeacher });
      try {
      } catch (error) {
        return response.badRequest({
          message: "Masukkan nilai sesuai dengan ID anda",
          error: error.message,
        });
      }
    } else {
      const schemaForAdmin = schema.create({
        bukuNilai: schema.array().members(
          schema.object().members({
            subjectId: schema.string([rules.uuid({ version: 4 })]),
            programSemesterDetailId: schema.string([
              rules.uuid({ version: 4 }),
            ]),
            studentId: schema.string([rules.uuid({ version: 4 })]),
            classId: schema.string([rules.uuid({ version: 4 })]),
            teacherId: schema.string([rules.uuid({ version: 4 })]),
            nilai: schema.number(),
            type: schema.enum(["HARIAN", "UTS", "UAS"]),
          })
        ),
      });
      payload = await request.validate({ schema: schemaForAdmin });
    }

    try {
      const data = await BukuNilai.createMany(payload.bukuNilai);

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

    try {
      const data = await BukuNilai.query()
        .where("id", id)
        .preload("mapels", (m) => m.select("name"))
        .preload("teachers", (t) =>
          t.preload("employee", (e) => e.select("name"))
        )
        .preload("programSemesterDetail", (prosemDetail) =>
          prosemDetail.select("kompetensiDasar", "materi")
        )
        .preload("classes", (c) => c.select("name"))
        .firstOrFail();
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message,
      });
    }
  }

  public async update({
    request,
    response,
    params,
    auth,
  }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id))
      return response.badRequest({ message: "Buku Nilai ID tidak valid" });

    const user = auth.user!;

    let payload;
    if (user.role !== "super_admin") {
      try {
        const teacherId = await User.query()
          .where("id", user ? user.id : "")
          .preload("employee", (e) =>
            e.preload("teacher", (t) => t.select("id"))
          )
          .firstOrFail();

        const schemaForTeacher = schema.create({
          subjectId: schema.string.optional([rules.uuid({ version: 4 })]),
          programSemesterDetailId: schema.string.optional([
            rules.uuid({ version: 4 }),
          ]),
          studentId: schema.string.optional([rules.uuid({ version: 4 })]),
          classId: schema.string.optional([rules.uuid({ version: 4 })]),
          teacherId: schema.string.optional([
            rules.uuid({ version: 4 }),
            rules.exists({
              table: "academic.teachers",
              column: "id",
              where: {
                id: teacherId.employee.teacher.id,
              },
            }),
          ]),
          nilai: schema.number.optional(),
          type: schema.enum.optional(["HARIAN", "UTS", "UAS"]),
        });
        payload = await request.validate({ schema: schemaForTeacher });
      } catch (error) {
        return response.badRequest({
          message: "Masukkan nilai sesuai dengan ID anda",
          error: error.message,
        });
      }
    } else {
      const schemaForAdmin = schema.create({
        subjectId: schema.string.optional([rules.uuid({ version: 4 })]),
        programSemesterDetailId: schema.string.optional([
          rules.uuid({ version: 4 }),
        ]),
        studentId: schema.string.optional([rules.uuid({ version: 4 })]),
        teacherId: schema.string.optional([rules.uuid({ version: 4 })]),
        classId: schema.string.optional([rules.uuid({ version: 4 })]),
        nilai: schema.number.optional(),
        type: schema.enum.optional(["HARIAN", "UTS", "UAS"]),
      });
      payload = await request.validate({ schema: schemaForAdmin });
    }

    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    try {
      const bn = await BukuNilai.findOrFail(id);
      const data = await bn.merge(payload).save();

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
    if (!uuidValidation(id))
      return response.badRequest({ message: "Mapel ID tidak valid" });
    try {
      const data = await BukuNilai.findOrFail(id);
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
