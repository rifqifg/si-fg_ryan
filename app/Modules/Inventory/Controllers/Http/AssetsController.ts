import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Asset from 'Inventory/Models/Asset'
import Drive from '@ioc:Adonis/Core/Drive'
import CreateAssetValidator from 'Inventory/Validators/CreateAssetValidator'
import { validate as uuidValidation } from "uuid";
import Application from '@ioc:Adonis/Core/Application'
import { DateTime } from 'luxon'
import UpdateAssetValidator from 'Inventory/Validators/UpdateAssetValidator';

const getSignedUrl = async (filename: string) => {
  const inventoryDrive = Drive.use('inventory')
  const signedUrl = await inventoryDrive.getSignedUrl('assets/' + filename, { expiresIn: '30mins' })
  return [filename, signedUrl]
}

export default class AssetsController {
  public async index({ response, request }: HttpContextContract) {
    const { page = 1, limit = 10, keyword = "", mode = "page", status = "" } = request.qs()

    try {
      let data = {}
      if (mode === "page") {
        data = await Asset
          .query()
          .preload('assetStatus', query => query.orderBy('id'))
          .whereILike('serial', `%${keyword}%`)
          .if(status, query => query.andWhere('asset_status_id', status))
          .orderBy('serial')
          .paginate(page, limit)
      } else if (mode === "list") {
        data = await Asset
          .query()
          .preload('assetStatus')
          .whereILike('serial', `%${keyword}%`)
          .if(status, query => query.andWhere('asset_status_id', status))
          .orderBy('serial')
      } else {
        return response.badRequest({ message: "Mode tidak dikenali, (pilih: page / list)" })
      }

      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      response.badRequest({ message: "Gagal mengambil data", error: error.message })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateAssetValidator)
    const parsedPayload = { ...payload }
    let newData: any

    if (parsedPayload.image) {
      const inventoryPath = Application.makePath('app/Modules/Inventory/uploads/assets/') //bikin dulu path nya buat nge move, makepath ini untuk bikin fullpath di OS
      await parsedPayload.image?.move(inventoryPath, {
        name: DateTime.now().toUnixInteger().toString() + "." + parsedPayload.image!.extname
      })
      newData = { ...parsedPayload, image: parsedPayload.image!.fileName }
    } else {
      newData = { ...parsedPayload }
    }
    try {
      const data = await Asset.create(newData)
      data.image = await getSignedUrl(data.image)
      response.created({ message: "Berhasil menyimpan data", data })

    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal menyimpan data", error: error.message })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "Asset ID tidak valid" }) }

    try {
      const data = await Asset.query().where('id', id).firstOrFail()
      data.image = await getSignedUrl(data.image)

      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal mengambil data", error: error.message })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params

    if (!uuidValidation(id)) { return response.badRequest({ message: "Asset ID tidak valid" }) }
    const payload = await request.validate(UpdateAssetValidator)

    if (JSON.stringify(payload) === '{}') {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" })
    }

    let newData: any
    const data = await Asset.findOrFail(id)

    if (payload.image) {
      const inventoryPath = Application.makePath('app/Modules/Inventory/uploads/assets/')
      await payload.image?.move(inventoryPath, {
        name: DateTime.now().toUnixInteger().toString() + "." + payload.image!.extname
      })
      await Drive.use('inventory').delete('assets/' + data.image)
      newData = { ...payload, image: payload.image!.fileName }
    } else {
      newData = payload
    }

    try {
      await data.merge(newData).save()
      data.image = await getSignedUrl(data.image) //return array of signedUrl
      response.created({ message: "Berhasil menyimpan data", data })
    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal menyimpan data", error: error.message })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "Asset ID tidak valid" }) }

    try {
      const data = await Asset.findOrFail(id)
      await data.delete()
      await Drive.use('inventory').delete('assets/' + data.image)
      response.ok({ message: "Berhasil menghapus data" })
    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal menghapus data", error: error.message })
    }
  }
}
