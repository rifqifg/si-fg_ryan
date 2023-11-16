import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { validate as uuidValidation } from "uuid";
import { CreateRouteHist } from "App/Modules/Log/Helpers/createRouteHist";
import { statusRoutes } from "App/Modules/Log/lib/enum";
import { DateTime } from "luxon";
import StudentRaportDetail from "../../Models/StudentRaportDetail";
import { predikatHalUmum, predikatHelper } from "App/Helpers/predikat";

export default class StudentRaportDetailsController {
  public async index({ response, params }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis();
    CreateRouteHist(statusRoutes.START, dateStart);

    const { student_raport_id: studentRaportId } = params;

    if (!uuidValidation(studentRaportId)) {
      return response.badRequest({ message: "Student Raport ID tidak valid" });
    }

    try {
      const data = await StudentRaportDetail.query()
        .select("*")
        .where("studentRaportId", studentRaportId)
        .preload("subject")
        .preload("studentRaports", (sr) =>
          sr.preload(
            "students",
            (s) => (
              s.select("id", "name", "classId"),
              s.preload("class", (c) => c.select("id", "name"))
            )
          )
        );

      response.ok({
        message: "Berhasil mengambil data",
        umum: {
          identitasRaport: {
            school_name: "SMA FUTURE GATE",
            address: "Jl. Yhudistira",
            student_name: "Jamal",
            nis: "101010",
            nisn: "202020",
            kelas: "XII MIPA 1",
            semester: "Genap",
            tahun: "2022-2023",
            wali_kelas: "Ir. H. Darmawan",
            kepala_sekolah: "M. Zubair Abdurrohman, S.T",
          },
          data: [
            {
              ekskul: false,
              predikat: "SANGAT BERMARTABAT",
              mapel: data
                .filter((res) => res.subject.isExtracurricular == false)
                .map((res) => ({
                  subject_name: res.subject.name,
                  subject_id: res.subjectId,
                  nilai_pengetahuan: res.nilaiPengetahuan,
                  nilai_keterampilan: res.nilaiKeterampilan,
                  predikat_pengetahuan: predikatHalUmum(res.nilaiPengetahuan),
                  predikat_keterampilan: predikatHalUmum(res.nilaiKeterampilan),
                  sikap_dalam_mapel: res.nilaiSikap,
                })),
            },
          ],
          // data: data.filter(res => res.subject.isExtracurricular == false).map(res => ({eksul: false, predikat: 'Sangat bermartabat'}))
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
