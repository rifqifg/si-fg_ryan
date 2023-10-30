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
import { CreateRouteHist } from 'App/Modules/Log/Helpers/createRouteHist'
import { statusRoutes } from 'App/Modules/Log/lib/enum'
import { DateTime } from 'luxon'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }

  public async handle(error: any, { request }: HttpContextContract) {
    const dateStart = DateTime.now().toMillis()
    /**
     * Self handle the validation exception
     */
    // console.log(error.messages);

    CreateRouteHist(statusRoutes.ERROR, dateStart, error.code)

    if (error.code === 'E_INVALID_AUTH_PASSWORD') {
      return request.ctx?.response.badRequest({
        message: 'Wrong password',
      })
    }
    if (error.code === 'E_ROW_NOT_FOUND') {
      return request.ctx?.response.badRequest({
        message: 'Data not found',
      })
    }
    if (error.code === 'E_VALIDATION_FAILURE') {
      const data = error.messages

      // Extract the unique error messages from the object
      //@ts-ignore
      const uniqueErrorMessages = Object.values(data).flatMap((errorMessages) => [...new Set(errorMessages)]);
      const combinedData = uniqueErrorMessages.join(' \n ');

      if (uniqueErrorMessages.every(item => typeof item === 'object')) {
        return request.ctx?.response.badRequest({
          message: 'Data tidak valid',
          data: error.messages.errors,
        })
      }else {
        return request.ctx?.response.badRequest({
          message: combinedData,
        })
      }

    }
    if (error.code === 'E_ROUTE_NOT_FOUND') {
      return request.ctx?.response.badRequest({
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
    return super.handle(error, request.ctx!)

    // return request.ctx?.response.status(error.status).send(errorResponse)
  }
}
