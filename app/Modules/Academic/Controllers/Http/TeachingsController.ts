import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateTeachingValidator from '../../Validators/CreateTeachingValidator'
import Teaching from '../../Models/Teaching'
import { validate as uuidValidation } from 'uuid';
import UpdateTeachingValidator from '../../Validators/UpdateTeachingValidator';

export default class TeachingsController {
    public async index({ response, params }: HttpContextContract) {
        const { teacher_id } = params
        if (!uuidValidation(teacher_id)) { return response.badRequest({ message: "Teacher ID tidak valid" }) }

        try {
            let data = {}

            data = await Teaching
                .query()
                .preload('class', c => c.select('id', 'name'))
                .preload('subject', s => s.select('id', 'name', 'is_extracurricular'))
                .where('teacher_id', '=', teacher_id)

            response.ok({ message: "Berhasil mengambil data", data })
        } catch (error) {
            const message = "ACTH23: " + error.message || error
            console.log(error);
            response.badRequest({
                message: "Gagal mengambil data",
                error: message,
                error_data: error
            })
        }
    }

    public async store({ request, response }: HttpContextContract) {

        const payload = await request.validate(CreateTeachingValidator)
        try {
            const data = await Teaching.create(payload)
            response.created({ message: "Berhasil menyimpan data", data })
        } catch (error) {
            const message = "ACTH40: " + error.message || error
            console.log(error);
            response.badRequest({
                message: "Gagal menyimpan data",
                error: message,
                error_data: error
            })
        }
    }

    public async show({ params, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "Teaching ID tidak valid" }) }

        try {
            const data = await Teaching
                .query()
                .preload('class', c => c.select('*'))
                .preload('subject', s => s.select('*'))
                .where('id', '=', id).firstOrFail()
            response.ok({ message: "Berhasil mengambil data", data: data })
        } catch (error) {
            const message = "ACTH62: " + error.message || error
            console.log(error);
            response.badRequest({
                message: "Gagal mengambil data",
                error: message,
                error_data: error
            })
        }
    }

    public async update({ params, request, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "Teaching ID tidak valid" }) }

        const payload = await request.validate(UpdateTeachingValidator)
        if (JSON.stringify(payload) === '{}') {
            console.log("data update kosong");
            return response.badRequest({ message: "Data tidak boleh kosong" })
        }
        try {
            const teaching = await Teaching.findOrFail(id)
            const data = await teaching.merge(payload).save()
            response.ok({ message: "Berhasil mengubah data", data })
        } catch (error) {
            const message = "ACTH86: " + error.message || error
            console.log(error);
            response.badRequest({
                message: "Gagal mengubah data",
                error: message,
                error_data: error
            })
        }
    }

    public async destroy({ params, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "Teaching ID tidak valid" }) }

        try {
            const data = await Teaching.findOrFail(id)
            await data.delete()
            response.ok({ message: "Berhasil menghapus data" })
        } catch (error) {
            const message = "ACSU105: " + error.message || error
            console.log(error);
            response.badRequest({
                message: "Gagal menghapus data",
                error: message,
                error_data: error
            })
        }
    }
}
