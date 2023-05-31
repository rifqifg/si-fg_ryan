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
    Route.get('sessions', 'SessionsController.index').middleware('auth')
    Route.get('sessions/:id', 'SessionsController.show').middleware('auth')
    Route.shallowResource('daily-attendances', 'DailyAttendancesController').apiOnly().middleware({ '*': ['auth'] })
}).prefix('academics').namespace('AcademicControllers')
