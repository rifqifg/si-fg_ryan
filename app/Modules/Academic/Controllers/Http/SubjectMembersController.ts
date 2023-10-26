import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { validate as uuidValidation } from "uuid";
import SubjectMember from "../../Models/SubjectMember";
import CreateSubjectMemberValidator from "../../Validators/CreateSubjectMemberValidator";
import UpdateSubjectMemberValidator from "App/Validators/UpdateSubjectMemberValidator";
import DeleteManySubjectMemberValidator from "../../Validators/DeleteManySubjectMemberValidator";
import { statusRoutes } from "App/Modules/Log/lib/enum";
import { CreateRouteHist } from "App/Modules/Log/Helpers/createRouteHist";

export default class SubjectMembersController {
  public async index({ request, response, params }: HttpContextContract) {
  CreateRouteHist(request, statusRoutes.START)
  const { page = 1, limit = 10, mode = "page", keyword = "" } = request.qs();
  const {subject_id: subjectId} = params
    if (!uuidValidation(subjectId)) {
      return response.badRequest({ message: "SubjectId tidak valid" });
    }

    try {
      let data =  {}
      if (mode === 'page') {

        data = await SubjectMember.query()
        .where("subject_id", subjectId)
        .preload(
          "students",
          (s) => (
            s.select("name", "nisn", "nis", 'class_id'),
            s.preload("class", (c) => c.select("name"))
          )
        )
        .preload("subjects", (su) =>
          su.select("name", "is_extracurricular", "description")
        )
        .whereHas("students", (q) => q.whereILike("name", `%${keyword}%`))
        .paginate(page, limit)
      } else {
        data = await SubjectMember.query()
          .where("subject_id", subjectId)
          .preload(
            "students",
            (s) => (
              s.select("name", "nisn", "nis", 'class_id'),
                s.preload("class", (c) => c.select("name"))
            )
          )
          .preload("subjects", (su) =>
            su.select("name", "is_extracurricular", "description")
          )
          .whereHas("students", (q) => q.whereILike("name", `%${keyword}%`))
      }

      CreateRouteHist(request, statusRoutes.FINISH)
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      CreateRouteHist(request, statusRoutes.ERROR, error.message || error)
      return response.badRequest({
        message: "Gagal mengambil data",
        error: error.message,
        error_data: error,
      });
    }
  }

  public async store({ request, response, params }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
    const rawPayload = await request.validate(CreateSubjectMemberValidator);
    const {subject_id: subjectId} = params
    if (!uuidValidation(subjectId)) {
      return response.badRequest({ message: "SubjectId tidak valid" });
    }

    const payload = rawPayload.subjectMember.map(sm => {
     return {...sm, subjectId }
    })


    // return payload.subjectMember.map(sm => sm.subjectId)
    try {
      const data = await SubjectMember.createMany(payload);

      CreateRouteHist(request, statusRoutes.FINISH)
      response.ok({ message: "Berhasil membuat data", data });
    } catch (error) {
      CreateRouteHist(request, statusRoutes.ERROR, error.message || error)
      return response.badRequest({
        message: "Gagal membuat data",
        error: error.message,
        error_data: error,
      });
    }
  }

  public async show({request, params, response }: HttpContextContract) {
    CreateRouteHist(request, statusRoutes.START)
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

        CreateRouteHist(request, statusRoutes.FINISH)
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      CreateRouteHist(request, statusRoutes.ERROR, error.message || error)
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

  public async deleteMany({request, response}: HttpContextContract) {
    const payload = await request.validate(DeleteManySubjectMemberValidator)
    
    try {
      
      const subjectMemberIds = payload.subjectMember.map(sm => sm.id)
      const subjectMembers = await SubjectMember.query().whereIn("id", subjectMemberIds).delete()

      response.ok({message: 'Berhasil menghapus banyak data'})
    } catch (error) {
      response.badRequest({message: "Gagal menghapus banyak data"})
    }
    
  }
}
