import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import StudentCandidateParent from '../../Models/StudentCandidateParent'
import { validate as uuidValidation } from 'uuid'
import StudentCandidate from '../../Models/StudentCandidate'
import CreateStudentCandidateParentValidator from '../../Validators/CreateStudentCandidateParentValidator'
import UpdateStudentCandidateParentValidator from '../../Validators/UpdateStudentCandidateParentValidator'

export default class StudentCandidateParentsController {
    public async index({ request, response, params }: HttpContextContract) {
        const { student_candidate_id } = params
        if (!uuidValidation(student_candidate_id)) { return response.badRequest({ message: "Student candidate ID tidak valid" }) }

        const { page = 1, limit = 10, keyword = "", } = request.qs()

        try {
            const data = await StudentCandidate.query()
                .where('id', student_candidate_id)
                .preload('entranceExamSchedule')
                .preload('kecamatan')
                .preload('kelurahan')
                .preload('kota')
                .preload('provinsi')
                .preload('parents', qp => {
                    qp.whereILike('name', `%${keyword}%`).orderBy('name')
                })
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

    public async show({ params, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "ID tidak valid" }) }

        try {
            const data = await StudentCandidateParent.findOrFail(id)
            response.ok({ message: "Berhasil mengambil data detail orang tua calon siswa", data })
        } catch (error) {
            console.log(error)
            response.badRequest({ message: "Gagal mengambil data", error: error.message })
        }
    }

    public async update({ params, request, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "CO-STP-UP_01: Student ID tidak valid" }) }

        const payload = await request.validate(UpdateStudentCandidateParentValidator)
        if (JSON.stringify(payload) === '{}') {
            return response.badRequest({ message: "Data tidak boleh kosong" })
        }
        try {
            const scParent = await StudentCandidateParent.findOrFail(id)
            const data = await scParent.merge(payload).save()
            response.ok({ message: "Berhasil mengubah data", data })
        } catch (error) {
            console.log(error)
            response.badRequest({ message: "Gagal mengubah data", error: error.message })
        }
    }

    public async destroy({ params, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "ID tidak valid" }) }

        try {
            const data = await StudentCandidateParent.findOrFail(id)
            await data.delete()
            response.ok({ message: "Berhasil menghapus data" })
        } catch (error) {
            console.log(error)
            response.badRequest({ message: "Gagal menghapus data", error: error.message })
        }
    }
}
