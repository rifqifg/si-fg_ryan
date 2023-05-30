import Route from '@ioc:Adonis/Core/Route'
Route.group(() => {
    Route.get('/', () => {
        return "You got here at ppdb"
    })
    Route.resource('user-student-candidates', 'UserStudentCandidatesController').apiOnly()
}).prefix('ppdbs').namespace('PPDBControllers')
