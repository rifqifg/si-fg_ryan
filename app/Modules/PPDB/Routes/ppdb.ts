import Route from '@ioc:Adonis/Core/Route'
Route.group(() => {
    Route.get('/', () => {
        return "You got here at ppdb"
    })
    Route.post('/register', 'UserStudentCandidatesController.register')
    Route.delete('/user-student-candidates/:id', 'UserStudentCandidatesController.destroy').middleware('auth:api')

    Route.post('/auth/login', 'UserStudentCandidatesController.login')
    Route.post('/auth/logout', 'UserStudentCandidatesController.logout').middleware('auth:ppdb_api')
    Route.get('/auth/verify-email', 'UserStudentCandidatesController.verify')
    Route.post('/auth/google', 'UserStudentCandidatesController.loginGoogle')
    Route.post('/auth/change-password', 'UserStudentCandidatesController.changePassword').middleware('auth:ppdb_api')
    // FIXME: route ini harus bisa dijalankan menggunakan auth, dengan akun yg belum verifikasi
    // Route.get('/auth/ask-new-verification', 'UserStudentCandidatesController.askNewVerification').middleware('auth:ppdb_api')

    Route.get('/settings/guide', 'PpdbSettingsController.showGuide').middleware('auth:api')
    Route.put('/settings/guide', 'PpdbSettingsController.updateGuide').middleware('auth:api')

    Route.get('/settings/is-active', 'PpdbSettingsController.showActiveStatus').middleware('auth:api')
    Route.put('/settings/is-active', 'PpdbSettingsController.updateActiveStatus').middleware('auth:api')

    Route.post('/settings/batches', 'PpdbSettingsController.createBatch').middleware('auth:api')
    Route.put('/settings/batches/:id', 'PpdbSettingsController.updateBatch').middleware('auth:api')
    Route.delete('/settings/batches/:id', 'PpdbSettingsController.deleteBatch').middleware('auth:api')
    Route.get('/settings/batches/:id', 'PpdbSettingsController.showBatch').middleware('auth:api,ppdb_api')
    Route.get('/settings/batches/', 'PpdbSettingsController.indexBatches').middleware('auth:api,ppdb_api')

    Route.resource('/academic-years', 'AcademicYearsController').only(['index']).middleware({ 'index': 'auth:api,ppdb_api' })
    Route.resource('/exam-schedules', 'EntranceExamSchedulesController').only(['index']).middleware({ 'index': 'auth:api,ppdb_api' })

    Route.resource('student-candidates', 'StudentCandidatesController').apiOnly().middleware({ '*': 'auth:api,ppdb_api' })
    Route.shallowResource('student-candidates.parents', 'StudentCandidateParentsController').apiOnly().middleware({
        'index': 'auth:api,ppdb_api',
        'store': 'auth:api,ppdb_api',
        'show': 'auth:api,ppdb_api',
        'update': 'auth:api,ppdb_api',
        'destroy': 'auth:api'
    })
    Route.put('student-candidates/:id/photo-upload', 'StudentCandidatesController.imageUpload').middleware('auth:api,ppdb_api')

    Route.resource('batch-candidates', 'BatchCandidatesController').middleware({
        'index': 'auth:api',
        'show': 'auth:api,ppdb_api',
        'store': 'auth:ppdb_api',
        'update': 'auth:api,ppdb_api',
        'destroy': 'auth:api'
    })
    // Route.group(() => {
    //     Route.get('get-active-batch')
    // }).prefix('helpers')
}).prefix('ppdb').namespace('PPDBControllers')
