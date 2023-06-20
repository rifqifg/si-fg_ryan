import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { validate as uuidValidation } from 'uuid'
import Student from '../../Models/Student'
import CreateStudentParentValidator from '../../Validators/CreateStudentParentValidator'
import StudentParent from '../../Models/StudentParent'
import UpdateStudentParentValidator from '../../Validators/UpdateStudentParentValidator'

export default class StudentParentsController {
    public async index({ response, params }: HttpContextContract) {
        const { student_id } = params

        if (!uuidValidation(student_id)) { return response.badRequest({ message: "CO-STP-IN_01: Format ID tidak valid" }) }

        try {
            const data = await Student.query()
                .preload('parents')
                .where('id', student_id).firstOrFail()
            response.ok({ message: "Berhasil mengambil data", data })
        } catch (error) {
            console.log(error)
            response.internalServerError({ message: "CO-STP-IN_02: Gagal mengambil data", error: error.message })
        }
    }

    public async store({ request, response, params }: HttpContextContract) {
        const { student_id } = params
        if (!uuidValidation(student_id)) { return response.badRequest({ message: "CO-STP-ST_01: Student ID tidak valid" }) }

        const payload = await request.validate(CreateStudentParentValidator)
        try {
            await Student.findOrFail(student_id)
            const data = await StudentParent.create({ studentId: student_id, ...payload })
            response.created({ message: "Berhasil menyimpan data orang tua siswa", data })
        } catch (error) {
            console.log(error);
            response.badRequest({ message: "CO-STP-ST_02: Gagal menyimpan data", error: error.message })
        }
    }

    public async show({ params, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "CO-STP-SH_01: Parent ID tidak valid" }) }

        try {
            const data = await StudentParent.findOrFail(id)
            response.ok({ message: "Berhasil mengambil data detail orang tua siswa", data })
        } catch (error) {
            console.log(error)
            response.badRequest({ message: "CO-STP-SH_01: Gagal mengambil data", error: error.message })
        }
    }

    public async update({ params, request, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "CO-STP-UP_01: Student ID tidak valid" }) }

        const payload = await request.validate(UpdateStudentParentValidator)
        if (JSON.stringify(payload) === '{}') {
            return response.badRequest({ message: "CO-STP-UP_02: Data tidak boleh kosong" })
        }
        try {
            const studentParent = await StudentParent.findOrFail(id)
            const data = await studentParent.merge(payload).save()
            response.ok({ message: "Berhasil mengubah data", data })
        } catch (error) {
            console.log(error)
            response.badRequest({ message: "CO-STP-UP_03: Gagal mengubah data", error: error.message })
        }
    }

    public async destroy({ params, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "ID orang tua siswa tidak valid" }) }

        try {
            const data = await StudentParent.findOrFail(id)
            await data.delete()
            response.ok({ message: "Berhasil menghapus data" })
        } catch (error) {
            console.log(error)
            response.badRequest({ message: "Gagal menghapus data", error: error.message })
        }
    }
}
