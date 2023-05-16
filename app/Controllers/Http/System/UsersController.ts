// import Mail from '@ioc:Adonis/Addons/Mail'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Mail from '@ioc:Adonis/Addons/Mail'
import { string } from '@ioc:Adonis/Core/Helpers'
import User from 'App/Models/User'
import Env from '@ioc:Adonis/Core/Env'
import { v4 as uuidv4 } from 'uuid'
import Hash from '@ioc:Adonis/Core/Hash'
// import Permission from 'App/Models/Permission'
// import PermissionList from 'App/Models/PermissionList'
import Database from '@ioc:Adonis/Lucid/Database'

export default class UsersController {
    public async login({ request, response, auth }: HttpContextContract) {
        const loginSchema = schema.create({
            email: schema.string({ trim: true }, [
                rules.exists({ table: 'users', column: 'email' })
            ]),
            password: schema.string({}, [rules.minLength(6)])
        })

        const payload = await request.validate({ schema: loginSchema })

        try {
            const token = await auth.use('api').attempt(payload.email, payload.password)
            const user = await User.query().where('id', auth.user!.id).preload('roles', query => query.select('name', 'permissions'))

            response.ok({
                message: 'login succesfull',
                token,
                data: user,
            })
        } catch (error) {
            console.log(error);

            return response.badRequest({ "message": 'Invalid credentials', error })
        }
    }

    public async googleSignIn({ally}:HttpContextContract) {
        await ally.use('google').redirect()
    }

    public async googleCallback({ally, auth, response}:HttpContextContract) {
        const provider = ally.use('google').stateless()

        if (provider.accessDenied()) return 'Access Denied'

        if (provider.hasError()) return provider.getError()

        const {token} = await provider.accessToken()

        const userGoogle = await provider.userFromToken(token) 

        const userDetails = {
            email: userGoogle.email,
            name: userGoogle.name,
            socialId: userGoogle.id,
            token: userGoogle.token,
            verified: userGoogle.emailVerificationState,
            provider: 'google',
        }
        try {


            const user = await User.query().where('email', '=', userGoogle.email ? userGoogle.email : '').preload('roles', r => r.select('name', 'permissions')).firstOrFail()
            const tokenAuth = await auth.use('api').login(user)
            
            response.ok({message: 'login berhasil', token: tokenAuth, data: user})
            
        } catch (error) {
            return response.send({message: 'Anda belum memiliki akun', email: userDetails.email})
        }
    }

    public async logout({ auth, response }: HttpContextContract) {
        await auth.use('api').logout()
        await Database.manager.close('pg')
        response.ok({ message: "logged out" })
    }



    public async register({ request, response }: HttpContextContract) {
        let payload = await request.validate({schema: schema.create({
            name: schema.string( [
                rules.minLength(5),
                rules.escape(),
                rules.trim()
            ]),
            email: schema.string( [
                rules.email(),
                rules.unique({ table: 'users', column: 'email' }),
                rules.trim()
            ]),
            role: schema.string( [
                rules.exists({ table: 'roles', column: 'name' }),
                rules.trim()
            ]),
            password: schema.string( [
                rules.minLength(6),
                rules.confirmed()
            ]),
        })})

        const verifyToken = string.generateRandom(64)
    
        try {
            const data = await User.create({...payload, verifyToken})
            
            const FE_URL = Env.get('FE_URL') + verifyToken 

            await Mail.send((message) => {
                message
                    .from(Env.get('SMTP_USERNAME'))
                    .to(data.email)
                    .subject('Welcome Onboard!')
                    .htmlView('emails/registered', { FE_URL })
            })

            response.ok({message: 'Berhasil melakukan register/nSilahkan verifikasi email anda'})
        } catch (error) {
            response.badRequest({message: error.message})
        }
    }

    public async verify({ request, response }: HttpContextContract) {
        const token = request.input('token')
        // return token
        try {
            const user = await User.query().where('verifyToken', token).firstOrFail()

            await user.merge({
                verifyToken: "",
                verified: true
            }).save()

            response.ok({ message: 'Akun sudah terverifikasi' })
        } catch (error) {
            response.badRequest({ message: "email tidak ditemukan / token tidak cocok", error })
        }
    }


    public async password_encrypt({ request, response }: HttpContextContract) {
        const { password } = request.qs()
        const encrypted_password = await Hash.make(password)
        const new_uuid = await uuidv4()
        response.ok({ encrypted_password, new_uuid, password })
    }


    public async resetUserPassword({ request, response, auth }: HttpContextContract) {
        // TODO: old password, new password, confirm password

        const resetUserSchema = schema.create({
            old_password: schema.string({}, [rules.minLength(6)]),
            password: schema.string({}, [rules.minLength(6), rules.confirmed()])
        })

        const payload = await request.validate({ schema: resetUserSchema })

        try {
            const verifyPassword = await auth.use('api').verifyCredentials(auth.user!.email, payload.old_password)
            console.log('password verified', verifyPassword);

        } catch (error) {
            response.unprocessableEntity({ message: 'Password lama salah', error: error.message })
            console.log(error)
            return false
        }

        try {
            const user = await User.findOrFail(auth.user!.id)
            await user.merge({ password: payload.password }).save()

            response.ok({ message: "Password reset success" })
        } catch (error) {
            return response.badRequest(error)
        }
    }

    public async getUsers({ request, response }: HttpContextContract) {
        const { keyword, division = "" } = request.qs()
        try {
            const data = await User.query()
                .preload(division)
                .whereILike('name', '%' + keyword + '%')
            response.ok({ message: "Get data success", data })
        } catch (error) {
            console.log(error);
            response.internalServerError(error)

        }
    }
}
