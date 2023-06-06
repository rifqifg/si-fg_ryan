import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateBatchCandidateValidator from '../../Validators/CreateBatchCandidateValidator'
import BatchCandidate from '../../Models/BatchCandidate'
import { validate as uuidValidation } from 'uuid'

export default class BatchCandidatesController {
    public async store({ request, response }: HttpContextContract) {
        const payload = await request.validate(CreateBatchCandidateValidator)

        try {
            const data = await BatchCandidate.create({
                candidateId: payload.candidate_id,
                batchId: payload.batch_id,
                sppChoice: payload.spp_choice,
                programChoice: payload.program_choice,
                majorChoice: payload.major_choice,
                testScheduleChoice: payload.test_schedule_choice
            })

            response.created({ message: "Berhasil menyimpan data", data })
        } catch (error) {
            console.log(error);
            response.badRequest({ message: "BAC_STO-01: Gagal menyimpan data", error: error.message })
        }
    }

    public async destroy({ params, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "ID tidak valid" }) }

        try {
            const data = await BatchCandidate.findOrFail(id)
            await data.delete()
            response.ok({ message: "Berhasil menghapus data" })
        } catch (error) {
            console.log(error);
            response.badRequest({ message: "BAC_DES-01: Gagal menghapus data", error: error.message })
        }
    }
}
