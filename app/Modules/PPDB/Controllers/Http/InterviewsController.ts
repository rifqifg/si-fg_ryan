import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { validate as uuidValidation } from 'uuid'
import StudentCandidate from '../../Models/StudentCandidate'
import CreateCandidateInterviewValidator from '../../Validators/CreateCandidateInterviewValidator'
import PpdbInterview from '../../Models/PpdbInterview'
import UpdateCandidateInterviewValidator from '../../Validators/UpdateCandidateInterviewValidator'

export default class InterviewsController {
  public async index({ request, response, params }: HttpContextContract) {
    const { student_candidate_id } = params
    if (!uuidValidation(student_candidate_id)) { return response.badRequest({ message: "PP_INT_IN-01: Student candidate ID tidak valid" }) }

    const { page = 1, limit = 10 } = request.qs()

    try {
      const data = await StudentCandidate.query()
        .where('id', student_candidate_id)
        .preload('interviews')
        .paginate(page, limit)

      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      response.badRequest({ message: "PP_INT_IN-02: Gagal mengambil data", error: error.message })
    }
  }

  public async store({ request, response, params }: HttpContextContract) {
    const { student_candidate_id } = params
    if (!uuidValidation(student_candidate_id)) { return response.badRequest({ message: "PP_INT_ST-01: Student candidate ID tidak valid" }) }

    const payload = await request.validate(CreateCandidateInterviewValidator)
    try {
      await StudentCandidate.findOrFail(student_candidate_id)
      const data = await PpdbInterview.create({ candidateId: student_candidate_id, ...payload })
      response.created({ message: "Berhasil menyimpan data interview", data })
    } catch (error) {
      console.log(error);
      response.badRequest({ message: "PP_INT_ST-01: Gagal menyimpan data", error: error.message })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "PP_INT_SH-01: ID tidak valid" }) }

    try {
      const data = await PpdbInterview.findOrFail(id)
      response.ok({ message: "Berhasil mengambil data interview", data })
    } catch (error) {
      console.log(error)
      response.badRequest({ message: "PP_INT_SH-02: Gagal mengambil data", error: error.message })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "PP_INT_UP-01: ID tidak valid" }) }

    const payload = await request.validate(UpdateCandidateInterviewValidator)
    if (JSON.stringify(payload) === '{}') {
      return response.badRequest({ message: "PP_INT_UP-02: Data tidak boleh kosong" })
    }
    try {
      const interview = await PpdbInterview.findOrFail(id)
      const data = await interview.merge(payload).save()
      response.ok({ message: "Berhasil mengubah data", data })
    } catch (error) {
      console.log(error)
      response.badRequest({ message: "PP_INT_UP-03: Gagal mengubah data", error: error.message })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "PP_INT_DE-01: ID tidak valid" }) }

    try {
      const data = await PpdbInterview.findOrFail(id)
      await data.delete()
      response.ok({ message: "Berhasil menghapus data" })
    } catch (error) {
      console.log(error)
      response.badRequest({ message: "PP_INT_DE-02: Gagal menghapus data", error: error.message })
    }
  }
}
