import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateTransactionDocumentValidator from '../../Validators/CreateTransactionDocumentValidator'
import { DateTime } from 'luxon'
import Account from '../../Models/Account'
import TransactionDocument from '../../Models/TransactionDocument'
import Env from "@ioc:Adonis/Core/Env"
import Drive from '@ioc:Adonis/Core/Drive'

export default class TransactionDocumentsController {
  public async index({ request, response }: HttpContextContract) {
    const { student_id, page = 1, limit = 10 } = request.qs()

    try {
      const data = await TransactionDocument.query()
        .if(student_id, query => query.where('student_id', student_id))
        .paginate(page, limit)

      await Promise.all(data.map(async (tDoc) => {
        const beHost = Env.get('BE_URL')
        const financeDrive = Drive.use('finance')
        const signedUrl = await financeDrive.getSignedUrl('transaction-documents/' + tDoc.file, { expiresIn: '30mins' })
        tDoc.file = beHost + signedUrl
      }))

      response.ok({ message: "Data Berhasil Didapatkan", data })
    } catch (error) {
      response.badRequest({
        message: "TDOC-IND: Gagal mengambil data",
        error: error.message,
      })
    }
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const userAccountId = auth.use('parent_api').user!.id

    const account = await Account.query()
      .where('id', userAccountId)
      .preload('student', qStudent => qStudent.select('id'))
      .firstOrFail()

    const payload = await request.validate(CreateTransactionDocumentValidator)

    const nowMilis = DateTime.now().toMillis()
    const imageName = `transaction_doc_${userAccountId}_${nowMilis}.${payload.file.extname}`

    await payload.file.moveToDisk('transaction-documents', { name: imageName }, 'finance')

    try {
      const data = await TransactionDocument.create({
        description: payload.description,
        file: imageName,
        studentId: account.student.id
      })

      const beHost = Env.get('BE_URL')
      const financeDrive = Drive.use('finance')
      const imageUrl = await financeDrive.getSignedUrl('transaction-documents/' + imageName, { expiresIn: '30mins' })
      const signedUrl = beHost + imageUrl

      response.ok({
        message: "Upload Success",
        data,
        image_url: signedUrl
      })
    } catch (error) {
      response.badRequest({
        message: "TDOC-STO: Gagal menyimpan data",
        error: error.message,
      });
    }
  }
}
