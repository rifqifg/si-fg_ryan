import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PPDBGuide from '../../Models/PPDBGuide'
import UpdatePpdbGuideValidator from '../../Validators/UpdatePpdbGuideValidator'

export default class PpdbSettingsController {
    public async showGuide({ response }: HttpContextContract) {
        try {
            const data = await PPDBGuide.all()
            response.ok({ message: "Berhasil mengambil data panduan pendaftaran", data })
        } catch (error) {
            response.internalServerError({ message: "Gagal mengambil data panduan pendaftaran", error: error.message })
        }
    }

    public async updateGuide({ request, response }: HttpContextContract) {
        const payload = await request.validate(UpdatePpdbGuideValidator)

        try {
            const currentData = await PPDBGuide.first()
            const newData = await currentData!.merge(payload).save()
            response.ok({ message: "Berhasil mengubah data panduan pendaftaran", newData })
        } catch (error) {
            response.internalServerError({ message: "Gagal mengubah data panduan pendaftaran", error: error.message })
        }
    }
}
