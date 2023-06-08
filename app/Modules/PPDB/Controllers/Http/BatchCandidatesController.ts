import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateBatchCandidateValidator from '../../Validators/CreateBatchCandidateValidator'
import BatchCandidate from '../../Models/BatchCandidate'
import { validate as uuidValidation } from 'uuid'
import UpdateBatchCandidateValidator from '../../Validators/UpdateBatchCandidateValidator'
import PPDBBatch from '../../Models/PPDBBatch'
import StudentCandidate from '../../Models/StudentCandidate'
import { ScStatus } from '../../lib/enums'

export default class BatchCandidatesController {
    public async index({ request, response }: HttpContextContract) {
        const { page = 1, limit = 10, active } = request.qs()

        try {
            let data: object
            if (active === "true" || active === "false") {
                data = await PPDBBatch.query()
                    .where('active', active)
                    .has('batchCandidates')
                    .preload('batchCandidates')
                    .paginate(page, limit)
            } else {
                data = await BatchCandidate.query()
                    // .whereILike('', `%${batch_name}%`)
                    // .orderBy('year')
                    .paginate(page, limit)
            }

            response.ok({ message: "Berhasil mengambil data", data })
        } catch (error) {
            response.badRequest({ message: "BAC_IND-01: Gagal mengambil data", error })
        }
    }

    public async store({ request, response }: HttpContextContract) {
        const payload = await request.validate(CreateBatchCandidateValidator)

        try {
            const data = await BatchCandidate.create({
                candidateId: payload.candidate_id,
                batchId: payload.batch_id,
            })

            const sc = await StudentCandidate.findOrFail(payload.candidate_id)
            await sc.merge({ status: ScStatus.DONE_SELECTION }).save()

            response.created({ message: "Berhasil menyimpan data", data })
        } catch (error) {
            console.log(error);
            response.badRequest({ message: "BAC_STO-01: Gagal menyimpan data", error: error.message })
        }
    }

    public async show({ params, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "ID tidak valid" }) }

        try {
            // const data = await BatchCandidate.findOrFail(id)
            const data = await BatchCandidate.query().where('id', id).preload('candidate').firstOrFail()
            response.ok({ message: "Berhasil mengambil data", data })
        } catch (error) {
            console.log(error);
            response.badRequest({ message: "BAC_SHO-01: Gagal mengambil data", error: error.message })
        }
    }

    public async update({ params, request, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "BAC_UPD-01: ID tidak valid" }) }

        const payload = await request.validate(UpdateBatchCandidateValidator)
        if (JSON.stringify(payload) === '{}') {
            console.log("data update kosong");
            return response.badRequest({ message: "Data tidak boleh kosong" })
        }
        try {
            const batchCandidate = await BatchCandidate.findOrFail(id)
            const data = await batchCandidate.merge({
                candidateId: payload.candidate_id,
                batchId: payload.batch_id,
            }).save()
            response.ok({ message: "Berhasil mengubah data", data })
        } catch (error) {
            console.log(error);
            response.badRequest({ message: "Gagal mengubah data", error: error.message })
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
