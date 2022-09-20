import Route from '@ioc:Adonis/Core/Route'
Route.group(() => {
    Route.get('/', () => {
        return "You got here at academic"
    })
    Route.resource('classes', 'ClassesController').apiOnly().middleware({ '*': ['auth'] })
}).prefix('academics').namespace('AcademicControllers')
