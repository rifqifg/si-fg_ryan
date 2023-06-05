import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { validate as uuidValidation } from 'uuid'
import InsertScPrimaryDatumValidator from '../../Validators/InsertScPrimaryDatumValidator'
import StudentCandidate from '../../Models/StudentCandidate'
import ScImageUploadValidator from '../../Validators/ScImageUploadValidator'
import Env from "@ioc:Adonis/Core/Env"
import Drive from '@ioc:Adonis/Core/Drive'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

export default class StudentCandidatesController {
    public async store({ request, response }: HttpContextContract) {
        const uuidBlock = uuidv4().split('-')[0]
        const epoch = DateTime.now().valueOf()
        const registrationId = `${uuidBlock}-${epoch}`

        const payload = await request.validate(InsertScPrimaryDatumValidator)

        try {
            const data = await StudentCandidate.create({ ...payload, registrationId })
            response.created({ message: "Berhasil menyimpan data calon siswa", data })
        } catch (error) {
            response.badRequest({ message: "Gagal menyimpan data calon siswa", error: error.message })
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
