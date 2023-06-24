import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Application from '@ioc:Adonis/Core/Application'
import CreateImportStudentValidator from '../../Validators/CreateImportStudentValidator'
import Student from '../../Models/Student'
import StudentParent from '../../Models/StudentParent'
// import Class from '../../Models/Class'
// import StudentParent from '../../Models/StudentParent'
const Excel = require('exceljs')
// const jsonfile = require('jsonfile');

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
        let workbook = new Excel.Workbook()

        workbook = await workbook.xlsx.readFile(filelocation)

        let worksheet = workbook.getWorksheet('Sheet1') // get sheet name

        let key = {}
        const students = []
        const studentFathers = []
        const studentMothers = []
        const studentGuardians = []

        function checkResidence(value) {
            const parent = 'Bersama orang tua'
            const dormitori = 'Asrama'
            const boarding = 'Pesantren'
            const other = 'Lainnya'
            return value.toLowerCase() == parent.toLowerCase() ? 'with parent' : value.toLowerCase() == dormitori.toLowerCase() ? 'dormitory' : value.toLowerCase() == boarding.toLowerCase() ? 'boarding school' : value.toLowerCase() == other.toLowerCase() ? 'others' : null;
        }

        function checkBoolean(value) {
            const ya = 'Ya'
            return String(value).toLowerCase() == ya.toLowerCase() ? false : true
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

                        rowObjectStudentFathers['student_id'] = cell.value;
                        rowObjectStudentMothers['student_id'] = cell.value;
                        rowObjectStudentGuardians['student_id'] = cell.value;
                    }
                    else if (key[colNumber] == "NIS") {
                        rowObjectStudents['nis'] = cell.value;
                    }
                    else if (key[colNumber] == "Jenis Kelamin") {
                        rowObjectStudents['gender'] = cell.value == 'L' ? 'male' : 'female';
                    }
                    else if (key[colNumber] == "NISN") {
                        rowObjectStudents['nisn'] = cell.value;
                    }
                    else if (key[colNumber] == "Tempat Lahir") {
                        rowObjectStudents['birth_city'] = cell.value;
                    }
                    else if (key[colNumber] == "Tanggal Lahir") {
                        rowObjectStudents['birth_day'] = cell.value;
                    }
                    else if (key[colNumber] == "NIK") {
                        rowObjectStudents['nik'] = cell.value;
                    }
                    else if (key[colNumber] == "Agama") {
                        rowObjectStudents['religion'] = cell.value == 'Islam' && 'islam';
                    }
                    else if (key[colNumber] == "Alamat") {
                        rowObjectStudents['address'] = cell.value;
                    }
                    else if (key[colNumber] == "RT") {
                        rowObjectStudents['rt'] = cell.value;
                    }
                    else if (key[colNumber] == "RW") {
                        rowObjectStudents['rw'] = cell.value;
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
                        rowObjectStudents['child_no'] = cell.value
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
                        rowObjectStudents['siblings'] = cell.value
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
                        rowObjectStudentFathers['education'] = cell.value
                    }
                    else if (key[colNumber] == "Pekerjaan Ayah") {
                        rowObjectStudentFathers['occupation'] = cell.value
                    }
                    else if (key[colNumber] == "Min Salary Ayah") {
                        rowObjectStudentFathers['min_salary'] = cell.value
                    }
                    else if (key[colNumber] == "Max Salary Ayah") {
                        rowObjectStudentFathers['max_salary'] = cell.value
                    }
                    else if (key[colNumber] == "NIK Ayah") {
                        rowObjectStudentFathers['nik'] = cell.value === null ? "-" : cell.value
                    }

                    else if (key[colNumber] == "Nama Ibu") {
                        rowObjectStudentMothers['name'] = cell.value === null ? "-" : cell.value
                        rowObjectStudentFathers['relationship_w_student'] = 'biological mother'
                    }
                    else if (key[colNumber] == "Tanggal Lahir Ibu") {
                        rowObjectStudentMothers['birth_date'] = cell.value
                    }
                    else if (key[colNumber] == "Jenjang Pendidikan Ibu") {
                        rowObjectStudentMothers['education'] = cell.value
                    }
                    else if (key[colNumber] == "Pekerjaan Ibu") {
                        rowObjectStudentMothers['occupation'] = cell.value
                    }
                    else if (key[colNumber] == "Min Salary Ibu") {
                        rowObjectStudentMothers['min_salary'] = cell.value
                    }
                    else if (key[colNumber] == "Max Salary Ibu") {
                        rowObjectStudentMothers['max_salary'] = cell.value
                    }
                    else if (key[colNumber] == "NIK Ibu") {
                        rowObjectStudentMothers['nik'] = cell.value === null ? "-" : cell.value
                    }

                    else if (key[colNumber] == "Nama Wali") {
                        rowObjectStudentGuardians['name'] = cell.value === null ? "-" : cell.value
                    }
                    else if (key[colNumber] == "Tanggal Lahir Wali") {
                        rowObjectStudentGuardians['birth_date'] = cell.value
                    }
                    else if (key[colNumber] == "Jenjang Pendidikan Wali") {
                        rowObjectStudentGuardians['education'] = cell.value
                    }
                    else if (key[colNumber] == "Pekerjaan Wali") {
                        rowObjectStudentGuardians['occupation'] = cell.value
                    }
                    else if (key[colNumber] == "Min Salary Wali") {
                        rowObjectStudentGuardians['min_salary'] = cell.value
                    }
                    else if (key[colNumber] == "Max Salary Wali") {
                        rowObjectStudentGuardians['max_salary'] = cell.value
                    }
                    else if (key[colNumber] == "NIK Wali") {
                        rowObjectStudentGuardians['nik'] = cell.value === null ? "-" : cell.value
                    }

                });
                //@ts-ignore
                students.push(rowObjectStudents);
                //@ts-ignore
                studentFathers.push(rowObjectStudentFathers)
                //@ts-ignore
                studentMothers.push(rowObjectStudentMothers)
                //@ts-ignore
                studentGuardians.push(rowObjectStudentGuardians)
            }
        });

        const dataStudents = await Student.createMany(students)

        dataStudents.map(value => {
            studentFathers.map((sf, index) => {
                //@ts-ignore
                if (value.$attributes.name == sf.student_id) {
                    //@ts-ignore
                    studentFathers[index]['student_id'] = value.$attributes.id
                }
            })
            studentMothers.map((sf, index) => {
                //@ts-ignore
                if (value.$attributes.name == sf.student_id) {
                    //@ts-ignore
                    studentMothers[index]['student_id'] = value.$attributes.id
                }
            })
            studentGuardians.map((sf, index) => {
                //@ts-ignore
                if (value.$attributes.name == sf.student_id) {
                    //@ts-ignore
                    studentGuardians[index]['student_id'] = value.$attributes.id
                }
            })
        })

        await StudentParent.createMany(studentFathers)
        await StudentParent.createMany(studentMothers)
        // await StudentParent.createMany(studentGuardians)

    }
}

// else if (key[colNumber] == "NIK") {
//     rowObjectStudents['nik'] = cell.value === null ? "-" : cell.value;                
// }

//     'No Seri Ijazah': 43,