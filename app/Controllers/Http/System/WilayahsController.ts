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

    public async getSelect({ params }: HttpContextContract) {
        const { keyword } = params
        const data = await Wilayah.query()
            .whereILike('nama', `%${keyword}%`)
            .andWhereRaw('length(kode)=13')
            .limit(10)
        return data
    }

    public async getAllByKel({ params }: HttpContextContract) {
        const { keyword } = params
        const pro = keyword.substr(0,2)
        const kot = keyword.substr(0,5)
        const kec = keyword.substr(0,8)

        const provinsi = await Wilayah.find(pro)
        const kota = await Wilayah.find(kot)
        const kecamatan = await Wilayah.find(kec)

        const data = provinsi!.nama +"-"+ kota!.nama +"-"+ kecamatan!.nama 
        console.log(data)
        return data
    }
}
