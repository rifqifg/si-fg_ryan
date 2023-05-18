import Route from '@ioc:Adonis/Core/Route'
Route.group(() => {
    Route.get('/', () => {
        return "You got here at academic"
    })
    Route.resource('classes', 'ClassesController').apiOnly().middleware({ '*': ['auth'] })
    Route.resource('students', 'StudentsController').apiOnly().middleware({ '*': ['auth'] })
    Route.resource('subjects', 'SubjectsController').apiOnly().middleware({ '*': ['auth'] })
    Route.resource('teachers', 'TeachersController').apiOnly().middleware({ '*': ['auth'] })
}).prefix('academics').namespace('AcademicControllers')
