import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { validate as uuidValidation } from "uuid";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import BukuNilai from "../../Models/BukuNilai";
import User from "App/Models/User";
import Database from "@ioc:Adonis/Lucid/Database";
import { CreateRouteHist } from "App/Modules/Log/Helpers/createRouteHist";
import { statusRoutes } from "App/Modules/Log/lib/enum";

import GenerateUtValidator from "../../Validators/GenerateUtsValidator";

import { DateTime } from "luxon";
import { formatDate } from "App/Helpers/academic-helper";
import DeleteManyBukuNilaiValidator from "../../Validators/DeleteManyBukuNilaiValidator";

export default class BukuNilaisController {
  public async index({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart);
    const {
      subjectId = "",
      teacherId = "",
      classId = "",
      aspekPenilaian = "",
      type = "",
      keyword = "",
    } = request.qs();
    try {
      const user = await User.query()
        .where("id", auth.user!.id)
        .preload("roles", (r) => r.preload("role"))
        .preload("employee", (e) => (e.select("id"), e.preload("teacher")))
        .preload(
          "studentParents",
          (sp) => (
            sp.select("id", "nik", "name"),
            sp.preload("student", (s) => s.select("id", "name", "nis", "nisn"))
          )
        )
        .firstOrFail();

      const userObject = JSON.parse(JSON.stringify(user));

      const teacher = userObject.roles.find(
        (role) => role.role_name == "teacher"
      );

      // const student = userObject.roles.find(
      //   (role) => role.role_name == "student"
      // );

      // const parent = userObject.roles.find(
      //   (role) => role.role_name == "parent"
      // );

      if (teacher && teacherId !== user.employee.teacher.id)
        return response.badRequest({
          message: "Anda tidak bisa melihat data pengguna lain",
        });

      // if (
      //   (student && studentId !== user.studentId) ||
      //   (parent && studentId !== user.studentParents.studentId)
      // )
      //   return response.badRequest({
      //     message: "Anda tidak bisa melihat data pengguna lain",
      //   });

      // if (!teacherId || !classId || !subjectId) {
      //   return response.badRequest({
      //     message:
      //       "Untuk menampilkan nilai harus ada subjectId, classId dan teacherId",
      //   });
      // }

      const bukuNilaiData = await BukuNilai.query()
        .if(type, (q) => q.whereILike("type", `%${type}%`))
        .where("subject_id", subjectId)
        .andWhere("teacher_id", teacherId)
        .if(classId, q => q.andWhere('classId', classId))
        .if(aspekPenilaian, q => q.andWhere("aspekPenilaian", aspekPenilaian))
        .whereHas("students", (s) => s.whereILike("name", `%${keyword}%`))
        .whereHas("semester", (s) => s.where("is_active", true))
        .andWhereHas("academicYear", (y) => y.where("active", true))
        .preload("classes", (c) => c.select("id", "name"))
        .preload(
          "teachers",
          (t) => (
            t.select("id", "employee_id"),
            t.preload("employee", (e) => e.select("id", "name"))
          )
        )
        .preload("mapels", (m) => m.select("id", "name"))
        .preload("students", (s) => (s.select("id", "name", "classId"), s.preload('class')))
        .preload("programSemesterDetail", (psd) =>
          psd.select("kompetensi_dasar", "kompetensi_dasar_index", "materi")
        )
        .preload("semester", (s) => s.select("*"))
        .preload("academicYear", (ay) => ay.select("*"));

      const types = bukuNilaiData.map((bn) => ({
        type: bn.type,
        prosemDetailId: bn.programSemesterDetailId,
        materi: bn.material,
        tanggalPengambilanNilai: bn.tanggalPengambilanNilai,
      }));
      const tanggalPengambilanNilai = bukuNilaiData.filter(item => item.type == 'HARIAN' ).map(item => item.tanggalPengambilanNilai).sort()

      const students = bukuNilaiData.map((bn) => ({id: bn.students.id, name: bn.students.name, class: bn.students.class.name})); // ekstrak students

      const prosemDetail = bukuNilaiData.map((bn) => bn.programSemesterDetail); // ekstrak prosemDetail

      const uniqueTanggalPengambilanNilaiHarian = Array.from(
        // menghilangkan data student yg duplikat
        // @ts-ignore
        new Set(tanggalPengambilanNilai?.map(JSON.stringify))
        // @ts-ignore
      )?.map(JSON.parse)

      const uniquesStudents = Array.from(
        // menghilangkan data student yg duplikat
        // @ts-ignore
        new Set(students?.map(JSON.stringify))
        // @ts-ignore
      )?.map(JSON.parse);
      const uniqueProsemDetails = Array.from(
        // @ts-ignore
        new Set(prosemDetail?.map(JSON.stringify))
        // @ts-ignore
      )?.map(JSON.parse);
      const uniqueTypeOfBukuNilai = Array.from(
        // @ts-ignore
        new Set(types?.map(JSON.stringify))
        // @ts-ignore
      )?.map(JSON.parse);

      const data = {
        students: uniquesStudents.sort((a, b) =>
          a?.name?.localeCompare(b?.name)
        ),
        data: {
          teacher_name: bukuNilaiData[0]?.teachers.employee?.name,
          teacher_id: bukuNilaiData[0]?.teachers.id,
          class_name: bukuNilaiData[0]?.classes?.name || "ekskul",
          class_id: bukuNilaiData[0]?.classId,
          subject_id: bukuNilaiData[0]?.subjectId,
          subject_name: bukuNilaiData[0]?.mapels.name,
          aspek_penilaian: bukuNilaiData[0]?.aspekPenilaian,
          tahun_ajaran:
            bukuNilaiData[0]?.semester.description +
            " / " +
            bukuNilaiData[0]?.academicYear.description,
          fromDate: uniqueTanggalPengambilanNilaiHarian[0],
          toDate: uniqueTanggalPengambilanNilaiHarian[uniqueTanggalPengambilanNilaiHarian.length - 1]
        },
        bab: uniqueProsemDetails
          .sort((a, b) => {
            if (a === null && b !== null) {
              return 1;
            } else if (a !== null && b === null) {
              return -1;
            } else {
              return 0;
            }
          })
          .map((b) => ({
            kompetensi_dasar_index: b?.kompetensi_dasar_index
              ? b?.kompetensi_dasar_index
              : "penilaian lainnya",
            kompetensi_dasar: b?.kompetensi_dasar ? b?.kompetensi_dasar : "",
            type: uniqueTypeOfBukuNilai
              .filter(
                (type) =>
                  type.prosemDetailId === b?.id ||
                  (type.prosemDetailId === null && b === null)
              )
              .map((t) => ({
                name: aspekPenilaian === "SIKAP" ? "SIKAP" : t.type,
                materi: t.materi,
                materi_prosem: b?.materi,
                tanggal_pengambilan_nilai: t.tanggalPengambilanNilai,
                nilai: bukuNilaiData
                  .filter((n) => n.material == t.materi && formatDate(n.tanggalPengambilanNilai.toString()) === formatDate(t.tanggalPengambilanNilai) || formatDate(n.tanggalPengambilanNilai.toString()) === formatDate(t.tanggalPengambilanNilai) ).filter(bn => aspekPenilaian && aspekPenilaian == bn.aspekPenilaian || !aspekPenilaian && bn.aspekPenilaian == null)
                  .map((nilai) => ({
                    id: nilai?.id,
                    studentId: nilai?.studentId,
                    value:  nilai?.nilai || nilai.nilaiEkskul || nilai.nilaiSikap
                  })),
              })).sort((a, b) => {
                const dateA: any = new Date(a.tanggal_pengambilan_nilai);
                const dateB: any= new Date(b.tanggal_pengambilan_nilai);

                return dateA - dateB;
            })
          })),
      };

      if (data.students.length === 0 || data.bab.length === 0 || !data.data) {
        return response.ok({ message: "Behasil mengambil data", data: [] });
      }

      CreateRouteHist(statusRoutes.FINISH, dateStart);
      response.ok({ message: "Berhasil mengambil data", data });

    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error);
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message,
      });
    }
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart);

    const user = await User.query()
      .where("id", auth.user!.id)
      .preload("roles", (r) => r.preload("role"))
      .preload("employee", (e) => e.preload("teacher", (t) => t.select("id")))
      .firstOrFail();

    const userObject = JSON.parse(JSON.stringify(user));
    const superAdmin = userObject.roles.find(
      (role) => role.role_name === "super_admin"
    );

    const teacher = userObject.roles.find(
      (role) => role.role_name === "teacher"
    );
    let payload;

    const admin = userObject.roles?.find((role) => role.name == "admin");

    const adminAcademic = userObject.roles?.find(
      (role) => role.name == "admin_academic"
    );
    const bukuNilai = await BukuNilai.query().select('*')

    if (
      (teacher && !superAdmin) ||
      (teacher && !admin) ||
      (teacher && !adminAcademic)
    ) {
      const schemaForTeacher = schema.create({
        bukuNilai: schema.array().members(
          schema.object().members({
            subjectId: schema.string([
              rules.uuid({ version: 4 }),
              rules.exists({
                table: "academic.subjects",
                column: "id",
              }),
            ]),
            programSemesterDetailId: schema.string.optional([
              rules.uuid({ version: 4 }),
              rules.exists({
                table: "academic.program_semester_details",
                column: "id",
              }),
            ]),
            academicYearId: schema.number(),
            semesterId: schema.string(),
            nilaiSikap: schema.string.optional(),
            nilaiEkskul: schema.string.optional(),
            aspekPenilaian: schema.string.optional(),
            studentId: schema.string([
              rules.uuid({ version: 4 }),
              rules.exists({
                table: "academic.students",
                column: "id",
              }),
            ]),
            classId: schema.string.optional([
              rules.uuid({ version: 4 }),
              rules.exists({
                table: "academic.classes",
                column: "id",
              }),
            ]),
            teacherId: schema.string([
              rules.uuid({ version: 4 }),
              rules.exists({
                table: "academic.teachers",
                column: "id",
                where: {
                  id: user.employee.teacher.id,
                },
              }),
            ]),
            material: schema.string.optional([rules.trim()]),
            nilai: schema.number.optional(),
            type: schema.enum.optional(["HARIAN", "UTS", "UAS"]),
            tanggalPengambilanNilai: schema.date({ format: "yyyy-MM-dd" }),
          })
        ),
      });
      payload = await request.validate({ schema: schemaForTeacher });

      const existingBukuNilai = bukuNilai.find(item => item.classId === payload.bukuNilai[0]?.classId && item.subjectId === payload.bukuNilai[0]?.subjectId && item.teacherId === payload.bukuNilai[0]?.teacherId && item.type === payload.bukuNilai[0]?.type && item.programSemesterDetailId === payload.bukuNilai[0]?.programSemesterDetailId  && item.academicYearId === payload.bukuNilai[0]?.academicYearId && item.semesterId === payload.bukuNilai[0]?.semesterId && item.aspekPenilaian === payload.bukuNilai[0]?.aspekPenilaian && formatDate(item.tanggalPengambilanNilai.toString()) === formatDate(payload.bukuNilai[0]?.tanggalPengambilanNilai) || item.classId === payload.bukuNilai[0]?.classId && item.subjectId === payload.bukuNilai[0]?.subjectId && item.teacherId === payload.bukuNilai[0]?.teacherId && item.type === payload.bukuNilai[0]?.type && item.programSemesterDetailId === payload.bukuNilai[0]?.programSemesterDetailId  && item.academicYearId === payload.bukuNilai[0]?.academicYearId && item.semesterId === payload.bukuNilai[0]?.semesterId && item.aspekPenilaian === payload.bukuNilai[0]?.aspekPenilaian && formatDate(item.tanggalPengambilanNilai.toString()) === formatDate(payload.bukuNilai[0]?.tanggalPengambilanNilai) && item.material === payload.bukuNilai[0]?.material || item.classId === payload.bukuNilai[0]?.classId && item.subjectId === payload.bukuNilai[0]?.subjectId && item.teacherId === payload.bukuNilai[0]?.teacherId && item.type === payload.bukuNilai[0]?.type &&  item.academicYearId === payload.bukuNilai[0]?.academicYearId && item.semesterId === payload.bukuNilai[0]?.semesterId && item.aspekPenilaian === payload.bukuNilai[0]?.aspekPenilaian && formatDate(item.tanggalPengambilanNilai.toString()) === formatDate(payload.bukuNilai[0]?.tanggalPengambilanNilai) && item.material === payload.bukuNilai[0]?.material || item.classId === payload.bukuNilai[0]?.classId && item.subjectId === payload.bukuNilai[0]?.subjectId && item.teacherId === payload.bukuNilai[0]?.teacherId &&  item.academicYearId === payload.bukuNilai[0]?.academicYearId && item.semesterId === payload.bukuNilai[0]?.semesterId && item.aspekPenilaian === payload.bukuNilai[0]?.aspekPenilaian && formatDate(item.tanggalPengambilanNilai.toString()) === formatDate(payload.bukuNilai[0]?.tanggalPengambilanNilai) && item.material === payload.bukuNilai[0]?.material || item.classId === payload.bukuNilai[0]?.classId && item.subjectId === payload.bukuNilai[0]?.subjectId && item.teacherId === payload.bukuNilai[0]?.teacherId &&  item.academicYearId === payload.bukuNilai[0]?.academicYearId && item.semesterId === payload.bukuNilai[0]?.semesterId && item.aspekPenilaian === payload.bukuNilai[0]?.aspekPenilaian && formatDate(item.tanggalPengambilanNilai.toString()) === formatDate(payload.bukuNilai[0]?.tanggalPengambilanNilai) || item.subjectId === payload.bukuNilai[0]?.subjectId && item.teacherId === payload.bukuNilai[0]?.teacherId && item.semesterId === payload.bukuNilai[0]?.semesterId && item.academicYearId === payload.bukuNilai[0]?.academicYearId && formatDate(item.tanggalPengambilanNilai.toString()) === formatDate(payload.bukuNilai[0]?.tanggalPengambilanNilai))


      if (existingBukuNilai) {
        return response.status(406).notAcceptable({message: 'nilai dengan materi dan tanggal pengambilan nilai sudah tersedia'})
      }

      try {
      } catch (error) {
        CreateRouteHist(statusRoutes.ERROR, dateStart,  error.message || error);
        return response.badRequest({
          message: "Masukkan nilai sesuai dengan ID anda",
          error: error.message,
        });
      }
    } else {


      const schemaForAdmin = schema.create({
        bukuNilai: schema.array().members(
          schema.object().members({
            subjectId: schema.string([
              rules.uuid({ version: 4 }),
              rules.exists({
                table: "academic.subjects",
                column: "id",
              }),
            ]),
            programSemesterDetailId: schema.string.optional([
              rules.uuid({ version: 4 }),
              rules.exists({
                table: "academic.program_semester_details",
                column: "id",
              }),
            ]),
            academicYearId: schema.number(),
            semesterId: schema.string(),
            nilaiSikap: schema.string.optional(),
            nilaiEkskul: schema.string.optional(),
            aspekPenilaian: schema.string.optional(),
            studentId: schema.string([
              rules.uuid({ version: 4 }),
              rules.exists({
                table: "academic.students",
                column: "id",
              }),
            ]),
            classId: schema.string.optional([
              rules.uuid({ version: 4 }),
              rules.exists({
                table: "academic.classes",
                column: "id",
              }),
            ]),
            teacherId: schema.string([
              rules.uuid({ version: 4 }),
              rules.exists({
                table: "academic.teachers",
                column: "id",
              }),
            ]),
            nilai: schema.number.optional(),
            type: schema.enum.optional(["HARIAN", "UTS", "UAS"]),
            material: schema.string.optional([rules.trim()]),
            tanggalPengambilanNilai: schema.date({ format: "yyyy-MM-dd" }),
          })
        ),
      });
      payload = await request.validate({ schema: schemaForAdmin });

      const existingBukuNilai = bukuNilai.find(item => item.classId === payload.bukuNilai[0]?.classId && item.subjectId === payload.bukuNilai[0]?.subjectId && item.teacherId === payload.bukuNilai[0]?.teacherId && item.type === payload.bukuNilai[0]?.type && item.programSemesterDetailId === payload.bukuNilai[0]?.programSemesterDetailId  && item.academicYearId === payload.bukuNilai[0]?.academicYearId && item.semesterId === payload.bukuNilai[0]?.semesterId && item.aspekPenilaian === payload.bukuNilai[0]?.aspekPenilaian && formatDate(item.tanggalPengambilanNilai.toString()) === formatDate(payload.bukuNilai[0]?.tanggalPengambilanNilai) || item.classId === payload.bukuNilai[0]?.classId && item.subjectId === payload.bukuNilai[0]?.subjectId && item.teacherId === payload.bukuNilai[0]?.teacherId && item.type === payload.bukuNilai[0]?.type && item.programSemesterDetailId === payload.bukuNilai[0]?.programSemesterDetailId  && item.academicYearId === payload.bukuNilai[0]?.academicYearId && item.semesterId === payload.bukuNilai[0]?.semesterId && item.aspekPenilaian === payload.bukuNilai[0]?.aspekPenilaian && formatDate(item.tanggalPengambilanNilai.toString()) === formatDate(payload.bukuNilai[0]?.tanggalPengambilanNilai) && item.material === payload.bukuNilai[0]?.material || item.classId === payload.bukuNilai[0]?.classId && item.subjectId === payload.bukuNilai[0]?.subjectId && item.teacherId === payload.bukuNilai[0]?.teacherId && item.type === payload.bukuNilai[0]?.type &&  item.academicYearId === payload.bukuNilai[0]?.academicYearId && item.semesterId === payload.bukuNilai[0]?.semesterId && item.aspekPenilaian === payload.bukuNilai[0]?.aspekPenilaian && formatDate(item.tanggalPengambilanNilai.toString()) === formatDate(payload.bukuNilai[0]?.tanggalPengambilanNilai) && item.material === payload.bukuNilai[0]?.material || item.classId === payload.bukuNilai[0]?.classId && item.subjectId === payload.bukuNilai[0]?.subjectId && item.teacherId === payload.bukuNilai[0]?.teacherId &&  item.academicYearId === payload.bukuNilai[0]?.academicYearId && item.semesterId === payload.bukuNilai[0]?.semesterId && item.aspekPenilaian === payload.bukuNilai[0]?.aspekPenilaian && formatDate(item.tanggalPengambilanNilai.toString()) === formatDate(payload.bukuNilai[0]?.tanggalPengambilanNilai) && item.material === payload.bukuNilai[0]?.material || item.classId === payload.bukuNilai[0]?.classId && item.subjectId === payload.bukuNilai[0]?.subjectId && item.teacherId === payload.bukuNilai[0]?.teacherId &&  item.academicYearId === payload.bukuNilai[0]?.academicYearId && item.semesterId === payload.bukuNilai[0]?.semesterId && item.aspekPenilaian === payload.bukuNilai[0]?.aspekPenilaian && formatDate(item.tanggalPengambilanNilai.toString()) === formatDate(payload.bukuNilai[0]?.tanggalPengambilanNilai) || item.subjectId === payload.bukuNilai[0]?.subjectId && item.teacherId === payload.bukuNilai[0]?.teacherId && item.semesterId === payload.bukuNilai[0]?.semesterId && item.academicYearId === payload.bukuNilai[0]?.academicYearId && formatDate(item.tanggalPengambilanNilai.toString()) === formatDate(payload.bukuNilai[0]?.tanggalPengambilanNilai))


      if (existingBukuNilai) {
        return response.status(406).notAcceptable({message: 'nilai dengan materi dan tanggal pengambilan nilai sudah tersedia'})
      }
    }

    try {
      const data = await BukuNilai.createMany(payload.bukuNilai);
      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      response.badRequest({
        message: "Gagal menyimpan data",
        error: error.message,
      });
    }
  }

  public async show({ response, params }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart);
    const { id } = params;

    try {
      const data = await BukuNilai.query()
        .where("id", id)
        .preload("mapels", (m) => m.select("name"))
        .preload("teachers", (t) =>
          t.preload("employee", (e) => e.select("name"))
        )
        .preload("programSemesterDetail", (prosemDetail) =>
          prosemDetail.select("kompetensiDasar", "materi")
        )
        .preload("students", (s) => s.select("name", "nis", "nisn"))
        .preload("classes", (c) => c.select("name"))
        .firstOrFail();

      CreateRouteHist(statusRoutes.FINISH, dateStart)
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error)
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message,
      });
    }
  }

  public async update({
    request,
    response,
    params,
    auth,
  }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id))
      return response.badRequest({ message: "Buku Nilai ID tidak valid" });

    const user = await User.query()
      .where("id", auth.user!.id)
      .preload("roles", (r) => r.select("*"))
      .preload("employee", (e) => e.preload("teacher", (t) => t.select("id")))
      .firstOrFail();
    const userObject = JSON.parse(JSON.stringify(user));
    const superAdmin = userObject.roles.find(
      (role) => role.role_name === "super_admin"
    );

    const admin = userObject.roles?.find((role) => role.name == "admin");
    const adminAcademic = userObject.roles?.find(
      (role) => role.name == "admin_academic"
    );

    const teacher = userObject.roles.find(
      (role) => role.role_name === "teacher"
    );
    let payload;
    if (
      (teacher && !superAdmin) ||
      (teacher && !admin) ||
      (teacher && !adminAcademic)
    ) {
      try {
        const teacherId = await User.query()
          .where("id", user ? user.id : "")
          .preload("employee", (e) =>
            e.preload("teacher", (t) => t.select("id"))
          )
          .firstOrFail();

        const schemaForTeacher = schema.create({
          subjectId: schema.string.optional([
            rules.uuid({ version: 4 }),
            rules.exists({
              table: "academic.subjects",
              column: "id",
            }),
          ]),
          programSemesterDetailId: schema.string.optional([
            rules.uuid({ version: 4 }),
            rules.exists({
              table: "academic.program_semester_details",
              column: "id",
            }),
          ]),
          studentId: schema.string.optional([
            rules.uuid({ version: 4 }),
            rules.exists({
              table: "academic.students",
              column: "id",
            }),
          ]),
          classId: schema.string.optional([
            rules.uuid({ version: 4 }),
            rules.exists({
              table: "academic.classes",
              column: "id",
            }),
          ]),
          teacherId: schema.string.optional([
            rules.uuid({ version: 4 }),
            rules.exists({
              table: "academic.teachers",
              column: "id",
              where: {
                id: teacherId.employee.teacher.id,
              },
            }),
          ]),
          material: schema.string.optional([rules.trim()]),
          nilai: schema.number.optional(),
          type: schema.enum.optional(["HARIAN", "UTS", "UAS"]),
          academicYearId: schema.number.optional(),
          semesterId: schema.string.optional(),
          nilaiEkskul: schema.string.optional(),
          nilaiSikap: schema.string.optional(),
          aspekPenilaian: schema.string.optional(),
          tanggalPengambilanNilai: schema.date.optional({
            format: "yyyy-MM-dd",
          }),
        });
        payload = await request.validate({ schema: schemaForTeacher });
      } catch (error) {
        return response.badRequest({
          message: "Masukkan nilai sesuai dengan ID anda",
          error: error.message,
        });
      }
    } else {
      const schemaForAdmin = schema.create({
        subjectId: schema.string.optional([
          rules.uuid({ version: 4 }),
          rules.exists({
            table: "academic.subjects",
            column: "id",
          }),
        ]),
        programSemesterDetailId: schema.string.optional([
          rules.uuid({ version: 4 }),
          rules.exists({
            table: "academic.program_semester_details",
            column: "id",
          }),
        ]),
        studentId: schema.string.optional([
          rules.uuid({ version: 4 }),
          rules.exists({
            table: "academic.students",
            column: "id",
          }),
        ]),
        academicYearId: schema.number.optional(),
        semesterId: schema.string.optional(),
        nilaiEkskul: schema.string.optional(),
        nilaiSikap: schema.string.optional(),
        aspekPenilaian: schema.string.optional(),
        teacherId: schema.string.optional([
          rules.uuid({ version: 4 }),
          rules.exists({
            table: "academic.teachers",
            column: "id",
          }),
        ]),
        classId: schema.string.optional([
          rules.uuid({ version: 4 }),
          rules.exists({
            table: "academic.classes",
            column: "id",
          }),
        ]),
        nilai: schema.number.optional(),
        material: schema.string.optional([rules.trim()]),
        type: schema.enum.optional(["HARIAN", "UTS", "UAS"]),
        tanggalPengambilanNilai: schema.date.optional({ format: "yyyy-MM-dd" }),
      });
      payload = await request.validate({ schema: schemaForAdmin });
    }

    if (JSON.stringify(payload) === "{}") {
      return response.badRequest({ message: "Data tidak boleh kosong" });
    }

    try {
      const bn = await BukuNilai.findOrFail(id);
      const data = await bn.merge(payload).save();

      response.ok({ message: "Berhasil memperbarui data", data });
    } catch (error) {
      response.badRequest({
        message: "Gagal memperbarui data",
        error: error.message,
      });
    }
  }

  public async destroy({ response, params }: HttpContextContract) {
    const { id } = params;
    if (!uuidValidation(id))
      return response.badRequest({ message: "Mapel ID tidak valid" });
    try {
      const data = await BukuNilai.findOrFail(id);
      await data.delete();

      response.ok({ message: "Berhasil menghapus data" });
    } catch (error) {
      response.badRequest({
        message: "Gagal menghapus data",
        error: error.message,
      });
    }
  }

  // TODO: Fix supaya bisa generate uts di tanggal akhir yg sama dgn tanggal pengambilan nilai harian
  public async generateUts({ request, response }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    CreateRouteHist(statusRoutes.START, dateStart)
    const payload = await request.validate(GenerateUtValidator);
    const { subjectId, teacherId, classId, aspekPenilaian, fromDate, toDate } =
      payload;

    const bukuNilaiData = await BukuNilai.query()
      .where("class_id", classId)
      .andWhere("subject_id", subjectId)
      .andWhere("teacher_id", teacherId)
      .andWhere("aspekPenilaian", aspekPenilaian);

    // TODO: test ini ditaruh sebelum bukuNilaiData
    if (aspekPenilaian === "SIKAP") {
      return response.badRequest({
        message: "Aspek Sikap tidak bisa di generate UTS",
      });
    }

    const utsData = await Database.rawQuery(`
          select bn.student_id, round(avg(bn.nilai), 2) uts, bn.subject_id, bn.class_id, bn.teacher_id, bn.aspek_penilaian, bn.semester_id, bn.academic_year_id, bn.tanggal_pengambilan_nilai
          from academic.buku_nilais bn
                   left join academic.semesters s
                             on s.id = bn.semester_id
                   left join academic.academic_years ay
                             on ay.id = bn.academic_year_id
          where bn.aspek_penilaian = '${aspekPenilaian}'
            and ay.active = true
            and s.is_active = true
            and bn.class_id = '${classId}'
            and bn.teacher_id = '${teacherId}'
            and bn.subject_id = '${subjectId}'
            and bn.type = 'HARIAN'
            and bn.tanggal_pengambilan_nilai between '${fromDate}' and '${toDate}'
          group by bn.student_id, bn.subject_id, bn.class_id, bn.teacher_id, bn.aspek_penilaian, bn.semester_id, bn.academic_year_id, bn.tanggal_pengambilan_nilai
          order by bn.student_id
          `)

    if (Boolean(bukuNilaiData.find((bn) => bn.type == "UTS"))) {
      const updateUts = utsData.rows.map((uts) => ({
        nilai: uts?.uts,
        studentId: uts?.student_id,
      }));

      const utsIds = bukuNilaiData
        .filter((bn) => bn.type == "UTS")
        .map((uts) => ({ id: uts.id, studentId: uts.studentId }));

      const result: any = utsIds.map((utsIdItem) => {
        const studentIdToFind = utsIdItem.studentId;
        const updateUtsItem = updateUts.find(
          (updateUtsItem) => updateUtsItem.studentId === studentIdToFind
        );

        if (updateUtsItem) {
          return { id: utsIdItem.id, nilai: +updateUtsItem.nilai };
        } else {
          return `Data dengan studentId ${studentIdToFind} tidak ditemukan.`;
        }
      });

      try {
        await BukuNilai.updateOrCreateMany("id", result);

        CreateRouteHist(statusRoutes.FINISH, dateStart);
        return response.ok({ message: "UTS telah berhasil diperbarui" });
      } catch (error) {
        CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error);
        response.badRequest({ message: "Gagal memperbarui uts", error });
      }
    } else {
      const utsDataFixedTglPengambilanNilai = utsData.rows.map((uts) => {
        const someDate = DateTime.fromISO("2023-10-22T17:00:00.000Z").setZone('UTC+7');
        uts.tanggal_pengambilan_nilai = someDate.toString().slice(0, 10)

        return uts;
      })

      // cek jika ada tanggal pengambilan harian yg sama dengan input tanggal akhir (toDate)
      // jika ada, reject
      // NOTE: ini temporary fix
      const toDateSliced = toDate.toString().slice(0, 10);
      if (utsDataFixedTglPengambilanNilai.find((uts) => uts.tanggal_pengambilan_nilai === toDateSliced)) {
        return response.badRequest({ message: `Tanggal Akhir tidak boleh sama dengan tanggal yang ada di data harian (${toDateSliced})` })
      }

      const utsPayload = utsData.rows.map((uts) => ({
        studentId: uts.student_id,
        subjectId: uts.subject_id,
        classId: uts.class_id,
        teacherId: uts.teacher_id,
        semesterId: uts.semester_id,
        aspekPenilaian: uts.aspek_penilaian,
        academicYearId: uts.academic_year_id,
        type: "UTS",
        material: "UTS",
        tanggalPengambilanNilai: toDateSliced, //new Date().toISOString().slice(0, 10),
        nilai: uts.uts,
      }));

      try {
        await BukuNilai.createMany(utsPayload);
        CreateRouteHist(statusRoutes.FINISH, dateStart);
        return response.created({ message: "uts generated successfully" });
      } catch (error) {
        CreateRouteHist(statusRoutes.ERROR, dateStart, error.message || error);
        return response.badRequest({
          message: "Gagal menghitung nilai UTS",
          error,
        });
      }
    }
  }

  public async deleteManyBukuNilai({request, response}: HttpContextContract) {
    const payload = await request.validate(DeleteManyBukuNilaiValidator)

    try {
      const bukuNilaiIds = payload.bukuNilai.map(bn => bn.id)
      const bukuNilai = await BukuNilai.query().whereIn('id', bukuNilaiIds).delete()

      response.ok({message: 'Berhasil menghapus buku nilai'})
    } catch (error) {
      response.badRequest({message: 'Gagal menghapus buku nilai'})
    }
  }
}
