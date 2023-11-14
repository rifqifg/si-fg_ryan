import Route from '@ioc:Adonis/Core/Route'
Route.group(() => {
    Route.get('/', () => {
        return "You got here at finance!!!!"
    })

    Route.resource('master-billings', 'MasterBillingsController').apiOnly().middleware({ '*': ['auth'] })
    Route.resource('coas', 'CoasController').apiOnly().middleware({ '*': ['auth:api'] })
    Route.get('billings/recap-billing/:id', 'BillingsController.recapBilling').middleware(['auth:api,parent_api'])
    Route.post('billings/generate-broadcast-data', 'BillingsController.generateBillingBroadacstFormat').middleware(['auth'])
    Route.resource('billings', 'BillingsController').apiOnly().except(['update']).middleware({ '*': ['auth:api,parent_api'] })
    Route.put('billings', 'BillingsController.update').middleware(['auth'])
    Route.post('billings/import', 'BillingsController.import').middleware(['auth:api'])
    Route.resource('accounts', 'AccountsController').apiOnly().middleware({ '*': ['auth'] })
    Route.post('accounts/import', 'AccountsController.import').middleware(['auth:api'])
    Route.post('accounts/last-account-no', 'AccountsController.lastAccountNo').middleware(['auth:api'])
    Route.resource('transactions', 'TransactionsController').apiOnly().middleware({ '*': ['auth'] })
    Route.resource('transaction-documents', 'TransactionDocumentsController').apiOnly().middleware({
        'index': ['auth:api,parent_api'],
        'store': ['auth:parent_api'],
        'update': ['auth:api,parent_api'],
        'destroy': ['auth:api,parent_api']
    })
    Route.resource('revenues', 'RevenuesController').apiOnly().except(['update']).middleware({ '*': ['auth'] })
    Route.put('revenues', 'RevenuesController.update').middleware(['auth'])
    Route.post('revenues/import', 'RevenuesController.import').middleware(['auth:api'])
    Route.put('transaction-billings', 'TransactionBillingsController.update').middleware(['auth'])
    Route.get('transaction-billings', 'TransactionBillingsController.index').middleware(['auth'])
    Route.delete('transaction-billings', 'TransactionBillingsController.destroy').middleware(['auth'])

}).prefix('finance').namespace('FinanceControllers')
