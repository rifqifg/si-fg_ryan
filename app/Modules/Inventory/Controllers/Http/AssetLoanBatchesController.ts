import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AssetLoanBatch from 'Inventory/Models/AssetLoanBatch'
import CreateAssetLoanBatchValidator from 'Inventory/Validators/CreateAssetLoanBatchValidator'
import Asset from 'Inventory/Models/Asset'
import AssetLoan from 'Inventory/Models/AssetLoan'
import { validate as uuidValidation } from "uuid";
import UpdateAssetLoanBatchValidator from '../../Validators/UpdateAssetLoanBatchValidator'

export default class AssetLoanBatchesController {
  public async index({ request, response }: HttpContextContract) {
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
        .whereHas('employee', query => {
          query.whereILike('name', `%${keyword}%`)
        })
        .orderBy('created_at', 'desc')
        .paginate(page, limit)

      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      response.badRequest({ message: "Gagal mengambil data", error: error.message })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateAssetLoanBatchValidator)
    const { employeeId, type, description, startDate, endDate, assets } = payload

    try {
      // siapin data untuk update status assets
      const loanedAssets = assets.map(asset => {
        return asset.assetId
      })

      // update status assets jadi borrowed
      await Asset.query()
        .whereIn('id', loanedAssets)
        .update('assetStatusId', 'BORROWED')
        .returning('*')

      // bikin batch nya 
      const batch = await AssetLoanBatch.create({ employeeId, type, description })

      // siapin data untuk pinjem assets
      const { id: assetLoanBatchId } = batch
      assets.forEach(asset => {
        Object.assign(asset, { startDate, endDate, assetLoanBatchId })
      });

      // bikin peminjaman
      const data = await AssetLoan.createMany(assets)
      response.created({ message: "Berhasil menyimpan data", data: { batch, assets: data } })

    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal menyimpan data", error: error.message })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "Batch ID tidak valid" }) }

    try {
      const data = await AssetLoanBatch.query().preload('assetLoan').where('id', id).firstOrFail()
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
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
      const batch = await getBatch.merge({ employeeId, type, description }).save()

      // update property of loaned asset
      let assetLoans: any
      if (startDate) {
        assetLoans = await AssetLoan.query()
          .where('assetLoanBatchId', id)
          .update({ startDate: startDate.toISO() })
          .returning('*')
      } else if (returnAll) {
        // ASSET RETURNED 
        assetLoans = await AssetLoan.query()
          .where('assetLoanBatchId', id)
          .update({ endDate: endDate!.toISO() })
          .returning('*')


        const idAssets = assetLoans.map(asset => asset.id)
        await Asset.query()
          .whereIn('id', idAssets)
          .update('assetStatusId', 'AVAILABLE')
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
