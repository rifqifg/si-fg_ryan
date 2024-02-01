// import Division from "App/Models/Division";
import Unit from "App/Models/Unit";

export const TriwulanHelper = async (dataArrayObject) => {
  // const directSupervisor = await Division.query()
  //   .select('id', 'name')
  //   .whereIn('id', dataArrayObject.direct_supervisor)
  // const directSupervisorArrayObject = JSON.parse(JSON.stringify(directSupervisor))

  // const indirectSupervisor = await Division.query()
  //   .select('id', 'name')
  //   .where('id', dataArrayObject.indirect_supervisor)
  //   .firstOrFail()
  // const indirectSupervisorArrayObject = JSON.parse(JSON.stringify(indirectSupervisor))

  // const penilai = {
  //   direct_supervisor: directSupervisorArrayObject,
  //   indirect_supervisor: indirectSupervisorArrayObject
  // }

  // const leadUnit = await Unit.findBy('id', dataArrayObject.triwulan.unit.id)
  const leadUnit = await Unit.query().select('id', 'name').where('id', dataArrayObject.triwulan.unit.id)


  let direct_supervisor: any = []
  dataArrayObject.employee.divisions.map(value => {
    if (value.title == 'member') {
      direct_supervisor.push({id: value.division.id, name: value.division.name})
    }else if(value.title == 'vice'){
      direct_supervisor.push({id: value.division.id, name: value.division.name})
    }
  })

  const penilai = {
    direct_supervisor: direct_supervisor,
    indirect_supervisor: leadUnit
  }

  const triwulanEmployee = {
    id: dataArrayObject.id,
    other_achievements_worth_noting: dataArrayObject.other_achievements_worth_noting,
    specific_indiscipline_that_needs_to_be_noted: dataArrayObject.specific_indiscipline_that_needs_to_be_noted,
    suggestions_and_improvements: dataArrayObject.suggestions_and_improvements,
    total_skor: dataArrayObject.total_skor,
    ranking: dataArrayObject.ranking,
    total_skor_direct_supervisor: dataArrayObject.total_skor_direct_supervisor,
    total_skor_indirect_supervisor: dataArrayObject.total_skor_indirect_supervisor,
  }

  const dataEmployee = {
    id: dataArrayObject.employee.id,
    name: dataArrayObject.employee.name,
    nik: dataArrayObject.employee.nik,
    period_of_work: dataArrayObject.employee.period_of_work,
    period_of_assessment: dataArrayObject.period_of_assessment,
    divisions: dataArrayObject.employee.divisions,
  }

  const triwulanEmployeeDetail: any = []
  dataArrayObject.triwulanEmployeeDetail.map(value => {
    triwulanEmployeeDetail.push({
      id: value.id,
      skor: value.skor,
      direct_supervisor: value.direct_supervisor,
      assessment_component: value.assessmentComponent.name
    })
  })

  return { triwulanEmployee, triwulanEmployeeDetail, dataEmployee, penilai }
}
