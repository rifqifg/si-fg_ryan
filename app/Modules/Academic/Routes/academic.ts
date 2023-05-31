import Route from '@ioc:Adonis/Core/Route'
Route.group(() => {
    Route.get('/', () => {
        return "You got here at academic"
    })
    Route.resource('classes', 'ClassesController').apiOnly().middleware({ '*': ['auth'] })
    Route.resource('students', 'StudentsController').apiOnly().middleware({ '*': ['auth'] })
    Route.resource('subjects', 'SubjectsController').apiOnly().middleware({ '*': ['auth'] })
    Route.resource('teachers', 'TeachersController').apiOnly().middleware({ '*': ['auth'] })
    Route.resource('teachers.teachings', 'TeachingsController').apiOnly().middleware({ '*': ['auth'] })
    Route.shallowResource('students.parents', 'StudentParentsController').apiOnly().middleware({ '*': ['auth'] })
    Route.shallowResource('kompetensi-inti', 'KompetensiIntisController').apiOnly().middleware({ '*': ['auth'] })
    Route.shallowResource('metode-pengambilain-nilai', 'MetodePengambilanNilaisController').apiOnly().middleware({ '*': ['auth'] })
    Route.shallowResource('mapel.program-semester', 'ProgramSemestersController').apiOnly().middleware({ '*': ['auth'] })
    Route.shallowResource('program-semester.program-semester-detail', 'ProgramSemesterDetailsController').apiOnly().middleware({ '*': ['auth'] })
    Route.shallowResource('rencana-pengambilan-nilai', 'RencanaPengambilanNilaisController').apiOnly().middleware({ '*': ['auth'] })
    Route.shallowResource('buku-nilai', 'BukuNilaisController').apiOnly().middleware({ '*': ['auth'] })

}).prefix('academics').namespace('AcademicControllers')
