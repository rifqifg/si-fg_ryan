import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Manufacturer from 'Inventory/Models/Manufacturer'
import CreateManufacturerValidator from 'Inventory/Validators/CreateManufacturerValidator'
import { DateTime } from 'luxon'
import Application from '@ioc:Adonis/Core/Application'
import { validate as uuidValidation } from "uuid";
import UpdateManufacturerValidator from 'Inventory/Validators/UpdateManufacturerValidator'
import Drive from '@ioc:Adonis/Core/Drive'


export default class ManufacturersController {
  public async index({ response, request }: HttpContextContract) {
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

      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      response.badRequest({ message: "Gagal mengambil data", error: error.message })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = await request.validate(CreateManufacturerValidator)
    // TIPS: upload file 
    const parsedPayload = { ...payload } // parse dulu payload nya biar dinamis, karena takutnya ada yang optional kan
    let newData: any // ini untuk ngisi image dari parsedPayload

    if (parsedPayload.image) { // kalo image nya ada baru di proses
      const inventoryPath = Application.makePath('app/Modules/Inventory/uploads/manufacturers/') //bikin dulu path nya buat nge move, makepath ini untuk bikin fullpath di OS
      await parsedPayload.image?.move(inventoryPath, {
        name: DateTime.now().toUnixInteger().toString() + "." + parsedPayload.image!.extname
      }) //move ini pindahin uploaded file ke fullpath tadi, dan file nya di rename menjadi timestamp
      newData = { ...parsedPayload, image: parsedPayload.image!.fileName } // trus generate data buat dimasukin ke database, INGAT, field image ini hanya file name, kalau dan private, kalau mau diakses public harus bikin signedUrl, cek di model nya
    } else { // nah kalo ngga ada image, ngga perlu ada yang di proses, jadi langsung aja
      newData = { ...parsedPayload }
    }
    try {
      const data = await Manufacturer.create(newData)
      response.created({ message: "Berhasil menyimpan data", data })

    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal menyimpan data", error: error.message })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "Manufacturer ID tidak valid" }) }

    try {
      const data = await Manufacturer.query().where('id', id).firstOrFail()
      response.ok({ message: "Berhasil mengambil data", data })
    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal mengambil data", error: error.message })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { id } = params
    if (!uuidValidation(id)) { return response.badRequest({ message: "Class ID tidak valid" }) }
    const payload = await request.validate(UpdateManufacturerValidator)

    if (JSON.stringify(payload) === '{}') {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" })
    }

    const parsedPayload = { ...payload }
    let newData: any

    if (parsedPayload.image) {
      const inventoryPath = Application.makePath('app/Modules/Inventory/uploads/manufacturers/')
      await parsedPayload.image?.move(inventoryPath, {
        name: DateTime.now().toUnixInteger().toString() + "." + parsedPayload.image!.extname
      })
      newData = { ...parsedPayload, image: parsedPayload.image!.fileName }
    } else {
      newData = { ...parsedPayload }
    }
    try {
      const manufacturer = await Manufacturer.findOrFail(id)
      await Drive.use('inventory').delete('manufacturers/' + manufacturer.image[0])
      const data = await manufacturer.merge(newData).save()
      response.created({ message: "Berhasil menyimpan data", data })

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
      await Drive.use('inventory').delete('manufacturers/' + data.image[0])
      response.ok({ message: "Berhasil menghapus data" })
    } catch (error) {
      console.log(error);
      response.badRequest({ message: "Gagal menghapus data", error: error.message })
    }
  }
}
