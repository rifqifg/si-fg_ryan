import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
// import { string } from "@ioc:Adonis/Core/Helpers";
import Env from "@ioc:Adonis/Core/Env";

import CreateUserStudentCandidateValidator from "../../Validators/CreateUserStudentCandidateValidator";
import Mail from '@ioc:Adonis/Addons/Mail';
import UserStudentCandidate from '../../Models/UserStudentCandidate';

export default class UserStudentCandidatesController {
    public async register({ request, response }: HttpContextContract) {
        let payload = await request.validate(CreateUserStudentCandidateValidator)

        // const verifyToken = string.generateRandom(64);
        // const FE_URL = Env.get("FE_URL") + verifyToken;

        let user_sc
        try {
            user_sc = await UserStudentCandidate.create(payload)
        } catch (error) {
            return response.internalServerError({
                message: "Gagal input data user calon siswa baru",
                error: error.message
            })
        }

        // TODO: response mail dan validasi user
        // try {
        //     await Mail.send((message) => {
        //         message
        //             .from(Env.get("SMTP_USERNAME"))
        //             .to(payload.email)
        //             .subject("Welcome Onboard!")
        //         // TODO: html view utk selamat datang
        //         // .htmlView("emails/registered", { FE_URL });
        //     })
        // } catch (error) {
        //     return response.send({ message: "email tidak valid" });
        // }

        response.ok({
            message: "Berhasil melakukan register/nSilahkan verifikasi email anda",
            user_sc,
        })
    }
}
