/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }

  public async handle(error: any, ctx: HttpContextContract) {
    /**
     * Self handle the validation exception
     */
    if (error.code === 'E_INVALID_AUTH_PASSWORD') {
      return ctx.response.badRequest({
        message: 'Wrong password',
      })
    }
    if (error.code === 'E_ROW_NOT_FOUND') {
      return ctx.response.badRequest({
        message: 'Data not found',
      })
    }
    // if (error.code === 'E_VALIDATION_FAILURE') {
    //   return ctx.response.badRequest({
    //     message: error.message,
    //     data: error.messages.errors,
    //   })
    // }
    if (error.code === 'E_ROUTE_NOT_FOUND') {
      return ctx.response.badRequest({
        message: 'Route not found',
      })
    }

    // TODO: di list apa aja code nya, trus di handle diatas
    const errorResponse = {
      code: error.code,
      message: error.message,
      data: error,
      note: 'unhandled exception',
    }
    console.log(errorResponse)
    /**
     * Forward rest of the exceptions to the parent class
     */
    return super.handle(error, ctx)

    // return ctx.response.status(error.status).send(errorResponse)
  }
}
