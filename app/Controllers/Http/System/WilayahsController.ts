import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Wilayah from 'App/Models/Wilayah'

export default class WilayahsController {
    public async index({ request, response }: HttpContextContract) {
        const { t: tingkat = "", p: parent = "", k: keyword = "" } = request.qs()
        const objTingkat = {
            pro: 2,
            kot: 5,
            kec: 8,
            kel: 13
        }

        if (typeof objTingkat[tingkat] === "undefined" || (tingkat !== 'pro' && parent === "")) {
            return response.badRequest({ message: "Invalid parameter tingkat & parent are required: tingkat only accepting 'pro', 'kot', 'kec', 'kel' " })
        }
        try {
            const data = await Wilayah.query()
                .whereRaw(`length(kode) = ${objTingkat[tingkat]}`)
                .andWhereILike('nama', `%${keyword}%`)
                .if(tingkat !== 'pro', query => query.andWhereILike('kode', `${parent}%`))

            response.ok({
                message: "Get data successfully",
                data
            })
        } catch (errors) {
            const errMsg = "ROU35: " + errors.message || errors
            console.log(errMsg);
            response.badRequest({ message: "Error getting data", errors: { message: errMsg, errors } });
        }
    }
}
