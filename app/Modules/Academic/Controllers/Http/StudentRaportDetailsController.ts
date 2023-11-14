import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { validate as uuidValidation } from "uuid";
import { CreateRouteHist } from "App/Modules/Log/Helpers/createRouteHist";
import { statusRoutes } from "App/Modules/Log/lib/enum";
import { DateTime } from "luxon";
import StudentRaportDetail from "../../Models/StudentRaportDetail";

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
          }
        }
      });
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message || error,
      });
    }
  }

  public async store({ response, params }: HttpContextContract) {
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
              s.select("id", "name"),
              s.preload("bukuNilai", (bn) =>
                bn.select(
                  "id",
                  "nilai",
                  "aspekPenilaian",
                  "nilaiSikap",
                  "subjectId",
                  "material",
                  "type"
                )
              )
            )
          )
        );


      const res = data.map((r) => ({
        id: r.id,
        // subjectId: r.subjectId,
        // subject: r.subject.name,
        nilai: r.studentRaports.students.bukuNilai
          .filter((bn) => bn.subjectId === r.subjectId)
          .filter(
            (bn) =>
              bn.aspekPenilaian == "PENGETAHUAN" ||
              bn.aspekPenilaian == "KETERAMPILAN" ||
              bn.aspekPenilaian == "SIKAP"
          )
          .map((bn) => {
            if (bn.aspekPenilaian == "PENGETAHUAN") {
              // nilaiPengetahuan.push(bn.nilai)
              return { nilaiPengetahuan: bn.nilai, type: bn.type };
            } else if (bn.aspekPenilaian == "KETERAMPILAN") {
              // nilaiKeterampilan.push(bn.nilai)
              return { nilaiKeterampilan: bn.nilai, type: bn.type };
            } else {
              return { nilaiSikap: bn.nilaiSikap, type: bn.type };
            }
            // return {nilaiPengetahuan, nilaiKeterampilan}
          }),
      }));

      function n(data: any, type: string) {
        const harianData = data.filter((item) => item?.type === "HARIAN");
        const utsData = data.filter((item) => item?.type === "UTS");
        const uasData = data.filter((item) => item?.type === "UAS");

        const harianSum = harianData.reduce(
          (sum, item) => sum + parseFloat(type === 'nilaiKeterampilan' ? item?.nilaiKeterampilan : item?.nilaiPengetahuan),
          0
        );
        const utsSum = utsData.reduce(
          (sum, item) => sum + parseFloat(type === 'nilaiKeterampilan' ? item?.nilaiKeterampilan : item?.nilaiPengetahuan),
          0
        );
        const uasWeightedSum =
          0.7 * ((harianSum + utsSum) / (harianData.length + utsData.length)) +
          0.3 * parseFloat(type === 'nilaiKeterampilan' ? uasData[0]?.nilaiKeterampilan : uasData[0]?.nilaiPengetahuan);

        return uasWeightedSum
      }

      const menghitunNilai = (student: any) => {
        const nilaiPengetahuanItems = student.nilai?.filter(
          (item) => "nilaiPengetahuan" in item
        );
        const nilaiKeterampilanItems = student.nilai?.filter(
          (item) => "nilaiKeterampilan" in item
        );
        const nilaiSikapItem = student.nilai?.filter(
          (item) => "nilaiSikap" in item
        );

        return {nilaiPengetahuan: n(nilaiPengetahuanItems, 'nilaiPengetahuan'),
          nilaiKeterampilan: n(nilaiKeterampilanItems, 'nilaiKeterampilan'), nilaiSikap: nilaiSikapItem[0]?.nilaiSikap
        };
      };
// return res
      response.ok({
        message: "Berhasil menyimpan data",
        data
        // data: res.map((r) => ({
        //   id: r.id,
        //   nilaiAkhir: menghitunNilai(r),
        // })),
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
