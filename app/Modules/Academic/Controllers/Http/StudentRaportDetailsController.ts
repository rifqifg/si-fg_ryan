import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { validate as uuidValidation } from "uuid";
import { CreateRouteHist } from "App/Modules/Log/Helpers/createRouteHist";
import { statusRoutes } from "App/Modules/Log/lib/enum";
import { DateTime } from "luxon";
import StudentRaportDetail from "../../Models/StudentRaportDetail";
import Predikat from "../../Models/Predikat";

export default class StudentRaportDetailsController {
  public async index({request, response, params }: HttpContextContract) {
    const {description = false} = request.qs()
    const dateStart = DateTime.now().toMillis();
    CreateRouteHist(statusRoutes.START, dateStart);

    const { student_raport_id: studentRaportId } = params;

    if (!uuidValidation(studentRaportId)) {
      return response.badRequest({ message: "Student Raport ID tidak valid" });
    }

    const raportDescription = description == 'true' || description == true ? true : false
    try {
      const predikat = await Predikat.query().select('*')

      const data = await StudentRaportDetail.query()
        .select("*")
        .where("studentRaportId", studentRaportId)
        .preload("subject")
        .preload("studentRaports", (sr) =>
          (sr.preload(
            "students",
            (s) => (
              s.select("id", "name", "classId", 'nis', 'nisn'),
              s.preload("class", (c) => (c.select("id", "name", 'employeeId'), c.preload('homeroomTeacher'))), s.preload('dailyAttendance')
            )
          ), sr.preload('raport', r =>( r.preload('semester'), r.preload('academicYear'))))
        );

      if (raportDescription) {
        CreateRouteHist(statusRoutes.FINISH, dateStart)
        return response.ok({message: 'Berhasil mengambil data', deskripsi: {
          identitasRaport: {
            school_name: "SMA FUTURE GATE",
            address: "Jl. Yudhistira Komp. Pemda Jatiasih",
            student_name: data[0]?.studentRaports.students.name,
            nis: data[0]?.studentRaports.students?.nis || "",
            nisn: data[0]?.studentRaports.students?.nisn || "",
            kelas: data[0]?.studentRaports.students.class.name,
            semester: data[0]?.studentRaports.raport.semester.semesterName,
            tahun: data[0]?.studentRaports.raport.academicYear.year,
            wali_kelas: data[0]?.studentRaports.students.class.homeroomTeacher.name,
            kepala_sekolah: "M. Zubair Abdurrohman, S.T",
          },
          data: data.filter(item => item.subject.isExtracurricular == false).map(item => ({
            subject_name: item.subject.name,
            subject_id: item.subjectId,
            komepetensi: [
              {
                name: 'Pengetahuan',
                catatan: predikat.find(res => Math.round(item.nilaiPengetahuan) >= res.scoreMinimum && Math.round(item.nilaiPengetahuan) <= res.scoreMaximum && res.type == 'DESCRIPTION' && res.category == 'PENGETAHUAN')?.description
              },
              {
                name: 'Keterampilan',
                catatan: predikat.find(res => Math.round(item.nilaiKeterampilan) >= res.scoreMinimum && Math.round(item.nilaiKeterampilan) <= res.scoreMaximum && res.type == 'DESCRIPTION' && res.category == 'KETERAMPILAN')?.description
              },
              {
                name: 'sikap spiritual dan sosial',
                catatan: predikat.find(res => item.nilaiSikap == res.scoreSikap)?.description
              }
            ]
          }))
        }})
      }

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({
        message: "Berhasil mengambil data",
        umum: {
          identitasRaport: {
            school_name: "SMA FUTURE GATE",
            address: "Jl. Yudhistira Komp. Pemda Jatiasih",
            student_name: data[0]?.studentRaports.students.name,
            nis: data[0]?.studentRaports.students?.nis || "",
            nisn: data[0]?.studentRaports.students?.nisn || "",
            kelas: data[0]?.studentRaports.students.class.name,
            semester: data[0]?.studentRaports.raport.semester.semesterName,
            tahun: data[0]?.studentRaports.raport.academicYear.year,
            wali_kelas: data[0]?.studentRaports.students.class.homeroomTeacher.name,
            kepala_sekolah: "M. Zubair Abdurrohman, S.T",
          },
          data: [
            {
              ekskul: false,
              predikat: data[0]?.studentRaports.deskripsiSikapAntarmapel,
              mapel: data
                .filter((res) => res.subject.isExtracurricular == false)
                .map((res) => ({
                  subject_name: res.subject.name,
                  subject_id: res.subjectId,
                  nilai_pengetahuan: Math.round(res.nilaiPengetahuan),
                  nilai_keterampilan: Math.round(res.nilaiKeterampilan),
                  predikat_pengetahuan: predikat.find(item => res.nilaiPengetahuan >= item.scoreMinimum  && res.nilaiPengetahuan <= item.scoreMaximum && item.type == 'PREDIKAT')?.description ,
                  predikat_keterampilan: predikat.find(item => res.nilaiKeterampilan >= item.scoreMinimum  && res.nilaiKeterampilan <= item.scoreMaximum && item.type == 'PREDIKAT')?.description,
                  sikap_dalam_mapel: res.nilaiSikap,
                })),
            },
          ],
          ketidakHadiran: {
            sakit: data[0]?.studentRaports.students.dailyAttendance.filter(item => item.status == 'sick').length,
            izin: data[0]?.studentRaports.students.dailyAttendance.filter(item => item.status == 'permission').length,
            alpha: data[0]?.studentRaports.students.dailyAttendance.filter(item => item.status == 'absent').length
          }
        },
      });
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message || error,
      });
    }
  }

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
