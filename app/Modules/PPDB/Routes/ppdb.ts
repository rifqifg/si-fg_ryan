import Route from '@ioc:Adonis/Core/Route'
Route.group(() => {
    Route.get('/', () => {
        return "You got here at ppdb"
    })
    Route.post('/register', 'UserStudentCandidatesController.register')

    Route.post('/auth/login', 'UserStudentCandidatesController.login')
    Route.post('/auth/logout', 'UserStudentCandidatesController.logout').middleware('auth:ppdb_api')
    Route.get('/auth/verify-email', 'UserStudentCandidatesController.verify')
}).prefix('ppdb').namespace('PPDBControllers')
