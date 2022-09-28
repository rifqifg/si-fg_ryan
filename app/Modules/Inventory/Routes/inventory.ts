import Route from '@ioc:Adonis/Core/Route'
Route.group(() => {
    Route.get('/', () => {
        return "You got here at inventories"
    })
    Route.resource('manufacturers', 'ManufacturersController').apiOnly()
    Route.resource('assets', 'AssetsController').apiOnly()
    Route.resource('asset-statuses', 'AssetStatusesController').apiOnly()
}).prefix('inventories').namespace('InventoryControllers').middleware(['auth'])
