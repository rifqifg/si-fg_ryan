import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { string } from "@ioc:Adonis/Core/Helpers";
import Env from "@ioc:Adonis/Core/Env";
import Database from "@ioc:Adonis/Lucid/Database";
import CreateUserStudentCandidateValidator from "../../Validators/CreateUserStudentCandidateValidator";
import Mail from '@ioc:Adonis/Addons/Mail';
import UserStudentCandidate from '../../Models/UserStudentCandidate';
import USCLoginValidator from '../../Validators/USCLoginValidator';

export default class UserStudentCandidatesController {
    public async register({ request, response }: HttpContextContract) {
        let payload = await request.validate(CreateUserStudentCandidateValidator)

        const token = string.generateRandom(64)
        const actionUrl = `${Env.get('BE_URL')}/ppdb/auth/verify-email?token=${token}`

        let user_sc
        try {
            user_sc = await UserStudentCandidate.create({
                ...payload,
                verifyToken: token,
            })
        } catch (error) {
            return response.internalServerError({
                message: "CO-USC-REG_01: Gagal input data user calon siswa baru",
                error: error.message
            })
        }

        try {
            await Mail.send((message) => {
                message
                    .from(Env.get("SMTP_USERNAME"))
                    .to(payload.email)
                    .subject("Register Akun PPDB FG Telah Berhasil")
                    .htmlView("emails/student_candidate_verify_request", { actionUrl })
            })
        } catch (error) {
            return response.send({ message: "email tidak valid" });
        }

        response.ok({
            message: "Berhasil melakukan register, silahkan verifikasi email anda",
            user_sc,
        })
    }

    public async login({ request, response, auth }: HttpContextContract) {
        const payload = await request.validate(USCLoginValidator)

        try {
            const token = await auth.use('ppdb_api').attempt(payload.email, payload.password, {
                expiresIn: '24 hours'
            })
            const user = await UserStudentCandidate.query()
                .where("id", auth.use('ppdb_api').user!.id)

            response.ok({
                message: "login successful",
                token,
                data: user
            })
        } catch (error) {
            console.log(error)

            return response.badRequest({
                message: "Invalid credentials",
                error: error.message
            });
        }
    }

    public async logout({ auth, response }: HttpContextContract) {
        await auth.use('ppdb_api').revoke()
        await Database.manager.close("pg")
        response.ok({ message: "Berhasil logout" })
    }

    public async verify({ request, response }: HttpContextContract) {
        const token = request.input("token")

        try {
            const usc = await UserStudentCandidate.findByOrFail("verifyToken", token)

            await usc.merge({ verifyToken: "", verified: true }).save()

            response.ok({ message: "Akun berhasil diverifikasi" })
        } catch (error) {
            return response.badRequest({
                message: "email tidak ditemukan / token tidak cocok",
                error: error.message
            })
        }
    }
}
