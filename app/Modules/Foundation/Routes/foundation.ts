import Route from '@ioc:Adonis/Core/Route'
Route.group(() => {
    Route.get('/', () => {
        return "You got here at Foundation!!!!"
    })

    Route.shallowResource('foundations', 'FoundationsController').apiOnly().middleware({ '*': ['auth'] })

}).prefix('foundation').namespace('FoundationControllers')
