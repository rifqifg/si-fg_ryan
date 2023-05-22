import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { validate as uuidValidation } from 'uuid'
import Student from '../../Models/Student'

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
}
