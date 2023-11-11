export const TriwulanHelper = (dataArrayObject) => {
  const triwulanEmployee = {
    id: dataArrayObject.id,
    name: dataArrayObject.employee.name,
    other_achievements_worth_noting: dataArrayObject.other_achievements_worth_noting,
    specific_indiscipline_that_needs_to_be_noted: dataArrayObject.specific_indiscipline_that_needs_to_be_noted,
    suggestions_and_improvements: dataArrayObject.suggestions_and_improvements,
    total_skor: dataArrayObject.total_skor,
    ranking: dataArrayObject.ranking
  }

//   "employee": {
//     "name": "AJRI MAULUDI, S. Pd",
//     "id": "70167fc9-76fd-45de-8e22-4487060b1dd7",
//     "divisions": [
//         {
//             "title": "member",
//             "division_id": "56c75d90-e1da-4f2f-95f7-ebb9b73d6a8c",
//             "employee_id": "70167fc9-76fd-45de-8e22-4487060b1dd7",
//             "division": {
//                 "name": "IT",
//                 "id": "56c75d90-e1da-4f2f-95f7-ebb9b73d6a8c"
//             }
//         },
//         {
//             "title": "member",
//             "division_id": "53228118-8fc4-48b8-8582-df93444928d6",
//             "employee_id": "70167fc9-76fd-45de-8e22-4487060b1dd7",
//             "division": {
//                 "name": "Duty Teacher",
//                 "id": "53228118-8fc4-48b8-8582-df93444928d6"
//             }
//         }
//     ]
// },

  const triwulanEmployeeDetail: any = []
  dataArrayObject.triwulanEmployeeDetail.map(value => {
    triwulanEmployeeDetail.push({
      id: value.id,
      skor: value.skor,
      direct_supervisor: value.direct_supervisor,
      assessmentComponent: value.assessmentComponent.name
    })
  })

  return { triwulanEmployee, triwulanEmployeeDetail }
}
