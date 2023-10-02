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

      const student = userObject.roles.find(
        (role) => role.role_name == "student"
      );

      const parent = userObject.roles.find(
        (role) => role.role_name == "parent"
      );

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

      // const data = await Database.rawQuery(`
      //   with results as (
      //   	select program_semester_detail_id , json_build_object('name', bn."type", 'materi', bn.material, 'materi_prosem', psd.materi, 'nilai', jsonb_agg(json_build_object('id', bn.id, 'studentId', bn.student_id, 'value', bn.nilai))) types
      //   	from academic.buku_nilais bn
      //   	left join academic.program_semester_details psd
      //   		on psd.id = bn.program_semester_detail_id
      //   	group by bn."type", bn.material , psd.materi, bn.nilai, bn.program_semester_detail_id
      //   ), bab as (
      //   	select id,  jsonb_build_object('kompetensi_dasar_index', psd2.kompetensi_dasar_index, 'kompetensi_dasar', psd2.kompetensi_dasar, 'type', jsonb_agg(types)  ) bab
      //   	from academic.program_semester_details psd2
      //   	left join results r
      //   		on r.program_semester_detail_id = psd2.id
      //   	group by psd2.id, psd2.kompetensi_dasar_index, psd2.kompetensi_dasar
      //   )

      //   select json_build_object('students', jsonb_agg(json_build_object('name', s."name", 'studentId', s.id)), 'data', json_build_object('teacher_name', e."name", 'teacher_id', t.id, 'class_name', c."name", 'class_id', c.id, 'subject_name', s2."name", 'subject_id', s2.id), 'bab', jsonb_agg(b.bab))
      //   from academic.buku_nilais bn
      //   left join academic.students s
      //   	on s.id = bn.student_id
      //   left join bab b
      //   	on b.id = bn.program_semester_detail_id
      //   left join academic.teachers t
      //   	on t.id = bn.teacher_id
      //   left join public.employees e
      //   	on e.id = t.employee_id
      //   left join academic.classes c
      //   	on c.id = bn.class_id
      //   left join academic.subjects s2
      //   	on s2.id = bn.subject_id
      //   group by e.name, t.id , c.name, c.id, s2."name" , s2.id
      // `);
      //       const data = await Database.rawQuery(
      //         `

      // -- select data nilai
      // select bn.type, bn.material, psd.kompetensi_dasar_index,
      //        psd.materi materi_prosem,
      //        bn.id, st.name, bn.student_id, bn.nilai
      // from academic.buku_nilais bn
      // left join academic.program_semesters ps
      //     on bn.subject_id = ps.subject_id
      // left join  academic.program_semester_details psd
      //     on psd.program_semester_id = ps.id
      // left join academic.students st
      //     on bn.student_id = st.id
      // where bn.subject_id = '205d4ab0-7d79-4154-9d4e-bc346a763fd5'
      //     and st.class_id = '88aac526-b2ed-4c4b-8dd5-048083eee53a'
      // limit 200
      // `
      //       );
      const bukuNilaiData = await BukuNilai.query()
        .if(type, (q) => q.whereILike("type", `%${type}%`))
        .where("class_id", classId)
        .andWhere("subject_id", subjectId)
        .andWhere("teacher_id", teacherId)
        .whereHas("students", (s) => s.whereILike("name", `%${keyword}%`))
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
        );
      const nilais = bukuNilaiData.map((bn) => ({
        id: bn.id,
        studentId: bn.studentId,
        value: bn.nilai,
        materi: bn.material,
      }));
      const types = bukuNilaiData.map((bn) => ({
        type: bn.type,
        prosemDetailId: bn.programSemesterDetailId,
        materi: bn.material,
      }));
      const students = bukuNilaiData.map((bn) => bn.students);
      const prosemDetail = bukuNilaiData.map((bn) => bn.programSemesterDetail);
      // @ts-ignore
      const uniquesStudents = Array.from(
        new Set(students?.map(JSON.stringify))
      )?.map(JSON.parse);
      const uniqueProsemDetails = Array.from(
        new Set(prosemDetail?.map(JSON.stringify))
      )?.map(JSON.parse);
      const uniqueTypeOfBukuNilai = Array.from(
        new Set(types?.map(JSON.stringify))
      )?.map(JSON.parse);
      // return uniqueTypeOfBukuNilai;
      // const bab: {
      //   kompetensi_dasar_index: number | string;
      //   kompetensi_dasar: string;
      //   // type: {
      //   //   name: string
      //   //   materi: string
      //   //   materi_prosem: string | null
      //   //   nilai: {
      //   //     id: string
      //   //     studentId: string
      //   //     value: number
      //   //   }[]
      //   // }[]
      // }[] = [];

      // const groupingBukuNilai = uniqueProsemDetails.map((psd) => {
      //   bukuNilai.map((bn) => {
      //     if (bn?.programSemesterDetailId !== psd?.id) {
      //       console.log({
      //         kompetensi_dasar_index: psd?.kompetensi_dasar_index,
      //         kompetensi_dasar: psd?.kompetensi_dasar,
      //       });
      //       bab.push({
      //         kompetensi_dasar_index: psd?.kompetensi_dasar_index,
      //         kompetensi_dasar: psd?.kompetensi_dasar,
      //       });
      //       // return ;
      //     } else {
      //       console.log({
      //         kompetensi_dasar_index: "penilaian lainnya",
      //         kompetensi_dasar: "",
      //       });
      //       bab.push({
      //         kompetensi_dasar_index: "penilaian lainnya",
      //         kompetensi_dasar: "",
      //       });
      //     }
      //   });
      // });

      // return bab;
      // return uniqueProsemDetails;
      const data = {
        students: uniquesStudents,
        data: {
          teacher_name: bukuNilaiData[0].teachers.employee.name,
          teacher_id: bukuNilaiData[0].teachers.id,
          class_name: bukuNilaiData[0].classes.name,
          class_id: bukuNilaiData[0].classId,
          subject_id: bukuNilaiData[0].subjectId,
          subject_name: bukuNilaiData[0].mapels.name,
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
              name: t.type,
              materi: t.materi,
              materi_prosem: b?.materi,
              nilai: nilais
                .filter((n) => n.materi === t.materi)
                .map((nilai) => ({
                  id: nilai?.id,
                  studentId: nilai?.studentId,
                  value: nilai?.value,
                })),
            })),
          // type: bukuNilaiData
          //   .filter(
          //     (bn) =>
          //       bn?.programSemesterDetailId === b?.id ||
          //       (bn.programSemesterDetailId === null && b === null)
          //   )
          //   .map((bn2) => ({
          //     name: bn2.type,
          //     materi: bn2.material,
          //     materi_prosem: b?.kompetensi_dasar,
          //   })),
        })),
      };

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
            nilai: schema.number(),
            type: schema.enum(["HARIAN", "UTS", "UAS"]),
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
            nilai: schema.number(),
            type: schema.enum(["HARIAN", "UTS", "UAS"]),
            material: schema.string.optional([rules.trim()]),
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
