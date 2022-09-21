import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Models/Role'

export default class extends BaseSeeder {
  public async run() {
    console.log('>>> seeding Permissions');

    const superAdminPermissions = { modules: [{ id: "mdlHRD", menus: [{ functions: [{ id: "btnRecapPresence", type: "show" }, { id: "btnExportXLSXPresence", type: "show" }, { id: "btnEditPresence", type: "show" }, { id: "btnDeletePresence", type: "show" }, { id: "btnAddPresence", type: "show" }], id: "mnuPresence", type: "show" }, { functions: [{ id: "btnAddActivity", type: "show" }, { id: "btnDeleteActivity", type: "show" }, { id: "btnEditActivity", type: "show" }, { id: "btnPresence", type: "show" }], id: "mnuActivity", type: "show" }, { functions: [{ id: "btnAddEmployee", type: "show" }, { id: "btnDeleteEmployee", type: "show" }, { id: "btnEditEmployee", type: "show" }, { id: "btnUpdateRFID", type: "show" }, { id: "btnDetailEmployee", type: "show" }], id: "mnuEmployee", type: "show" }, { functions: [{ id: "btnAddDivision", type: "show" }, { id: "btnDeleteDivision", type: "show" }, { id: "btnEditDivision", type: "show" }], id: "mnuDivision", type: "show" }, { functions: [{ id: "btnExportXLSXRecapPresence", type: "show" }], id: "mnuRecapPresence", type: "show" }], type: "show" }, { id: "mdlSystem", menus: [{ functions: [{ id: "btnAddModule", type: "show" }, { id: "btnDeleteModule", type: "show" }, { id: "btnEditModule", type: "show" }, { id: "btnMenus", type: "show" }], id: "mnuModule", type: "show" }, { functions: [{ id: "btnAddRole", type: "show" }, { id: "btnDeleteRole", type: "show" }, { id: "btnEditRole", type: "show" }, { id: "btnPermissions", type: "show" }], id: "mnuRole", type: "show" }, { functions: [{ id: "btnAddUser", type: "show" }, { id: "btnDeleteUser", type: "show" }, { id: "btnEditUser", type: "show" }, { id: "btnResetPassword", type: "show" }], id: "mnuUsers", type: "show" }], type: "show" }, { id: "mdlAcademic", menus: [{ functions: [], id: "mnuClasses", type: "show" }, { functions: [], id: "mnuStudents", type: "show" }], type: "show" }, { id: "mdlProfile2", menus: [{ functions: [], id: "mnuTestBaru", type: "show" }, { functions: [], id: "mnuTestBaru2", type: "show" }], type: "show" }] }

    const superAdmin = await Role.findOrFail('super_admin')
    await superAdmin.merge({ permissions: superAdminPermissions }).save()
  }
}