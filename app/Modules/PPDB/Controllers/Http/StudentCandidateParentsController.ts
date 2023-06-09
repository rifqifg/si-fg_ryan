import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import StudentCandidateParent from '../../Models/StudentCandidateParent'
import { validate as uuidValidation } from 'uuid'
import StudentCandidate from '../../Models/StudentCandidate'
import CreateStudentCandidateParentValidator from '../../Validators/CreateStudentCandidateParentValidator'

export default class StudentCandidateParentsController {
    public async index({ request, response }: HttpContextContract) {
        const { page = 1, limit = 10, keyword = "", } = request.qs()

        try {
            const data = await StudentCandidateParent.query()
                .whereILike('name', `%${keyword}%`)
                .preload('candidate')
                .orderBy('name')
                .paginate(page, limit)

            response.ok({ message: "Berhasil mengambil data", data })
        } catch (error) {
            response.badRequest({ message: "Gagal mengambil data", error: error.message })
        }
    }

    public async store({ request, response, params }: HttpContextContract) {
        const { student_candidate_id } = params
        if (!uuidValidation(student_candidate_id)) { return response.badRequest({ message: "Student candidate ID tidak valid" }) }

        const payload = await request.validate(CreateStudentCandidateParentValidator)
        try {
            await StudentCandidate.findOrFail(student_candidate_id)
            const data = await StudentCandidateParent.create({ candidateId: student_candidate_id, ...payload })
            response.created({ message: "Berhasil menyimpan data orang tua calon siswa", data })
        } catch (error) {
            console.log(error);
            response.badRequest({ message: "Gagal menyimpan data", error: error.message })
        }
    }
}
