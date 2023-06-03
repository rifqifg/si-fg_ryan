import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PPDBSetting from '../../Models/PPDBSetting'
import CreatePpdbBatchValidator from '../../Validators/CreatePpdbBatchValidator'
import PPDBBatch from '../../Models/PPDBBatch'
import { validate as uuidValidation } from 'uuid'
import UpdatePpdbBatchValidator from '../../Validators/UpdatePpdbBatchValidator'
import UpdatePpdbSettingValidator from '../../Validators/UpdatePpdbSettingValidator'
import UpdatePpdbStatusValidator from '../../Validators/UpdatePpdbStatusValidator'

export default class PpdbSettingsController {
    public async showGuide({ response }: HttpContextContract) {
        try {
            const data = await PPDBSetting.query().select('guideContent')
            response.ok({ message: "Berhasil mengambil data panduan pendaftaran", data })
        } catch (error) {
            response.internalServerError({ message: "Gagal mengambil data panduan pendaftaran", error: error.message })
        }
    }

    public async updateGuide({ request, response }: HttpContextContract) {
        const payload = await request.validate(UpdatePpdbSettingValidator)

        try {
            const currentData = await PPDBSetting.first()
            const data = await currentData!.merge({ guideContent: payload.guide_content }).save()
            response.ok({ message: "Berhasil mengubah data panduan pendaftaran", data })
        } catch (error) {
            response.internalServerError({ message: "Gagal mengubah data panduan pendaftaran", error: error.message })
        }
    }

    public async showActiveStatus({ response }: HttpContextContract) {
        try {
            const data = await PPDBSetting.query().select('active')
            response.ok({ message: "Berhasil mengambil data status aktivasi ppdb", data })
        } catch (error) {
            response.internalServerError({ message: "Gagal mengambil data status aktivasi ppdb", error: error.message })
        }
    }

    public async updateActiveStatus({ request, response }: HttpContextContract) {
        const payload = await request.validate(UpdatePpdbStatusValidator)

        try {
            const currentData = await PPDBSetting.first()
            const data = await currentData!.merge(payload).save()
            response.ok({ message: "Berhasil mengubah status aktivasi ppdb", data })
        } catch (error) {
            response.internalServerError({ message: "Gagal mengubah status aktivasi ppdb", error: error.message })
        }
    }

    public async indexBatches({ request, response }: HttpContextContract) {
        const { page = 1, limit = 10, keyword = "" } = request.qs()

        try {
            const data = await PPDBBatch.query()
                .whereILike('name', `%${keyword}%`)
                .orderBy('name')
                .paginate(page, limit)

            response.ok({ message: "Berhasil mengambil data semua gelombang pendaftaran", data })
        } catch (error) {
            response.badRequest({ message: "Gagal mengambil data gelombang pendaftaran", error })
        }
    }

    public async createBatch({ request, response }: HttpContextContract) {
        const payload = await request.validate(CreatePpdbBatchValidator)

        try {
            const data = await PPDBBatch.create(payload)
            response.created({ message: "Berhasil menyimpan data gelombang pendaftaran", data })
        } catch (error) {
            response.badRequest({ message: "Gagal menyimpan data gelombang pendaftaran", error: error.message })
        }
    }

    public async updateBatch({ params, request, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "ID gelombang tidak valid" }) }

        const payload = await request.validate(UpdatePpdbBatchValidator)

        if (JSON.stringify(payload) === '{}') {
            console.log("data update kosong");
            return response.badRequest({ message: "Data tidak boleh kosong" })
        }

        if (payload.active === true) {
            try {
                const activeBatch = await PPDBBatch.findBy('active', true)
                if (activeBatch) {
                    throw new Error("Sudah ada gelombang lain yang aktif")
                }
            } catch (error) {
                return response.badRequest({
                    message: "Gagal update data gelombang pendaftaran",
                    error: error.message
                })
            }
        }

        try {
            const batch = await PPDBBatch.findOrFail(id)
            const data = await batch.merge(payload).save()
            response.ok({ message: "Berhasil update data gelombang pendaftaran", data })
        } catch (error) {
            response.badRequest({ message: "Gagal update data gelombang pendaftaran", error: error.message })
        }
    }

    public async showBatch({ params, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "ID gelombang tidak valid" }) }

        try {
            const data = await PPDBBatch.query().where('id', id).firstOrFail()
            response.ok({ message: "Berhasil mengambil data gelombang pendaftaran", data })
        } catch (error) {
            response.badRequest({ message: "Gagal mengambil data gelombang pendaftaran", error: error.message })
        }
    }
}
