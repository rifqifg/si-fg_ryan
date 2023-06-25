import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import CreateImportStudentValidator from '../../Validators/CreateImportStudentValidator'
import Student from '../../Models/Student'
import StudentParent from '../../Models/StudentParent'
import CreateManyStudentValidator from '../../Validators/CreateManyStudentValidator'
const Excel = require('exceljs')
import { validator } from '@ioc:Adonis/Core/Validator'
import CreateManyStudentParentValidator from '../../Validators/CreateManyStudentParentValidator'

export default class ImportStudentsController {
    public async store({ request, response }: HttpContextContract) {
        let payload = await request.validate(CreateImportStudentValidator)
        let fname = `${new Date().getTime()}.${payload.upload.extname}`

        console.log(__dirname);
        let dir = Application.makePath('/app/Modules/Academic/uploads')
        console.log('MakePatch Success');
        

        await payload.upload.move(
            dir,
            { name: fname, overwrite: true }
        )

        await ImportService.ImportClassification('app/Modules/Academic/uploads/' + fname)

        response.ok({ message: "Success import data" })
    }
}

class ImportService {
    static async ImportClassification(filelocation) {
        let workbook = new Excel.Workbook()

        workbook = await workbook.xlsx.readFile(filelocation)

        let worksheet = workbook.getWorksheet('Sheet1') // get sheet name

        let key = {}
        const students = {
            "manyStudents": []
        }
        const studentFathers = {
            "manyStudentParents": []
        }
        const studentMothers = {
            "manyStudentParents": []
        }
        const studentGuardians = {
            "manyStudentParents": []
        }

        function checkResidence(value) {
            const parent = 'Bersama orang tua'
            const dormitori = 'Asrama'
            const boarding = 'Pesantren'
            const other = 'Lainnya'
            return String(value).toLowerCase() == parent.toLowerCase() ? 'with parent'
                : String(value).toLowerCase() == dormitori.toLowerCase() ? 'dormitory'
                    : String(value).toLowerCase() == boarding.toLowerCase() ? 'boarding school'
                        : String(value).toLowerCase() == other.toLowerCase() ? 'others'
                            : null;
        }

        function checkBoolean(value) {
            const ya = 'Ya'
            return String(value).toLowerCase() == ya.toLowerCase() ? false : true
        }

        function checkParentEducation(value) {
            const ELEMENTARY_SCHOOL = 'SD / Sederajat'
            const JUNIOR_HIGH_SCHOOL = 'SMP / Sederajat'
            const HIGH_SCHOOL = 'SMA / Sederajat'
            const S1 = 'S1'
            const S2 = 'S2'
            const D1 = 'D1'
            const D2 = 'D2'
            const D3 = 'D3'
            const D4 = 'D4'
            return String(value).toLowerCase() == ELEMENTARY_SCHOOL.toLowerCase() ? ELEMENTARY_SCHOOL
                : String(value).toLowerCase() == JUNIOR_HIGH_SCHOOL.toLowerCase() ? JUNIOR_HIGH_SCHOOL
                    : String(value).toLowerCase() == HIGH_SCHOOL.toLowerCase() ? HIGH_SCHOOL
                        : String(value).toLowerCase() == S1.toLowerCase() ? S1
                            : String(value).toLowerCase() == S2.toLowerCase() ? S2
                                : String(value).toLowerCase() == D1.toLowerCase() ? D1
                                    : String(value).toLowerCase() == D2.toLowerCase() ? D2
                                        : String(value).toLowerCase() == D3.toLowerCase() ? D3
                                            : String(value).toLowerCase() == D4.toLowerCase() ? D4
                                                : null
        }

        //@ts-ignore
        worksheet.eachRow({ includeEmpty: false }, function (row, rowNumber) {
            const rowObjectStudents = {};
            const rowObjectStudentFathers = {};
            const rowObjectStudentMothers = {};
            const rowObjectStudentGuardians = {};

            if (rowNumber == 1) {
                row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
                    key[`${colNumber}`] = cell.value;
                });
            }
            if (rowNumber > 2) {
                row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
                    if (key[colNumber] == "Nama Siswa") {
                        rowObjectStudents['name'] = cell.value;
                        rowObjectStudents['class_id'] = null

                        rowObjectStudentFathers['studentId'] = cell.value;
                        rowObjectStudentMothers['studentId'] = cell.value;
                        rowObjectStudentGuardians['studentId'] = cell.value;
                    }
                    else if (key[colNumber] == "NIS") {
                        rowObjectStudents['nis'] = String(cell.value);
                    }
                    else if (key[colNumber] == "Jenis Kelamin") {
                        rowObjectStudents['gender'] = cell.value == 'L' ? 'male' : 'female';
                    }
                    else if (key[colNumber] == "NISN") {
                        rowObjectStudents['nisn'] = String(cell.value);
                    }
                    else if (key[colNumber] == "Tempat Lahir") {
                        rowObjectStudents['birth_city'] = cell.value;
                    }
                    else if (key[colNumber] == "Tanggal Lahir") {
                        rowObjectStudents['birth_day'] = cell.value;
                    }
                    else if (key[colNumber] == "NIK") {
                        rowObjectStudents['nik'] = String(cell.value);
                    }
                    else if (key[colNumber] == "Agama") {
                        rowObjectStudents['religion'] = cell.value == 'Islam' && 'islam';
                    }
                    else if (key[colNumber] == "Alamat") {
                        rowObjectStudents['address'] = cell.value;
                    }
                    else if (key[colNumber] == "RT") {
                        rowObjectStudents['rt'] = String(cell.value);
                    }
                    else if (key[colNumber] == "RW") {
                        rowObjectStudents['rw'] = String(cell.value);
                    }
                    else if (key[colNumber] == "Kode Pos") {
                        rowObjectStudents['zip'] = String(cell.value);
                    }
                    else if (key[colNumber] == "Jenis Tinggal") {
                        rowObjectStudents['residence'] = checkResidence(cell.value)
                    }
                    else if (key[colNumber] == "Alat Transportasi") {
                        rowObjectStudents['transportation'] = cell.value
                    }
                    else if (key[colNumber] == "Telepon") {
                        rowObjectStudents['phone'] = cell.value
                    }
                    else if (key[colNumber] == "HP") {
                        rowObjectStudents['mobile_phone'] = cell.value
                    }
                    else if (key[colNumber] == "E-Mail") {
                        rowObjectStudents['email'] = cell.value
                    }
                    else if (key[colNumber] == "SKHUN") {
                        rowObjectStudents['junior_hs_cert_no'] = cell.value
                    }
                    else if (key[colNumber] == "Penerima KPS") {
                        rowObjectStudents['has_kps'] = checkBoolean(cell.value)
                    }
                    else if (key[colNumber] == "No. KPS") {
                        rowObjectStudents['kps_number'] = cell.value
                    }
                    else if (key[colNumber] == "No Peserta Ujian Nasional") {
                        rowObjectStudents['nat_exam_no'] = cell.value
                    }
                    else if (key[colNumber] == "Penerima KIP") {
                        rowObjectStudents['has_kip'] = checkBoolean(cell.value)
                    }
                    else if (key[colNumber] == "Nomor KIP") {
                        rowObjectStudents['kip_number'] = cell.value
                    }
                    else if (key[colNumber] == "Nama di KIP") {
                        rowObjectStudents['name_on_kip'] = cell.value
                    }
                    else if (key[colNumber] == "Nomor KKS") {
                        rowObjectStudents['kks_number'] = cell.value
                    }
                    else if (key[colNumber] == "No Registrasi Akta Lahir") {
                        rowObjectStudents['birth_cert_no'] = cell.value
                    }
                    else if (key[colNumber] == "Bank") {
                        rowObjectStudents['bank_name'] = cell.value
                    }
                    else if (key[colNumber] == "Nomor Rekening Bank") {
                        rowObjectStudents['bank_account_number'] = cell.value
                    }
                    else if (key[colNumber] == "Rekening Atas Nama") {
                        rowObjectStudents['bank_account_owner'] = cell.value
                    }
                    else if (key[colNumber] == "Layak PIP (usulan dari sekolah)") {
                        rowObjectStudents['pip_eligible'] = checkBoolean(cell.value)
                    }
                    else if (key[colNumber] == "Alasan Layak PIP") {
                        rowObjectStudents['pip_desc'] = cell.value
                    }
                    else if (key[colNumber] == "Kebutuhan Khusus") {
                        rowObjectStudents['special_needs'] = cell.value
                    }
                    else if (key[colNumber] == "Sekolah Asal") {
                        rowObjectStudents['junior_hs_name'] = cell.value
                    }
                    else if (key[colNumber] == "Anak ke-berapa") {
                        rowObjectStudents['child_no'] = String(cell.value)
                    }
                    else if (key[colNumber] == "Lintang") {
                        rowObjectStudents['address_lat'] = cell.value
                    }
                    else if (key[colNumber] == "Bujur") {
                        rowObjectStudents['address_long'] = cell.value
                    }
                    else if (key[colNumber] == "No KK") {
                        rowObjectStudents['family_card_no'] = cell.value
                    }
                    else if (key[colNumber] == "Berat Badan") {
                        rowObjectStudents['weight'] = cell.value
                    }
                    else if (key[colNumber] == "Tinggi Badan") {
                        rowObjectStudents['height'] = cell.value
                    }
                    else if (key[colNumber] == "Lingkar Kepala") {
                        rowObjectStudents['head_circumference'] = cell.value
                    }
                    else if (key[colNumber] == "Jml. Saudara Kandung") {
                        rowObjectStudents['siblings'] = String(cell.value)
                    }
                    else if (key[colNumber] == "Jarak Rumah ke Sekolah (KM)") {
                        rowObjectStudents['distance_to_school_in_km'] = cell.value
                    }
                    else if (key[colNumber] == "Unit") {
                        rowObjectStudents['unit'] = cell.value == 'PUTRA' ? 'putra' : cell.value == 'PUTRI' ? 'putri' : null
                    }
                    else if (key[colNumber] == "Program") {
                        rowObjectStudents['program'] = cell.value
                    }

                    else if (key[colNumber] == "Nama Ayah") {
                        rowObjectStudentFathers['name'] = cell.value === null ? "-" : cell.value
                        rowObjectStudentFathers['relationship_w_student'] = 'biological father'
                    }
                    else if (key[colNumber] == "Tanggal Lahir Ayah") {
                        rowObjectStudentFathers['birth_date'] = cell.value
                    }
                    else if (key[colNumber] == "Jenjang Pendidikan Ayah") {
                        rowObjectStudentFathers['education'] = checkParentEducation(cell.value)
                    }
                    else if (key[colNumber] == "Pekerjaan Ayah") {
                        rowObjectStudentFathers['occupation'] = cell.value
                    }
                    else if (key[colNumber] == "Min Salary Ayah") {
                        rowObjectStudentFathers['min_salary'] = String(cell.value)
                    }
                    else if (key[colNumber] == "Max Salary Ayah") {
                        rowObjectStudentFathers['max_salary'] = String(cell.value)
                    }
                    else if (key[colNumber] == "NIK Ayah") {
                        rowObjectStudentFathers['nik'] = cell.value === null ? "0000000000000000" : String(cell.value)
                    }

                    else if (key[colNumber] == "Nama Ibu") {
                        rowObjectStudentMothers['name'] = cell.value === null ? "-" : cell.value
                        rowObjectStudentMothers['relationship_w_student'] = 'biological mother'
                    }
                    else if (key[colNumber] == "Tanggal Lahir Ibu") {
                        rowObjectStudentMothers['birth_date'] = cell.value
                    }
                    else if (key[colNumber] == "Jenjang Pendidikan Ibu") {
                        rowObjectStudentMothers['education'] = checkParentEducation(cell.value)
                    }
                    else if (key[colNumber] == "Pekerjaan Ibu") {
                        rowObjectStudentMothers['occupation'] = cell.value
                    }
                    else if (key[colNumber] == "Min Salary Ibu") {
                        rowObjectStudentMothers['min_salary'] = String(cell.value)
                    }
                    else if (key[colNumber] == "Max Salary Ibu") {
                        rowObjectStudentMothers['max_salary'] = String(cell.value)
                    }
                    else if (key[colNumber] == "NIK Ibu") {
                        rowObjectStudentMothers['nik'] = cell.value === null ? "0000000000000000" : String(cell.value)
                    }

                    else if (key[colNumber] == "Nama Wali") {
                        rowObjectStudentGuardians['name'] = cell.value === null ? "-" : cell.value
                        rowObjectStudentGuardians['relationship_w_student'] = 'guardian'
                    }
                    else if (key[colNumber] == "Tanggal Lahir Wali") {
                        rowObjectStudentGuardians['birth_date'] = cell.value
                    }
                    else if (key[colNumber] == "Jenjang Pendidikan Wali") {
                        rowObjectStudentGuardians['education'] = checkParentEducation(cell.value)
                    }
                    else if (key[colNumber] == "Pekerjaan Wali") {
                        rowObjectStudentGuardians['occupation'] = cell.value
                    }
                    else if (key[colNumber] == "Min Salary Wali") {
                        rowObjectStudentGuardians['min_salary'] = String(cell.value)
                    }
                    else if (key[colNumber] == "Max Salary Wali") {
                        rowObjectStudentGuardians['max_salary'] = String(cell.value)
                    }
                    else if (key[colNumber] == "NIK Wali") {
                        rowObjectStudentGuardians['nik'] = cell.value === null ? "0000000000000000" : String(cell.value)
                    }

                });
                //@ts-ignore
                students.manyStudents.push(rowObjectStudents);
                //@ts-ignore
                studentFathers.manyStudentParents.push(rowObjectStudentFathers)
                //@ts-ignore
                studentMothers.manyStudentParents.push(rowObjectStudentMothers)
                //@ts-ignore
                studentGuardians.manyStudentParents.push(rowObjectStudentGuardians)
            }
        });
        //@ts-ignore
        const studentValidator = new CreateManyStudentValidator(null, students)
        const resultStudentValidator = await validator.validate(studentValidator)
        const dataStudents = await Student.createMany(resultStudentValidator.manyStudents)

        dataStudents.map(value => {
            studentFathers.manyStudentParents.map((sf, index) => {
                //@ts-ignore
                if (value.$attributes.name == sf.studentId) {
                    //@ts-ignore
                    studentFathers.manyStudentParents[index]['studentId'] = value.$attributes.id
                }
            })
            studentMothers.manyStudentParents.map((sf, index) => {
                //@ts-ignore
                if (value.$attributes.name == sf.studentId) {
                    //@ts-ignore
                    studentMothers.manyStudentParents[index]['studentId'] = value.$attributes.id
                }
            })
            studentGuardians.manyStudentParents.map((sf, index) => {
                //@ts-ignore
                if (value.$attributes.name == sf.studentId) {
                    //@ts-ignore
                    studentGuardians.manyStudentParents[index]['studentId'] = value.$attributes.id
                }
            })
        })

        //@ts-ignore
        const studentFathersValidator = new CreateManyStudentParentValidator(null, studentFathers)
        const resultStudentFathersValidator = await validator.validate(studentFathersValidator)
        await StudentParent.createMany(resultStudentFathersValidator.manyStudentParents)

        //@ts-ignore
        const studentMothersValidator = new CreateManyStudentParentValidator(null, studentMothers)
        const resultStudentMothersValidator = await validator.validate(studentFathersValidator)
        await StudentParent.createMany(resultStudentMothersValidator.manyStudentParents)

        //@ts-ignore
        const studentGuardiansValidator = new CreateManyStudentParentValidator(null, studentGuardians)
        const resultStudentGuardianValidator = await validator.validate(studentFathersValidator)
        await StudentParent.createMany(resultStudentGuardianValidator.manyStudentParents)

    }
}