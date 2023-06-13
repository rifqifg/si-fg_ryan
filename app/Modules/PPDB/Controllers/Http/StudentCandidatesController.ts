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
import UpdateScPrimaryDatumValidator from '../../Validators/UpdateScPrimaryDatumValidator'
import { ScStatus } from '../../lib/enums'

export default class StudentCandidatesController {
    public async index({ request, response }: HttpContextContract) {
        const { page = 1, limit = 10, keyword = "", } = request.qs()

        try {
            const data = await StudentCandidate.query()
                .whereILike('full_name', `%${keyword}%`)
                .preload('batchCandidate', q => q.preload('batch'))
                .preload('entranceExamSchedule')
                .preload('kecamatan')
                .preload('kelurahan')
                .preload('kota')
                .preload('provinsi')
                .preload('interviews')
                .orderBy('full_name')
                .paginate(page, limit)

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
            // const data = await StudentCandidate.findOrFail(id)
            const data = await StudentCandidate
                .query()
                .where('id', id)
                .preload('batchCandidate', q => q.preload('batch'))
                .preload('entranceExamSchedule')
                .preload('kecamatan')
                .preload('kelurahan')
                .preload('kota')
                .preload('provinsi')
                .preload('interviews')
                .firstOrFail()
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

    public async fileUpload({ request, response, params }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "ID calon siswa tidak valid" }) }

        const payload = await request.validate(ScImageUploadValidator)
        const imageName = `candidate_${id}_${payload.category}.${payload.file.extname}`
        const data = await StudentCandidate.findOrFail(id)

        await payload.file.moveToDisk(
            'student-candidates',
            { name: imageName, overwrite: true },
            'ppdb'
        )

        const beHost = Env.get('BE_URL')
        const drivePpdb = Drive.use('ppdb')
        const imageUrl = beHost + await drivePpdb.getUrl('student-candidates/' + imageName)

        if (payload.category === 'photo') {
            await data.merge({ photo: imageName }).save()
        } else if (payload.category === 'jhs_certificate') {
            await data.merge({ jhsCertificateScan: imageName }).save()
        } else if (payload.category === 'family_card') {
            await data.merge({ familyCardScan: imageName }).save()
        } else if (payload.category === 'birth_certificate') {
            await data.merge({ birthCertScan: imageName }).save()
        } else if (payload.category === 'payment_proof') {
            await data.merge({ scanPaymentProof: imageName }).save()
        } else if (payload.category === 'jhs_graduation_letter_scan') {
            await data.merge({ jhsGraduationLetterScan: imageName }).save()
        }

        response.ok({
            message: "Upload Success",
            data,
            image_url: imageUrl
        })
    }

    public async showFile({ request, response, params }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "ID calon siswa tidak valid" }) }

        const { category = "" } = request.qs()

        const beHost = Env.get('BE_URL')
        const drivePpdb = Drive.use('ppdb')

        try {
            let data: StudentCandidate
            let imageUrl: string

            if (category === 'photo') {
                data = await StudentCandidate.query().select('photo').where('id', id).firstOrFail()
                imageUrl = (data.photo === null) ? "" : beHost + await drivePpdb.getUrl('student-candidates/' + data.photo)
            } else if (category === 'jhs_certificate') {
                data = await StudentCandidate.query().select('jhsCertificateScan').where('id', id).firstOrFail()
                imageUrl = (data.jhsCertificateScan === null) ? "" : beHost + await drivePpdb.getUrl('student-candidates/' + data.jhsCertificateScan)
            } else if (category === 'family_card') {
                data = await StudentCandidate.query().select('familyCardScan').where('id', id).firstOrFail()
                imageUrl = (data.familyCardScan === null) ? "" : beHost + await drivePpdb.getUrl('student-candidates/' + data.familyCardScan)
            } else if (category === 'birth_certificate') {
                data = await StudentCandidate.query().select('birthCertScan').where('id', id).firstOrFail()
                imageUrl = (data.birthCertScan === null) ? "" : beHost + await drivePpdb.getUrl('student-candidates/' + data.birthCertScan)
            } else if (category === 'payment_proof') {
                data = await StudentCandidate.query().select('scanPaymentProof').where('id', id).firstOrFail()
                imageUrl = (data.scanPaymentProof === null) ? "" : beHost + await drivePpdb.getUrl('student-candidates/' + data.scanPaymentProof)
            } else if (category === 'jhs_graduation_letter_scan') {
                data = await StudentCandidate.query().select('jhsGraduationLetterScan').where('id', id).firstOrFail()
                imageUrl = (data.jhsGraduationLetterScan === null) ? "" : beHost + await drivePpdb.getUrl('student-candidates/' + data.jhsGraduationLetterScan)
            } else {
                throw new Error("Nilai query parameter tidak valid")
            }

            response.ok({ message: "Berhasil mengambil data", data, imageUrl })
        } catch (error) {
            response.badRequest({ message: "Gagal mengambil data", error: error.message })
        }
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
