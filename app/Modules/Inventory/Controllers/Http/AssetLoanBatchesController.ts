import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AssetLoanBatch from 'Inventory/Models/AssetLoanBatch'
import CreateAssetLoanBatchValidator from 'Inventory/Validators/CreateAssetLoanBatchValidator'
import Asset from 'Inventory/Models/Asset'
import AssetLoan from 'Inventory/Models/AssetLoan'
import { validate as uuidValidation } from "uuid";
import UpdateAssetLoanBatchValidator from 'Inventory/Validators/UpdateAssetLoanBatchValidator'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'
import { DateTime } from 'luxon'

export default class AssetLoanBatchesController {
  public async index({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
   CreateRouteHist(statusRoutes.START, dateStart)
    const { page = 1, limit = 10, keyword = "" } = request.qs()

    try {
      let data = {}
      data = await AssetLoanBatch
        .query()
        .preload('employee', query => {
          query.select('name', 'nip')
          query.orderBy('name')
        })
        .withCount('assetLoan')
        .withCount('assetLoan', query => {
          query.whereNull('endDate'),
            query.as('notReturned')
        })
        .whereHas('employee', query => {
          query.whereILike('name', `%${keyword}%`)
        })
        .orderBy('created_at', 'desc')
        .paginate(page, limit)

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      response.badRequest({ message: "Gagal mengambil data", error: error.message })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
   CreateRouteHist(statusRoutes.START, dateStart)
    const payload = await request.validate(CreateAssetLoanBatchValidator)
    // const { employeeId, type, description, startDate, endDate } = payload

    try {
      // siapin data untuk update status assets
      // const loanedAssets = assets.map(asset => {
      //   return asset.assetId
      // })

      // update status assets jadi borrowed apabila batch ini tidak memiliki end date
      // if (!endDate) {
      //   await Asset.query()
      //     .whereIn('id', loanedAssets)
      //     .update('assetStatusId', 'BORROWED')
      //     .returning('*')
      // }

      // bikin batch nya
      const data = await AssetLoanBatch.create(payload)

      // siapin data untuk pinjem assets
      // const { id: assetLoanBatchId } = batch
      // assets.forEach(asset => {
      //   Object.assign(asset, { startDate, endDate, assetLoanBatchId })
      // });

      // bikin peminjaman
      // const data = await AssetLoan.createMany(assets)
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
    if (!uuidValidation(id)) { return response.badRequest({ message: "Batch ID tidak valid" }) }

    try {
      const data = await AssetLoanBatch.query()
        .preload('employee', query => query.select('name', 'nip'))
        .preload('assetLoan', query => {
          query.preload('asset', asset => asset.select('serial'))
          query.preload('employee', employee => employee.select('name', 'nip'))
          query.preload('student', student => {
            student.select("name", "nis", "nisn", "classId")
            student.preload('class')
          })
        })
        .where('id', id).firstOrFail()
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      console.log(error);
      response.badRequest({ message: "Gagal mengambil data", error: error.message })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "Batch ID tidak valid" }) }

    const payload = await request.validate(UpdateAssetLoanBatchValidator)
    if (JSON.stringify(payload) === '{}') {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" })
    }

    const { employeeId, type, description, startDate, endDate, returnAll } = payload

    try {
      const getBatch = await AssetLoanBatch.findOrFail(id)
      const batch = await getBatch.merge({ employeeId, type, description, startDate, endDate }).save()

      let assetLoans: any
      if (returnAll) {
        // ASSET RETURNED
        const assetLoanCount = await AssetLoan.query()
          .where('assetLoanBatchId', id)
          .andWhereNull('endDate')
        if (assetLoanCount.length) {
          assetLoans = await AssetLoan.query()
            .where('assetLoanBatchId', id)
            .andWhereNull('endDate')
            .update({ endDate: endDate!.toISO() })
            .returning('*')
          const idAssets = assetLoans.map(asset => asset.asset_id)
          await Asset.query()
            .whereIn('id', idAssets)
            .update('assetStatusId', 'AVAILABLE')
        }
      } else if (startDate) {
        // update property of loaned asset
        assetLoans = await AssetLoan.query()
          .where('assetLoanBatchId', id)
          .update({ startDate: startDate.toISO() })
          .returning('*')
      }

      response.ok({ message: "Berhasil mengubah data", data: { batch, assets: assetLoans } })
    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal mengubah data", error: error.message })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "Batch ID tidak valid" }) }

    // return id
    try {
      const assetLoans = await AssetLoan.query().where('assetLoanBatchId', id)
      if (assetLoans.length > 0) {
        const idAssets = assetLoans.map(asset => asset.assetId)
        await Asset.query()
          .whereIn('id', idAssets)
          .update('assetStatusId', 'AVAILABLE')
          .returning('*')

        await AssetLoan.query().where('assetLoanBatchId', id).delete().then(async () => {
          const data = await AssetLoanBatch.findOrFail(id)
          await data.delete()
        })
      } else {
        const data = await AssetLoanBatch.findOrFail(id)
        await data.delete()
      }
      response.ok({ message: "Berhasil menghapus data" })
    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal menghapus data", error: error.message })
    }

  }
}
