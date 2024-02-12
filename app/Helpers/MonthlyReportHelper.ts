export const MonthlyReportHelper = async (dataArray) => {
  const dataEmployee: any = []
  const monthlyReportEmployeeDetail: any = []

  dataArray.forEach(dataObject => {
    dataEmployee.push({
      "id": dataObject.employee.id,
      "name": dataObject.employee.name,
      "nik": dataObject.employee.nik,
      "status": dataObject.employee.status,
      "divisi": dataObject.employee.divisions,
      "period_of_work": dataObject.employee.period_of_work,
      "period_of_assesment": dataObject.monthlyReport.name,
      "monthlyReportEmployee": {
        "id": dataObject.id,
        "achievement": dataObject.achievement,
        "indisipliner": dataObject.indisipliner,
        "suggestions_and_improvements": dataObject.suggestions_and_improvements,
      }
    })

    // gabungkan data fixed time & not fixed time.
    dataObject.monthlyReportEmployeesGabungan = [
      ...dataObject.monthlyReportEmployeesFixedTime,
      ...dataObject.monthlyReportEmployeesNotFixedTime
    ]

    const leave = dataObject.monthlyReportEmployeesLeave[0]
    const leaveSession = dataObject.monthlyReportEmployeesLeaveSession[0]
    const teaching = dataObject.monthlyReportEmployeesTeaching[0]

    // masukkan ke array gabungan klo kondisi true
    if (leave.is_leave) dataObject.monthlyReportEmployeesGabungan.push(leave)
    if (leaveSession.is_leave_session) dataObject.monthlyReportEmployeesGabungan.push(leaveSession)
    if (teaching.is_teaching) dataObject.monthlyReportEmployeesGabungan.push(teaching)

    dataObject.monthlyReportEmployeesGabungan.forEach(gabungan => {
      let categoryName
      let activityName

      if (gabungan.is_leave || gabungan.is_leave_session || gabungan.is_teaching) {
        categoryName = "KEDISIPLINAN DAN KINERJA"
      } else {
        categoryName = gabungan.activity.categoryActivity.name;
      }

      if (gabungan.is_leave) activityName = "SISA JATAH CUTI"
      else if (gabungan.is_leave_session) activityName = "IZIN (SESI)"
      else if (gabungan.is_teaching) activityName = "MENGAJAR"
      else activityName = gabungan.activity.name

      // NOTE: ketika salah satu item dibawah ini ngga ada (misal notenya ngga ada / undefined. klo null, kondisionalnya wktu cek layer 3) maka atributnya ngga dimasukin
      const items: any = {
        default: gabungan.default,
        skor: gabungan.skor,
      }

      // utk percentage, key & valuenya tergantung ada tidaknya default
      if (gabungan.default) items.percentage_persen = gabungan.percentage + '%'
      else items.percentage = gabungan.percentage

      items.note = gabungan.note

      // cek Kategori Aktivitas
      let categoryIndex = monthlyReportEmployeeDetail.findIndex(c => c.name === categoryName);
      // jika kategori tidak ditemukan..
      if (categoryIndex === -1) {
        // ..maka set index utk kategori baru, +1 dari index terakhir (aka. nilai length sekarang)
        categoryIndex = monthlyReportEmployeeDetail.length;
        // lalu push pake index baru tsb
        monthlyReportEmployeeDetail.push({
          name: categoryName,
          data: []
        });
      }

      // cek Aktivitas
      let activityIndex = monthlyReportEmployeeDetail[categoryIndex].data.findIndex(a => a.activity_name === activityName)
      if (activityIndex === -1) {
        activityIndex = monthlyReportEmployeeDetail[categoryIndex].data.length;

        /*
          Dibawah ini logic utk mengurutkan aktivitas.

          Urutan aktivitas:
          1. Aktivitas tetap
          2. Aktivitas tdk tetap
          3. Aktivitas hardcode (leave, leave session, dsb.)
        */
        if (
          activityName === "SISA JATAH CUTI" ||
          activityName === "IZIN (SESI)" ||
          activityName === "MENGAJAR"
        ) {
          // jika aktivitas yg diinput adalah hardcode, tandai dgn activity_type: hardcoded...
          // ...utk skrg cuma dipake di BE
          monthlyReportEmployeeDetail[categoryIndex].data.push({activity_name: activityName, activity_type: 'hardcoded', item: [] })
        } else {
          const hardcodedActivityIndex = monthlyReportEmployeeDetail[categoryIndex].data.findIndex(a => a.activity_type === 'hardcoded')
          if (hardcodedActivityIndex === -1) {
            // jika bukan hardcode, dan aktivitas yg hardcoded memang belum ada, maka push spt biasa (tanpa ditandai hardcode)
            monthlyReportEmployeeDetail[categoryIndex].data.push({ activity_name: activityName, item: [] })
          } else {
            // jika bukan hardcode, maka input SEBELUM index yg hardcode
            monthlyReportEmployeeDetail[categoryIndex].data.splice(hardcodedActivityIndex, 0, {activity_name: activityName, item: [] })
            // ubah value activityIndex ke index data yg di splice tdi
            activityIndex = hardcodedActivityIndex
          }
        }
      }

      // cek layer 3
      for (const [itemKey, itemValue] of Object.entries(items)) {
        if (itemValue !== null && itemValue !== undefined) {
          let itemIndex = monthlyReportEmployeeDetail[categoryIndex].data[activityIndex].item.findIndex(item => item.item_name === itemKey)
          if (itemIndex === -1) {
            itemIndex = monthlyReportEmployeeDetail[categoryIndex].data[activityIndex].item.length
            monthlyReportEmployeeDetail[categoryIndex].data[activityIndex].item.push({
              item_name: itemKey,
              data_value: []
            })
          }

          monthlyReportEmployeeDetail[categoryIndex].data[activityIndex].item[itemIndex].data_value.push({
            id: gabungan.id,
            id_employee: dataObject.employee.id,
            employee_name: dataObject.employee.name,
            value: itemValue
          })
        }
      }
    })
  })

  return { dataEmployee, monthlyReportEmployeeDetail }
}