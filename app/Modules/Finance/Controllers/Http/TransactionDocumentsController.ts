import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CreateTransactionDocumentValidator from '../../Validators/CreateTransactionDocumentValidator'
import { DateTime } from 'luxon'
import Account from '../../Models/Account'
import TransactionDocument from '../../Models/TransactionDocument'
import Env from "@ioc:Adonis/Core/Env"
import Drive from '@ioc:Adonis/Core/Drive'
import { validate as uuidValidation } from "uuid"
import UpdateTransactionDocumentValidator from '../../Validators/UpdateTransactionDocumentValidator'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'

export default class TransactionDocumentsController {
  public async index({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { student_id, page = 1, limit = 10 } = request.qs()

    try {
      const data = await TransactionDocument.query()
        .if(student_id, query => query.where('student_id', student_id))
        .preload('student', qStudent => qStudent.select('nisn', 'name'))
        .paginate(page, limit)

      await Promise.all(data.map(async (tDoc) => {
        const beHost = Env.get('BE_URL')
        const financeDrive = Drive.use('finance')
        const signedUrl = await financeDrive.getSignedUrl('transaction-documents/' + tDoc.file, { expiresIn: '30mins' })
        tDoc.file = beHost + signedUrl
      }))

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Data Berhasil Didapatkan", data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message)
      response.badRequest({
        message: "TDOC-IND: Gagal mengambil data",
        error: error.message,
      })
    }
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
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

      data.file = signedUrl

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({
        message: "Upload Success",
        data
      })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message)
      response.badRequest({
        message: "TDOC-STO: Gagal menyimpan data",
        error: error.message,
      });
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)

    const { id } = params;

    if (!uuidValidation(id)) {
      return response.badRequest({ message: "ID tidak valid" });
    }

    try {
      const data = await TransactionDocument.query()
        .where('id', id)
        .preload('student', qStudent => qStudent.select('nisn', 'name'))
        .firstOrFail()

      const beHost = Env.get('BE_URL')
      const financeDrive = Drive.use('finance')
      const signedUrl = await financeDrive.getSignedUrl('transaction-documents/' + data.file, { expiresIn: '30mins' })
      data.file = beHost + signedUrl

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Data Berhasil Didapatkan", data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message)
      response.badRequest({
        message: "TDOC-IND: Gagal mengambil data",
        error: error.message,
      })
    }
  }

  public async update({ request, response, params }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params

    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Activity ID tidak valid" })
    }

    const payload = await request.validate(UpdateTransactionDocumentValidator)

    try {
      const transactionDoc = await TransactionDocument.findOrFail(id)
      const data = await transactionDoc.merge(payload).save()

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengubah data", data });
    } catch (error) {
      const message = "TDOC-UPD: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal mengubah data",
        error: message,
        error_data: error,
      })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params;
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "ID tidak valid" });
    }

    try {
      const data = await TransactionDocument.findOrFail(id);
      await data.delete();
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      const message = "TDOC-DES: " + error.message || error;
      CreateRouteHist(statusRoutes.ERROR, dateStart, message)
      console.log(error);
      response.badRequest({
        message: "Gagal menghapus data",
        error: message,
        error_data: error,
      });
    }
  }
}
