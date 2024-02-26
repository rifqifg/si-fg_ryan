import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Raport from '../../Models/Raport'
import CreateRaportValidator from '../../Validators/CreateRaportValidator'
import { DateTime } from 'luxon'
import { validate as uuidValidation } from "uuid"
import { statusRoutes } from 'App/Modules/Log/lib/enum'
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import UpdateRaportValidator from '../../Validators/UpdateRaportValidator'
import HitungUlangStudentRaportValidator from '../../Validators/HitungUlangStudentRaportValidator'

export default class RaportsController {
  public async index({request, response }: HttpContextContract) {
    const {keyword = "", tahunAjaran = "", semester = ""} = request.qs()
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    try {
      
      const data = await Raport.query()
      .preload('class', c => (c.select('id', 'name', 'kelas_jurusan'), c.preload('jurusan', j => j.select('id', 'kode', 'nama'))))
      .preload('academicYear', ay => ay.select('id', 'year', 'description')).preload('semester', s => s.select('id', 'semester_name', 'is_active', 'description'))
      .preload('studentRaports')
      .whereILike('name', `%${keyword}%`)
      .whereHas('academicYear', ay => (ay.whereLike('year', `%${tahunAjaran}%`), ay.orderBy('year', 'desc')))
      .andWhereHas('semester', s => s.whereILike('semesterName', `%${semester}%`))
      
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({message: 'Berhasil mengambil data', data: data.length > 0 && data.sort((a, b) => {
        // Sort by year in academicYear
        const yearA = parseInt(a.academicYear.year!.split(' ')[0]); // Extract year from the academicYear's year string
        const yearB = parseInt(b.academicYear.year!.split(' ')[0]);
      
        if (yearA !== yearB) {
          return yearA - yearB; // Sort by year
        }
      
        // If the years are the same, sort by name in class
        const nameA = a.class.name!.toUpperCase(); // Convert to uppercase for case-insensitive comparison
        const nameB = b.class.name!.toUpperCase();
      
        if (nameA < nameB) {
          return -1; // Name A comes before name B
        }
        if (nameA > nameB) {
          return 1; // Name B comes before name A
        }
        return 0; // Names are equal
      }) || []})
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      response.badRequest({message: "Gagal mengambil data", error: error.message || error})
    }

  }


  public async store({request, response}: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const payload = await request.validate(CreateRaportValidator)

    try {
      const data = await Raport.create(payload)

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.created({message: 'Berhasil membuat data', data})
    } catch (error) {
      
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      response.badRequest({message: 'Gagal mengambil data', error})
    }
  }

  public async show({response, params}: HttpContextContract) {
    
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const {id} = params

    try {

      const data = await Raport.findOrFail(id)
    
      response.ok({message: 'Berhasil mengambil data', data})
    } catch (error) {
      
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      response.badRequest({message: 'Gagal mengambil data', error})
    }
  }

  public async update({request, response, params}: HttpContextContract) {
    const {id} = params
    
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Subject ID tidak valid" });
    }
    
    const payload = await request.validate(UpdateRaportValidator)

    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    try {
      
      const raport = await Raport.findOrFail(id)

      const data = await raport.merge(payload).save()

      response.ok({message: 'Berhasil memperbarui data', data})

    } catch (error) {
      response.badRequest({message: 'Gagal memperbarui data', error: error.message || error})
    }

  }

  public async destroy({response, params}: HttpContextContract) {
    const {id} = params
    
    if (!uuidValidation(id)) {
      return response.badRequest({ message: "Subject ID tidak valid" });
    }

    try {
      
      const data = await Raport.findOrFail(id)
      await data.delete()

      response.ok({message: 'Berhasil menghapus data'})

    } catch (error) {
      response.badRequest({message: 'Gagal menghapus data', error: error.message || error})
    }
  }

  public async hitungUlang({request, response, params}: HttpContextContract) {
    const {id} = params
    const payload = await request.validate(HitungUlangStudentRaportValidator)

    try {

      const raport = await Raport.findOrFail(id)
      await raport.delete()

      const data = await Raport.create({name: payload.name, fromDate: payload.fromDate, toDate: payload.toDate, semesterId: payload.semesterId, academicYearId: payload.academicYearId, classId: payload.classId})

      response.ok({message: 'Berhasil menghitung ulang raport', data})
      
    } catch (error) {
      response.badRequest({message: 'Gagal menghitung ulang', error: error.message || error})
    }
  }
}