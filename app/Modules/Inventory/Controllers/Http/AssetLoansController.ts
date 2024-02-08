import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AssetLoan from 'Inventory/Models/AssetLoan'
import CreateAssetLoanValidator from 'Inventory/Validators/CreateAssetLoanValidator'
import Asset from 'Inventory/Models/Asset'
import { validate as uuidValidation } from "uuid";
import UpdateAssetLoanValidator from 'Inventory/Validators/UpdateAssetLoanValidator';
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist';
import { statusRoutes } from 'App/Modules/Log/lib/enum';
import { DateTime } from 'luxon';

export default class AssetLoansController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", fromDate, toDate } = request.qs()

    try {
      const data = await AssetLoan
        .query()
        .preload('employee', query => {
          query.select('name', 'nip')
        })
        .where(queryK => {
          queryK.whereHas('employee', query => {
            query.whereILike('name', `%${keyword}%`)
          })
          queryK.orWhereHas('student', query => {
            query.orWhereILike('name', `%${keyword}%`)
          })
          queryK.orWhereHas('asset', query => {
            query.orWhereILike('serial', `%${keyword}%`)
            query.orWhereILike('tag', `%${keyword}%`)
          })
        })
        .andWhere(query => {
          if (fromDate && toDate) {
            query.whereBetween('start_date', [fromDate + " 00:00:00", toDate + " 23:59:59"])
            query.orWhereBetween('end_date', [fromDate + " 00:00:00", toDate + " 23:59:59"])
          }
        })
        .preload('student', query => {
          query.select('name', 'nis', 'nisn', 'classId')
          query.preload('class', query => query.select('name'))
        })
        .preload('asset', query => {
          query.select('serial', 'tag')
        })
        .orderBy('created_at', 'desc')
        .paginate(page, limit)

      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      response.badRequest({ message: "Gagal mengambil data", error: error.message })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const payload = await request.validate(CreateAssetLoanValidator)

    if (!payload.endDate) {
      try {
        const asset = await Asset.findOrFail(payload.assetId)
        await asset.merge({ assetStatusId: 'BORROWED' }).save()
        CreateRouteHist(statusRoutes.FINISH, dateStart)
      } catch (error) {
        CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
        console.log(error);
        response.badRequest({ message: "Gagal mengubah status asset", error: error.message })
      }
    }

    try {
      const data = await AssetLoan.create(payload)
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      console.log(error);
      response.badRequest({ message: "Gagal menyimpan data", error: error.message })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "Loan ID tidak valid" }) }

    try {
      const data = await AssetLoan
        .query()
        .preload('loanBatch', query => query.preload('employee', query => query.select('name', 'nip')))
        .preload('employee', query => {
          query.select('name', 'nip')
        })
        .preload('student', query => {
          query.select('name', 'nis', 'nisn', 'classId')
          query.preload('class', query => query.select('name'))
        })
        .preload('asset', query => {
          query.select('serial', 'tag')
        })
        .where('id', id)
        .firstOrFail()

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      response.badRequest({ message: "Gagal mengambil data", error: error.message })
    }

  }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "Loan ID tidak valid" }) }

    const payload = await request.validate(UpdateAssetLoanValidator)

    try {
      const data = await AssetLoan.findOrFail(id)
      await data.merge(payload).save()

      const asset = await Asset.findOrFail(data.assetId)
      if (payload.endDate) {
        try {
          await asset.merge({ assetStatusId: 'AVAILABLE' }).save()
        } catch (error) {
          console.log(error);
          response.badRequest({ message: "Gagal mengubah status asset", error: error.message })
        }
      } else if (payload.endDate === null) {
        try {
          await asset.merge({ assetStatusId: 'BORROWED' }).save()
        } catch (error) {
          console.log(error);
          response.badRequest({ message: "Gagal mengubah status asset", error: error.message })
        }
      }

      response.ok({ message: "Berhasil mengubah data", data })
    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal menyimpan data", error: error.message })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "Batch ID tidak valid" }) }

    try {
      const loan = await AssetLoan.findOrFail(id)
      const asset = await Asset.findOrFail(loan.assetId)

      await asset.merge({ assetStatusId: 'AVAILABLE' }).save()
      await loan.delete()

      response.ok({ message: "Berhasil menghapus data" })
    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal menghapus data", error: error.message })
    }
  }
}
