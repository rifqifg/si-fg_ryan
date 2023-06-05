import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { validate as uuidValidation } from 'uuid'
import InsertScPrimaryDatumValidator from '../../Validators/InsertScPrimaryDatumValidator'
import StudentCandidate from '../../Models/StudentCandidate'

export default class StudentCandidatesController {
    public async updateDataPrimary({ params, request, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "ID calon siswa tidak valid" }) }

        const payload = await request.validate(InsertScPrimaryDatumValidator)

        try {
            const candidate = await StudentCandidate.findOrFail(id)
            const data = await candidate.merge(payload).save()
            response.ok({ message: "Berhasil update data primary calon siswa", data })
        } catch (error) {
            response.badRequest({ message: "Gagal update data primary calon siswa", error: error.message })
        }
    }
}
