import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Function from 'App/Models/Function'

export default class extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    console.log('>>> seeding Functions');

    await Function.createMany([
      { id: 'btnAddActivity', menuId: 'mnuActivity' },
      { id: 'btnDeleteActivity', menuId: 'mnuActivity' },
      { id: 'btnEditActivity', menuId: 'mnuActivity' },
      { id: 'btnPresence', menuId: 'mnuActivity' },
      { id: 'btnAddDivision', menuId: 'mnuDivision' },
      { id: 'btnDeleteDivision', menuId: 'mnuDivision' },
      { id: 'btnEditDivision', menuId: 'mnuDivision' },
      { id: 'btnAddEmployee', menuId: 'mnuEmployee' },
      { id: 'btnDeleteEmployee', menuId: 'mnuEmployee' },
      { id: 'btnDetailEmployee', menuId: 'mnuEmployee' },
      { id: 'btnEditEmployee', menuId: 'mnuEmployee' },
      { id: 'btnUpdateRFID', menuId: 'mnuEmployee' },
      { id: 'btnAddModule', menuId: 'mnuModule' },
      { id: 'btnDeleteModule', menuId: 'mnuModule' },
      { id: 'btnEditModule', menuId: 'mnuModule' },
      { id: 'btnMenus', menuId: 'mnuModule' },
      { id: 'btnAddPresence', menuId: 'mnuPresence' },
      { id: 'btnDeletePresence', menuId: 'mnuPresence' },
      { id: 'btnEditPresence', menuId: 'mnuPresence' },
      { id: 'btnExportXLSXPresence', menuId: 'mnuPresence' },
      { id: 'btnRecapPresence', menuId: 'mnuPresence' },
      { id: 'btnExportXLSXRecapPresence', menuId: 'mnuRecapPresence' },
      { id: 'btnAddRole', menuId: 'mnuRole' },
      { id: 'btnDeleteRole', menuId: 'mnuRole' },
      { id: 'btnEditRole', menuId: 'mnuRole' },
      { id: 'btnPermissions', menuId: 'mnuRole' },
      { id: 'btnAddUser', menuId: 'mnuUsers' },
      { id: 'btnDeleteUser', menuId: 'mnuUsers' },
      { id: 'btnEditUser', menuId: 'mnuUsers' },
      { id: 'btnResetPassword', menuId: 'mnuUsers' }
    ])
  }
}
