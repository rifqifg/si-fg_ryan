import Route from '@ioc:Adonis/Core/Route'
Route.group(() => {
    Route.get('/', () => {
        return "You got here at finance!"
    })

}).prefix('finance').namespace('FinanceControllers')
