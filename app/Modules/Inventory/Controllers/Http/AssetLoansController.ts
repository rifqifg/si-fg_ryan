import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AssetLoan from 'Inventory/Models/AssetLoan'
import CreateAssetLoanValidator from 'Inventory/Validators/CreateAssetLoanValidator'
import Asset from 'Inventory/Models/Asset'
import { validate as uuidValidation } from "uuid";
import UpdateAssetLoanValidator from 'Inventory/Validators/UpdateAssetLoanValidator';

export default class AssetLoansController {
  public async index({ request, response }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "" } = request.qs()

    try {
      const data = await AssetLoan
        .query()
        .preload('employee', query => {
          query.select('name', 'nip')
        })
        .whereHas('employee', query => {
          query.whereILike('name', `%${keyword}%`)
        })
        .preload('student', query => {
          query.select('name', 'nis', 'nisn', 'classId')
          query.preload('class', query => query.select('name'))
        })
        .orWhereHas('student', query => {
          query.orWhereILike('name', `%${keyword}%`)
        })
        .preload('asset', query => {
          query.select('serial', 'tag')
        })
        .orWhereHas('asset', query => {
          query.orWhereILike('serial', `%${keyword}%`)
          query.orWhereILike('tag', `%${keyword}%`)
        })
        .orderBy('created_at', 'desc')
        .paginate(page, limit)

      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      response.badRequest({ message: "Gagal mengambil data", error: error.message })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateAssetLoanValidator)

    if (!payload.endDate) {
      try {
        const asset = await Asset.findOrFail(payload.assetId)
        await asset.merge({ assetStatusId: 'BORROWED' }).save()
      } catch (error) {
        console.log(error);
        response.badRequest({ message: "Gagal mengubah status asset", error: error.message })
      }
    }

    try {
      const data = await AssetLoan.create(payload)
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal menyimpan data", error: error.message })
    }
  }

  public async show({ params, response }: HttpContextContract) {
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

      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      response.badRequest({ message: "Gagal mengambil data", error: error.message })
    }

  }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "Loan ID tidak valid" }) }

    const payload = await request.validate(UpdateAssetLoanValidator)

    payload.employeeId = payload.employeeId ? payload.employeeId : null
    payload.studentId = payload.studentId ? payload.studentId : null

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
