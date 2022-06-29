import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CheckRole {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>, allowedRole?: string[]) {
    const { role } = auth.user!

    if (!allowedRole?.find(v => v == role)) {
      return response.unauthorized({
        message: "Anda tidak berhak mengakses halaman ini"
      })
    }
    await next()
  }
}
