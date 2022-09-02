import Route from '@ioc:Adonis/Core/Route'
Route.group(() => {
    Route.get('/', () => {
        return "You got here at inventories"
    })
    Route.resource('manufacturers', 'ManufacturersController').apiOnly()
}).prefix('inventories').namespace('InventoryControllers')
