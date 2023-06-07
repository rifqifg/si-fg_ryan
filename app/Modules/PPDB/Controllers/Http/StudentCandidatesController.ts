import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { validate as uuidValidation } from 'uuid'
import InsertScPrimaryDatumValidator from '../../Validators/InsertScPrimaryDatumValidator'
import StudentCandidate from '../../Models/StudentCandidate'
import ScImageUploadValidator from '../../Validators/ScImageUploadValidator'
import Env from "@ioc:Adonis/Core/Env"
import Drive from '@ioc:Adonis/Core/Drive'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
// import { ScStatusData } from '../../lib/enums'
import PPDBBatch from '../../Models/PPDBBatch'
import UpdateScPrimaryDatumValidator from '../../Validators/UpdateScPrimaryDatumValidator'
import { ScStatus } from '../../lib/enums'

export default class StudentCandidatesController {
    public async index({ request, response }: HttpContextContract) {
        // todo: fitur pencarian calon siswa berdasarkan nama
        const {
            page = 1,
            limit = 10,
            // keyword = "",
            show_all
        } = request.qs()

        try {
            let data: object = {}
            if (show_all === '0') {
                // todo: coba yg ini jika batch_candidates sudah ada isinya
                data = await PPDBBatch
                    .query()
                    .where('active', true)
                    .preload('batchCandidates')//, q => q.preload('studentCandidates'))
            } else if (show_all === '1') {
                data = await StudentCandidate.query()
                    .paginate(page, limit)
                // .whereILike('year', `%${keyword}%`)
                // .orderBy('year')
            }

            response.ok({ message: "Berhasil mengambil data calon siswa", data })
        } catch (error) {
            response.badRequest({ message: "Gagal mengambil data calon siswa", error })
        }
    }

    public async store({ request, response }: HttpContextContract) {
        const uuidBlock = uuidv4().split('-')[0]
        const epoch = DateTime.now().valueOf()
        const registrationId = `${uuidBlock}-${epoch}`

        const payload = await request.validate(InsertScPrimaryDatumValidator)

        try {
            // todo: cek perubahan status
            const data = await StudentCandidate.create({ ...payload, registrationId, status: ScStatus.DONE_PRIMARY_DATA })
            response.created({ message: "Berhasil menyimpan data calon siswa", data })
        } catch (error) {
            response.badRequest({ message: "Gagal menyimpan data calon siswa", error: error.message })
        }
    }

    public async show({ params, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "ID calon siswa tidak valid" }) }

        try {
            const data = await StudentCandidate.findOrFail(id)
            response.ok({ message: "Berhasil mengambil data calon siswa", data })
        } catch (error) {
            response.badRequest({ message: "Gagal mengambil data calon siswa", error: error.message })
        }
    }

    public async update({ params, request, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "ID calon siswa tidak valid" }) }

        const payload = await request.validate(UpdateScPrimaryDatumValidator)
        if (JSON.stringify(payload) === '{}') {
            console.log("data update kosong");
            return response.badRequest({ message: "Data tidak boleh kosong" })
        }

        try {
            const studentCandidate = await StudentCandidate.findOrFail(id)
            const data = await studentCandidate.merge(payload).save()
            response.ok({ message: "Berhasil mengubah data calon siswa", data })
        } catch (error) {
            console.log(error);
            response.badRequest({ message: "Gagal mengubah data calon siswa", error: error.message })
        }
    }

    public async imageUpload({ request, response, params }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "ID calon siswa tidak valid" }) }

        const payload = await request.validate(ScImageUploadValidator)
        const imageName = `candidate_${id}.${payload.photo.extname}`

        const data = await StudentCandidate.findOrFail(id)

        await payload.photo.moveToDisk(
            'student-candidates',
            { name: imageName, overwrite: true },
            'ppdb'
        )

        const beHost = Env.get('BE_URL')
        const drivePpdb = Drive.use('ppdb')
        const imageUrl = beHost + await drivePpdb.getUrl('student-candidates/' + imageName)

        await data.merge({ photo: imageName }).save()

        response.ok({
            message: "Upload Success",
            data,
            image_url: imageUrl
        })
    }

    public async destroy({ params, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "ID calon siswa tidak valid" }) }

        // todo: berikan kondisi failsafe,
        // jadi data calon siswa hanya bisa dihapus apabila status ppdb tidak aktif
        try {
            const data = await StudentCandidate.findOrFail(id)

            await data.delete()
            response.ok({ message: "Berhasil menghapus data calon siswa" })
        } catch (error) {
            response.badRequest({
                message: "Gagal menghapus data calon siswa",
                error: error.message
            })
        }
    }
}
