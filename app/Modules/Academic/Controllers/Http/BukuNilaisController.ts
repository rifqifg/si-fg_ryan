import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { validate as uuidValidation } from "uuid";
import { schema, rules } from "@ioc:Adonis/Core/Validator";
import BukuNilai from "../../Models/BukuNilai";
import User from "App/Models/User";
import Database from "@ioc:Adonis/Lucid/Database";
export default class BukuNilaisController {
  public async index({ request, response, auth }: HttpContextContract) {
    const {
      subjectId = "",
      teacherId = "",
      classId = "",
      aspekPenilaian = "",
      type = "",
      keyword = "",
      generateUts = false,
      startDate = "",
      endDate = ""
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

      if (!teacherId || !classId || !subjectId) {
        return response.badRequest({
          message:
            "Untuk menampilkan nilai harus ada subjectId, classId dan teacherId",
        });
      }

      const bukuNilaiData = await BukuNilai.query()
        .if(type, (q) => q.whereILike("type", `%${type}%`))
        .where("class_id", classId)
        .andWhere("subject_id", subjectId)
        .andWhere("teacher_id", teacherId)
        .andWhere('aspekPenilaian', aspekPenilaian)
        .whereHas("students", (s) => s.whereILike("name", `%${keyword}%`))
        .whereHas('semester', s => s.where('is_active', true))
        .andWhereHas('academicYear', y => y.where('active', true))
        .preload("classes", (c) => c.select("id", "name"))
        .preload(
          "teachers",
          (t) => (
            t.select("id", "employee_id"),
            t.preload("employee", (e) => e.select("id", "name"))
          )
        )
        .preload("mapels", (m) => m.select("id", "name"))
        .preload("students", (s) => s.select("id", "name"))
        .preload("programSemesterDetail", (psd) =>
          psd.select("kompetensi_dasar", "kompetensi_dasar_index", "materi")
        ).preload('semester', s => s.select('*')).preload('academicYear', ay => ay.select('*'))
        // return bukuNilaiData
      const nilais = bukuNilaiData.map((bn) => ({
        id: bn.id,
        studentId: bn.studentId,
        value: aspekPenilaian !== 'SIKAP' ? bn.nilai : bn.nilaiSikap,
        materi: bn.material,
      }));

      

      const types = bukuNilaiData.map((bn) => ({
        type: bn.type,
        prosemDetailId: bn.programSemesterDetailId,
        materi: bn.material,
        tanggalPengambilanNilai: bn.tanggalPengambilanNilai
      }));

      const students = bukuNilaiData.map((bn) => bn.students); // ekstrak students

      const prosemDetail = bukuNilaiData.map((bn) => bn.programSemesterDetail); // ekstrak prosemDetail

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

      const uts = generateUts === "true" ? true : false

      if (uts) {

        if (aspekPenilaian === 'SIKAP') {
          return response.badRequest({message: 'Aspek Sikap tidak bisa di generate UTS'})
        }

        const utsData = await Database.rawQuery(`
        select bn.student_id, round(avg(bn.nilai), 2) uts
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
          and bn.tanggal_pengambilan_nilai between '${startDate}' and '${endDate}'
        group by bn.student_id
        order by bn.student_id
        `)

        const utsNilai = utsData.rows.map(n => ({studentId: n.student_id, value: n.uts, materi: 'uts'}))
        // return uniqueTypeOfBukuNilai
        uniqueTypeOfBukuNilai.push({type: 'uts', materi: 'uts', prosemDetailId: null })
        nilais.push(...utsNilai)
        // return nilais

        // return utsData.rows
      }

      const data = {
        students: uniquesStudents,
        data: {
          teacher_name: bukuNilaiData[0]?.teachers.employee.name,
          teacher_id: bukuNilaiData[0]?.teachers.id,
          class_name: bukuNilaiData[0]?.classes.name,
          class_id: bukuNilaiData[0]?.classId,
          subject_id: bukuNilaiData[0]?.subjectId,
          subject_name: bukuNilaiData[0]?.mapels.name,
          aspek_penilaian: bukuNilaiData[0]?.aspekPenilaian,
          tahun_ajaran: bukuNilaiData[0]?.semester.description + " / " + bukuNilaiData[0]?.academicYear.description
        },
        bab: uniqueProsemDetails.map((b) => ({
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
              tanggal_pengambilan_nilai: b?.tanggalPengambilanNilai,
              nilai: nilais
                .filter((n) => n.materi === t.materi )
                .map((nilai) => ({
                  id: nilai?.id,
                  studentId: nilai?.studentId,
                  value: nilai?.value,
                })),
            })),
        })),
      };

      if (data.students.length === 0 || data.bab.length === 0 || !data.data) {
        return response.ok({ message: "Behasil mengambil data", data: [] });
      }

      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
      response.badRequest({
        message: "Gagal mengambil data",
        error: error.message,
      });
    }
  }

  public async store({ request, response, auth }: HttpContextContract) {
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
            aspekPenilaian: schema.string(),
            studentId: schema.string([
              rules.uuid({ version: 4 }),
              rules.exists({
                table: "academic.students",
                column: "id",
              }),
            ]),
            classId: schema.string([
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
            tanggalPengambilanNilai: schema.date({format: 'yyyy-MM-dd'})
          })
        ),
      });
      payload = await request.validate({ schema: schemaForTeacher });
      try {
      } catch (error) {
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
            aspekPenilaian: schema.string(),
            studentId: schema.string([
              rules.uuid({ version: 4 }),
              rules.exists({
                table: "academic.students",
                column: "id",
              }),
            ]),
            classId: schema.string([
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
            tanggalPengambilanNilai: schema.date({format: 'yyyy-MM-dd'}),
          })
        ),
      });
      payload = await request.validate({ schema: schemaForAdmin });
    }

    try {
      const data = await BukuNilai.createMany(payload.bukuNilai);

      response.ok({ message: "Berhasil menyimpan data", data });
    } catch (error) {
      response.badRequest({
        message: "Gagal menyimpan data",
        error: error.message,
      });
    }
  }

  public async show({ response, params }: HttpContextContract) {
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
      response.ok({ message: "Berhasil mengambil data", data });
    } catch (error) {
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
          nilaiSikap: schema.string.optional(),
          aspekPenilaian: schema.string.optional(),
          tanggalPengambilanNilai: schema.date.optional({format: 'yyyy-MM-dd'})
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
        tanggalPengambilanNilai: schema.date.optional({format: 'yyyy-MM-dd'})
      });
      payload = await request.validate({ schema: schemaForAdmin });
    }

    if (JSON.stringify(payload) === "{}") {
      console.log("data update kosong");
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
}
