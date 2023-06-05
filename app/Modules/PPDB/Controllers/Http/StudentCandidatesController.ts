import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { validate as uuidValidation } from 'uuid'
import InsertScPrimaryDatumValidator from '../../Validators/InsertScPrimaryDatumValidator'
import StudentCandidate from '../../Models/StudentCandidate'
import ScImageUploadValidator from '../../Validators/ScImageUploadValidator'
import Env from "@ioc:Adonis/Core/Env"
import Drive from '@ioc:Adonis/Core/Drive'

export default class StudentCandidatesController {
    public async updateDataPrimary({ params, request, response }: HttpContextContract) {
        const { id } = params
        if (!uuidValidation(id)) { return response.badRequest({ message: "ID calon siswa tidak valid" }) }

        const payload = await request.validate(InsertScPrimaryDatumValidator)

        try {
            const candidate = await StudentCandidate.findOrFail(id)
            const data = await candidate.merge(payload).save()
            response.ok({ message: "Berhasil update data primary calon siswa", data })
        } catch (error) {
            response.badRequest({ message: "Gagal update data primary calon siswa", error: error.message })
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
}
