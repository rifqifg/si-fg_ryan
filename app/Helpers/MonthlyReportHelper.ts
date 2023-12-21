import CategoryActivity from "App/Models/CategoryActivity"

export const MonthlyReportHelper = async (dataObject) => {
  const categoryActivity = await CategoryActivity.query().select('name')
  const categoryActivityObject = JSON.parse(JSON.stringify(categoryActivity))

  const dataEmployee = {
    "name": dataObject.employee.name,
    "nik": dataObject.employee.nik,
    "status": dataObject.employee.status,
    "divisi": dataObject.employee.divisions,
    "period_of_work": dataObject.employee.period_of_work,
    "period_of_assesment": dataObject.monthlyReport.name,
  }

  const monthlyReportEmployee = {
    "id": dataObject.id,
    "achievement": dataObject.achievement,
    "indisipliner": dataObject.indisipliner,
    "suggestions_and_improvements": dataObject.suggestions_and_improvements,
  }

  let monthlyReportEmployeeDetail: any = []
  categoryActivityObject.map(value => {
    monthlyReportEmployeeDetail.push({
      name: value.name,
      data: []
    })
  })

  monthlyReportEmployeeDetail.map(value => {
    const fixedTime = dataObject.monthlyReportEmployeesFixedTime[0]
    if (fixedTime) {
      if (value.name == fixedTime.activity.categoryActivity.name) {
        value.data.push({
          id: fixedTime.id,
          skor: fixedTime.skor,
          note: fixedTime.note,
          percentage: fixedTime.percentage,
          activity_name: fixedTime.activity.name,
          default: fixedTime.default
        })
      }
    }

    const leave = dataObject.monthlyReportEmployeesLeave[0]
    if (leave) {
      if (value.name == "KEDISIPLINAN DAN KINERJA" && leave.is_leave) {
        value.data.push({
          id: leave.id,
          skor: leave.skor,
          note: leave.note,
          percentage: null,
          activity_name: "SISA JATAH CUTI"
        })
      }
    }

    const leaveSession = dataObject.monthlyReportEmployeesLeaveSession[0]
    if (leaveSession) {
      if (value.name == "KEDISIPLINAN DAN KINERJA" && leaveSession.is_leave_session) {
        value.data.push({
          id: leaveSession.id,
          skor: leaveSession.skor,
          note: leaveSession.note,
          percentage: null,
          activity_name: "IZIN (SESI)"
        })
      }
    }

    const teaching = dataObject.monthlyReportEmployeesTeaching[0]
    if (teaching) {
      if (value.name == "KEDISIPLINAN DAN KINERJA" && teaching.is_teaching) {
        value.data.push({
          id: teaching.id,
          skor: teaching.skor,
          percentage: teaching.percentage,
          activity_name: "MENGAJAR",
          default: teaching.default
        })
      }
    }

    const notFixedTime = dataObject.monthlyReportEmployeesNotFixedTime
    if (notFixedTime.length > 0) {
      notFixedTime.map(nft => {
        if (value.name == nft.activity.categoryActivity.name) {
          value.data.push({
            id: nft.id,
            skor: nft.skor,
            note: nft.note,
            percentage: nft.percentage,
            activity_name: nft.activity.name,
            default: nft.default
          })
        }
      })
    }
  })

  return { dataEmployee, monthlyReportEmployee, monthlyReportEmployeeDetail }
}
