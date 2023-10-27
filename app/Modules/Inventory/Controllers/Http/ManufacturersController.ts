import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Manufacturer from 'Inventory/Models/Manufacturer'
import CreateManufacturerValidator from 'Inventory/Validators/CreateManufacturerValidator'
import { DateTime } from 'luxon'
import Application from '@ioc:Adonis/Core/Application'
import { validate as uuidValidation } from "uuid";
import UpdateManufacturerValidator from 'Inventory/Validators/UpdateManufacturerValidator'
import Drive from '@ioc:Adonis/Core/Drive'
import { statusRoutes } from 'App/Modules/Log/lib/enum'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'

const getSignedUrl = async (filename: string) => {
  const inventoryDrive = Drive.use('inventory')
  const signedUrl = await inventoryDrive.getSignedUrl('manufacturers/' + filename, { expiresIn: '30mins' })
  return [filename, signedUrl]
}

export default class ManufacturersController {
  public async index({ response, request }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
   CreateRouteHist(statusRoutes.START, dateStart)
    const { page = 1, limit = 10, keyword = "", mode = "page" } = request.qs()

    try {
      let data = {}
      if (mode === "page") {
        data = await Manufacturer
          .query()
          .whereILike('name', `%${keyword}%`)
          .orderBy('name')
          .paginate(page, limit)
      } else if (mode === "list") {
        data = await Manufacturer
          .query()
          .whereILike('name', `%${keyword}%`)
          .orderBy('id')
      } else {
        return response.badRequest({ message: "Mode tidak dikenali, (pilih: page / list)" })
      }

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
    const payload = await request.validate(CreateManufacturerValidator)
    // TIPS: upload file
    const parsedPayload = { ...payload } // parse dulu payload nya biar dinamis, karena takutnya ada yang optional kan
    let newData: any // ini untuk ngisi image dari parsedPayload

    if (parsedPayload.image) { // kalo image nya ada baru di proses
      const inventoryPath = Application.makePath('app/Modules/Inventory/uploads/manufacturers/') //bikin dulu path nya buat nge move, makepath ini untuk bikin fullpath di OS
      await parsedPayload.image?.move(inventoryPath, {
        name: DateTime.now().toUnixInteger().toString() + "." + parsedPayload.image!.extname
      }) //move ini pindahin uploaded file ke fullpath tadi, dan file nya di rename menjadi timestamp
      newData = { ...parsedPayload, image: parsedPayload.image!.fileName } // trus generate data buat dimasukin ke database, INGAT, field image ini hanya file name, kalau dan private, kalau mau diakses public harus bikin signedUrl
    } else { // nah kalo ngga ada image, ngga perlu ada yang di proses, jadi langsung aja
      newData = { ...parsedPayload }
    }
    try {
      const data = await Manufacturer.create(newData)
      data.image = await getSignedUrl(data.image) //return array of signedUrl
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
    if (!uuidValidation(id)) { return response.badRequest({ message: "Manufacturer ID tidak valid" }) }

    try {
      const data = await Manufacturer.query().where('id', id).firstOrFail()
      data.image = await getSignedUrl(data.image) //return array of signedUrl

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

    if (!uuidValidation(id)) { return response.badRequest({ message: "Manufacturer ID tidak valid" }) }
    const payload = await request.validate(UpdateManufacturerValidator)

    if (JSON.stringify(payload) === '{}') {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" })
    }

    let newData: any
    const manufacturer = await Manufacturer.findOrFail(id)

    if (payload.image) {
      const inventoryPath = Application.makePath('app/Modules/Inventory/uploads/manufacturers/')
      await payload.image?.move(inventoryPath, {
        name: DateTime.now().toUnixInteger().toString() + "." + payload.image!.extname
      })
      await Drive.use('inventory').delete('manufacturers/' + manufacturer.image)
      newData = { ...payload, image: payload.image!.fileName }
    } else {
      newData = payload
    }

    try {
      await manufacturer.merge(newData).save()
      manufacturer.image = await getSignedUrl(manufacturer.image) //return array of signedUrl
      response.created({ message: "Berhasil menyimpan data", data: manufacturer })
    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal menyimpan data", error: error.message })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "Manufacturer ID tidak valid" }) }

    try {
      const data = await Manufacturer.findOrFail(id)
      await data.delete()
      await Drive.use('inventory').delete('manufacturers/' + data.image)
      response.ok({ message: "Berhasil menghapus data" })
    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal menghapus data", error: error.message })
    }
  }
}
