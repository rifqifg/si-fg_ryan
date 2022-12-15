import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ImportInventoriesController {
    public async getTemplateAsset({ response }: HttpContextContract) {
        const data = ['']
        response.ok({ message: "Berhasil mengambil data", data })
    }
}
