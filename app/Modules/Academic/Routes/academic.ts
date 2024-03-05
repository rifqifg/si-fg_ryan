import Route from "@ioc:Adonis/Core/Route";
Route.group(() => {
  Route.get("/", () => {
    return "You got here at academic";
  });
  Route.resource("classes", "ClassesController").apiOnly().middleware({ "*": ["auth"] });
  Route.shallowResource('jurusan', 'JurusansController').only(['index']).middleware({'index': ['auth']})
  Route.resource("students", "StudentsController").apiOnly().middleware({ '*': ["auth"] });
  Route.resource("subjects", "SubjectsController").apiOnly().middleware({ "*": ["auth"] });
  Route.resource("teachers", "TeachersController").apiOnly().middleware({store: ["auth"],destroy: ["auth"],update: ["auth"],show: ["auth"],});
  Route.resource("teachers.teachings", "TeachingsController").apiOnly().middleware({store: ["auth"],destroy: ["auth"],update: ["auth"],show: ["auth"]})
  Route.shallowResource("students.parents", "StudentParentsController").apiOnly().middleware({ "*": ["auth"] });
  Route.resource("sessions", "SessionsController").only(["index", "show"]).middleware({store: ["auth"],destroy: ["auth"],update: ["auth"],show: ["auth"]});
  Route.shallowResource("daily-attendances", "DailyAttendancesController").apiOnly().except(["update"]).middleware({ "*": ["auth"] });
  Route.put("daily-attendances","DailyAttendancesController.update").middleware(["auth"])
  Route.shallowResource("lesson-attendances", "LessonAttendancesController").apiOnly().middleware({index: ["auth"],destroy: ["auth"],update: ["auth"],show: ["auth"],})
  Route.shallowResource("teacher-attendances", "TeacherAttendancesController").apiOnly().middleware({index: ["auth"],destroy: ["auth"],update: ["auth"],show: ["auth"],})
  Route.shallowResource("kompetensi-inti", "KompetensiIntisController").apiOnly().middleware({ "*": ["auth"] });
  Route.shallowResource("metode-pengambilain-nilai","MetodePengambilanNilaisController").apiOnly().middleware({ "*": ["auth"] });
  Route.shallowResource("program-semester", "ProgramSemestersController").apiOnly().middleware({ "*": ["auth"] });
  Route.post("program-semester/duplicate","ProgramSemestersController.duplicate").middleware("auth");
  Route.get('prosem-no-login', 'ProgramSemestersController.noLogin')
  Route.shallowResource("program-semester.program-semester-detail","ProgramSemesterDetailsController").apiOnly().middleware({store: ["auth"],destroy: ["auth"],update: ["auth"],show: ["auth"],})
  Route.shallowResource("rencana-pengambilan-nilai","RencanaPengambilanNilaisController").apiOnly().middleware({ "*": ["auth"] });
  Route.shallowResource("buku-nilai", "BukuNilaisController").apiOnly().middleware({ "*": ["auth"] });
  Route.post('generate-uts', 'BukuNilaisController.generateUts').middleware("auth")
  Route.delete('multi-delete-buku-nilai', 'BukuNilaisController.deleteManyBukuNilai').middleware("auth")
  Route.shallowResource("import-students", "ImportStudentsController").only(["store"]).apiOnly().middleware({ "*": ["auth"] });
  Route.shallowResource("mutating-many-students","MutatingManyStudentsController").only(["update"]).apiOnly().middleware({ "*": ["auth"] });
  Route.shallowResource("subjects.members", "SubjectMembersController").apiOnly().middleware({ "*": ["auth"] });
  Route.delete("multi-delete-subject-members","SubjectMembersController.deleteMany").middleware("auth")
  Route.shallowResource("agendas", "AgendasController").middleware({ "*": ["auth"] }).apiOnly();
  Route.shallowResource('semesters', 'SemestersController').apiOnly().only(['index'])
  Route.shallowResource('raports', 'RaportsController').apiOnly().middleware({ "*": ["auth"] })
  Route.post('raports/:id/hitung-ulang', 'RaportsController.hitungUlang' ).middleware("auth")
  Route.shallowResource('raports.student-raports', 'StudentRaportsController').apiOnly().middleware({ "*": ["auth"] })
  Route.shallowResource('student-raports.student-raport-details', 'StudentRaportDetailsController').apiOnly().middleware({ "*": ["auth"] })
})
  .prefix("academics")
  .namespace("AcademicControllers");
