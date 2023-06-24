import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import CreateImportStudentValidator from '../../Validators/CreateImportStudentValidator'
import Student from '../../Models/Student'
import Class from '../../Models/Class'
// import StudentParent from '../../Models/StudentParent'
const Excel = require('exceljs')

export default class ImportStudentsController {
    public async store({ request, response }: HttpContextContract) {
        let payload = await request.validate(CreateImportStudentValidator)
        let fname = `${new Date().getTime()}.${payload.upload.extname}`
        let dir = 'upload/'

        // move uploaded file into custom folder
        await payload.upload.move(Application.tmpPath(dir), {
            name: fname
        })

        await ImportService.ImportClassification('tmp/' + dir + fname)

        response.ok({ message: "Success" })
    }
}

class ImportService {
    static async ImportClassification(filelocation) {
        var workbook = new Excel.Workbook()

        workbook = await workbook.xlsx.readFile(filelocation)

        let explanation = workbook.getWorksheet('Sheet1') // get sheet name

        let colComment = explanation.getColumn('E') //column name

        let classes = await Class.query().select('id', 'name')

        let dataStudents = []
        //@ts-ignore
        colComment.eachCell(async (cell, rowNumber) => {
            if (rowNumber >= 2) {

                // TODO: ngambil data students
                let name_student = explanation.getCell('B' + rowNumber).value
                let gender = explanation.getCell('D' + rowNumber).value
                let nik = explanation.getCell('H' + rowNumber).value
                let religion = explanation.getCell('I' + rowNumber).value
                let residence = explanation.getCell('Y' + rowNumber).value
                let has_kps = explanation.getCell('AE' + rowNumber).value
                let kelas = explanation.getCell('AY' + rowNumber).value
                let has_kip = explanation.getCell('BD' + rowNumber).value
                let name_on_kip = explanation.getCell('BF' + rowNumber).value
                let pip_eligible = explanation.getCell('BL' + rowNumber).value
                let unit = explanation.getCell('BY' + rowNumber).value
                // let program = explanation.getCell('BZ' + rowNumber).value
                let class_id = ''

                classes.map((value) => {
                    const id = value.$attributes.id
                    const class_name = value.$attributes.name
                    if (kelas == class_name) {
                        class_id = id
                    }
                })

                // TODO: column (prov, kot, kec, kel) kendala di excel
                let students = {
                    name: name_student,
                    nis: explanation.getCell('C' + rowNumber).value,
                    gender: gender == 'L' ? 'male' : 'female',
                    nisn: explanation.getCell('E' + rowNumber).value,
                    birth_city: explanation.getCell('F' + rowNumber).value,
                    birth_day: explanation.getCell('G' + rowNumber).value,
                    nik,
                    religion: religion == 'Islam' && 'islam',
                    address: explanation.getCell('J' + rowNumber).value,
                    rt: explanation.getCell('K' + rowNumber).value,
                    rw: explanation.getCell('L' + rowNumber).value,
                    zip: explanation.getCell('P' + rowNumber).value,
                    // prov: explanation.getCell('U' + rowNumber).value.result,
                    // kot: explanation.getCell('V' + rowNumber).value.result,
                    // kec: explanation.getCell('W' + rowNumber).value.result,
                    // kel: explanation.getCell('X' + rowNumber).value.result,
                    residence: residence == 'Bersama orang tua' ? 'with parent' : residence == 'Asrama' ? 'dormitory' : residence == 'Pesantren' ? 'boarding school' : residence == 'Lainnya' ? 'others' : null,
                    transportation: explanation.getCell('Z' + rowNumber).value,
                    phone: explanation.getCell('AA' + rowNumber).value,
                    mobile_phone: explanation.getCell('AB' + rowNumber).value,
                    email: explanation.getCell('AC' + rowNumber).value,
                    has_kps: has_kps == 'Ya' ? true : false,
                    kps_number: explanation.getCell('AF' + rowNumber).value,
                    class_id: class_id == '' ? '9091b6aa-fdc6-4930-aa60-5503975ba7a0' : class_id,
                    nat_exam_no: explanation.getCell('BB' + rowNumber).value,
                    junior_hs_cert_no: explanation.getCell('BC' + rowNumber).value,
                    has_kip: has_kip == 'Ya' ? true : false,
                    kip_number: explanation.getCell('BE' + rowNumber).value,
                    name_on_kip: name_on_kip == 0 ? false : true,
                    kks_number: explanation.getCell('BG' + rowNumber).value,
                    birth_cert_no: explanation.getCell('BH' + rowNumber).value,
                    bank_name: explanation.getCell('BI' + rowNumber).value,
                    bank_account_number: explanation.getCell('BJ' + rowNumber).value,
                    bank_account_owner: explanation.getCell('BK' + rowNumber).value,
                    pip_eligible: pip_eligible == 'Ya' ? true : false,
                    pip_desc: explanation.getCell('BM' + rowNumber).value,
                    special_needs: explanation.getCell('BN' + rowNumber).value,
                    junior_hs_name: explanation.getCell('BO' + rowNumber).value,
                    child_no: explanation.getCell('BP' + rowNumber).value,
                    address_lat: explanation.getCell('BQ' + rowNumber).value,
                    address_long: explanation.getCell('BR' + rowNumber).value,
                    family_card_no: explanation.getCell('BS' + rowNumber).value,
                    weight: explanation.getCell('BT' + rowNumber).value,
                    height: explanation.getCell('BU' + rowNumber).value,
                    head_circumference: explanation.getCell('BV' + rowNumber).value,
                    siblings: explanation.getCell('BW' + rowNumber).value,
                    distance_to_school_in_km: explanation.getCell('BX' + rowNumber).value,
                    unit: unit == 'PUTRA' ? 'putra' : unit == 'PUTRI' ? 'putri' : null,
                    program: explanation.getCell('BZ' + rowNumber).value, //TODO: Cek data lagi
                }

                //@ts-ignore
                dataStudents.push(students)
                // let dataStudents = await Student.create(students)
                // let studentId = dataStudents.$attributes.id

                // TODO: ngambil data studentFatherParents
                // let salaryFather = explanation.getCell('AK' + rowNumber).value
                // let min_salary = 0
                // let max_salary = 0
                // if (salaryFather) {
                //     let matches = salaryFather.match(/\d+/g);
                //     min_salary = parseInt(matches[0].replace(/,/g, ''));
                //     max_salary = parseInt(matches[1].replace(/,/g, ''));
                // }
                // let studentFatherParents = {
                //     studentId,
                //     relationship_w_student: 'biological father',
                //     name: explanation.getCell('AG' + rowNumber).value,
                // birth_date: explanation.getCell('AH' + rowNumber).value,
                // education: explanation.getCell('AI' + rowNumber).value,
                // occupation: explanation.getCell('AJ' + rowNumber).value,
                // min_salary,
                // max_salary,
                //     nik,
                // }

                // await StudentParent.create(studentFatherParents)

                // TODO: ngambil data studentMotherParents
                // let salaryMother = explanation.getCell('AQ' + rowNumber).value
                // min_salary = 0
                // max_salary = 0
                // if (salaryMother) {
                //     let matches = salaryMother.match(/\d+/g);
                //     min_salary = parseInt(matches[0].replace(/,/g, ''));
                //     max_salary = parseInt(matches[1].replace(/,/g, ''));
                // }
                // let studentMotherParents = {
                //     studentId,
                //     relationship_w_student: 'biological mother',
                //     name: explanation.getCell('AM' + rowNumber).value,
                // birth_date: explanation.getCell('AN' + rowNumber).value,
                // education: explanation.getCell('AO' + rowNumber).value,
                // occupation: explanation.getCell('AP' + rowNumber).value,
                // min_salary,
                // max_salary,
                //     nik,
                // }

                // await StudentParent.create(studentMotherParents)

                // TODO: ngambil data studentMotherParents
                // let salaryGuardian = explanation.getCell('AW' + rowNumber).value
                // min_salary = 0
                // max_salary = 0
                // if (salaryGuardian) {
                //     let matches = salaryGuardian.match(/\d+/g);
                //     min_salary = parseInt(matches[0].replace(/,/g, ''));
                //     max_salary = parseInt(matches[1].replace(/,/g, ''));
                // }
                // let studentGuardian = {
                //     studentId,
                //     relationship_w_student: 'guardian',
                //     name: explanation.getCell('AS' + rowNumber).value,
                // birth_date: explanation.getCell('AT' + rowNumber).value,
                // education: explanation.getCell('AU' + rowNumber).value,
                // occupation: explanation.getCell('AV' + rowNumber).value,
                // min_salary,
                // max_salary,
                // nik,
                // }

                // await StudentParent.create(studentGuardian)
            }
        })

        await Student.createMany(dataStudents)
    }
}
//TODO: has_kks ?