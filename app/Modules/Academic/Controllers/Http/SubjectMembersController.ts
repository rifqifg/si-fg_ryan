import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { validate as uuidValidation } from "uuid";
import SubjectMember from "../../Models/SubjectMember";
import CreateSubjectMemberValidator from "../../Validators/CreateSubjectMemberValidator";
import UpdateSubjectMemberValidator from "App/Validators/UpdateSubjectMemberValidator";

export default class SubjectMembersController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", subjectId = "" } = request.qs();

    if (subjectId && !uuidValidation(subjectId)) {
      return response.badRequest({ message: "SubjectId tidak valid" });
    }

    try {
      const data = await SubjectMember.query()
        .where("subject_id", subjectId)
        .preload("students", (s) => s.select("name", "nisn", "nis"))
        .preload("subjects", (su) =>
          su.select("name", "is_extracurricular", "description")
        )
        .whereHas("students", (q) => q.whereILike("name", `%${keyword}%`))
        .paginate(page, limit);

      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      return response.badRequest({
        message: "Gagal mengambil data",
        error: error.message,
        error_data: error,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateSubjectMemberValidator);

    try {
      const data = await SubjectMember.createMany(payload.subjectMember);

      response.ok({ message: "Berhasil membuat data", data });
    } catch (error) {
      return response.badRequest({
        message: "Gagal membuat data",
        error: error.message,
        error_data: error,
      });
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Subject Member ID tidak valid" });
    }

    try {
      const data = await SubjectMember.query()
        .where("id", id)
        .preload("students", (st) => st.select("name", "nis", "nisn"))
        .preload("subjects", (su) => su.select("name"))
        .firstOrFail();

      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      return response.badRequest({
        message: "Gagal mengambil data ",
        error: error.message,
        error_data: error,
      });
    }
  }

  public async update({ request, response, params }: HttpContextContract) {
    const { id } = params;

    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Subject Member ID tidak valid" });
    }

    const payload = await request.validate(UpdateSubjectMemberValidator);

    if (JSON.stringify(payload) === "{}") {
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    try {
      const subjectMember = await SubjectMember.findOrFail(id);
      const data = await subjectMember.merge(payload);
      response.ok({ message: "Berhasil memperbarui data", data });
    } catch (error) {
      return response.badRequest({ message: "Gagal memperbarui data" });
    }
  }

  public async destroy({ response, params }: HttpContextContract) {
    const { id } = params;

    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Subject Member ID tidak valid" });
    }

    try {
      const data = await SubjectMember.findOrFail(id);
      await data.delete();

      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      response.badRequest({
        message: "Gagal menghapus data",
        error: error.message,
        error_data: error,
      });
    }
  }
}
