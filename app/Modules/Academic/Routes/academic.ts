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
    Route.resource('sessions', 'SessionsController').only(['index', 'show']).middleware({ '*': ['auth'] })
    Route.shallowResource('daily-attendances', 'DailyAttendancesController').apiOnly().middleware({ '*': ['auth'] })
    Route.shallowResource('lesson-attendances', 'LessonAttendancesController').apiOnly().middleware({ '*': ['auth'] })
    Route.shallowResource('teacher-attendances', 'TeacherAttendancesController').apiOnly().middleware({ '*': ['auth'] })
}).prefix('academics').namespace('AcademicControllers')
