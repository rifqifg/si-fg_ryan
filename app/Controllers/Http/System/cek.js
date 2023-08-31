const data ={
  "message": "you are logged in",
  "data": [
      {
          "id": "f35529a5-178c-4365-97a9-8ff888d9961b",
          "name": "Admin",
          "email": "admin@hr.smafg.sch.id",
          "role_name": "super_admin",
          "employee_id": null,
          "verified": true,
          "division_id": "5bbc92b7-3b44-4ab5-8399-7300a2914809",
          "student_id": null,
          "student_parent_id": null,
          "role": {
              "name": "super_admin",
              "description": "bisa melihat semua aktifitas & presensi dari berbagai divisi",
              "permissions": {
                  "modules": [
                      {
                          "id": "mdlHRD",
                          "type": "show",
                          "menus": [
                              {
                                  "id": "mnuEmployee",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddEmployee",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteEmployee",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDetailEmployee",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditEmployee",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnUpdateRFID",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuActivity",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddActivity",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteActivity",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditActivity",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnPresence",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuDivision",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddDivision",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteDivision",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditDivision",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnAddEmployeeToDivision",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteEmployeeFromDivision",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDetailDivision",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditEmployeeFromDivision",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuPresence",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddPresence",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeletePresence",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditPresence",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnExportXLSXPresence",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnRecapPresence",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnTimeout",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuRecapPresence",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnExportXLSXRecapPresence",
                                          "type": "show"
                                      }
                                  ]
                              }
                          ]
                      },
                      {
                          "id": "mdlHRD",
                          "type": "show",
                          "menus": [
                              {
                                  "id": "mnuEmployee",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddEmployee",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteEmployee",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDetailEmployee",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditEmployee",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnUpdateRFID",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuActivity",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddActivity",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteActivity",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditActivity",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnPresence",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuDivision",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddDivision",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteDivision",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditDivision",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnAddEmployeeToDivision",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteEmployeeFromDivision",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDetailDivision",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditEmployeeFromDivision",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuPresence",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddPresence",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeletePresence",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditPresence",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnExportXLSXPresence",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnRecapPresence",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnTimeout",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuRecapPresence",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnExportXLSXRecapPresence",
                                          "type": "show"
                                      }
                                  ]
                              }
                          ]
                      },
                      {
                          "id": "mdlSystem",
                          "type": "show",
                          "menus": [
                              {
                                  "id": "mnuModule",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddModule",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteModule",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditModule",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnMenus",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuRole",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddRole",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteRole",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditRole",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnPermissions",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuUsers",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddUser",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteUser",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditUser",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnResetPassword",
                                          "type": "show"
                                      }
                                  ]
                              }
                          ]
                      },
                      {
                          "id": "mdlTestBE",
                          "type": "show",
                          "menus": [
                              {
                                  "id": "mnuTestBE",
                                  "type": "show",
                                  "functions": []
                              },
                              {
                                  "id": "mnuTestDes",
                                  "type": "show",
                                  "functions": []
                              }
                          ]
                      },
                      {
                          "id": "mdlTestFE",
                          "type": "show",
                          "menus": [
                              {
                                  "id": "mnuTest1",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddTest",
                                          "type": "show"
                                      }
                                  ]
                              }
                          ]
                      },
                      {
                          "id": "mdlInventory",
                          "type": "show",
                          "menus": [
                              {
                                  "id": "mnuAssetLoan",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddAssetLoan",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteAssetLoan",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditAssetLoan",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnReturnAssetLoan",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuAssets",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddAssets",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteAssets",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDetailAssets",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditAssets",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuLoanBatch",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddLoanBatch",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteLoanBatch",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDetailLoanBatch",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditLoanBatch",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuManufacturers",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddManufacturer",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteManufacturer",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditManufacturer",
                                          "type": "show"
                                      }
                                  ]
                              }
                          ]
                      },
                      {
                          "id": "mdlAcademic",
                          "type": "show",
                          "menus": [
                              {
                                  "id": "mnuClasses",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddClass",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteClass",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDetailClass",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditClass",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuStudents",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddStudent",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteStudent",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDetailStudent",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditStudent",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnImportStudent",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuSubjects",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddPelajaran",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDetailPelajaran",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeletePelajaran",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditPelajaran",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuTeachers",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddTeachers",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnAddTeachings",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteTeachers",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteTeachings",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDetailTeachers",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditTeachers",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditTeachings",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuProgramSemester",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddProsem",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditProsem",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteProsem",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDetailProsem",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnAddProsemDetail",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditProsemDetail",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteProsemDetail",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuCurriculum",
                                  "type": "show",
                                  "functions": []
                              },
                              {
                                  "id": "mnuRencanaPengambilanNilai",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddRpn",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditRpn",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteRpn",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuPresenceDaily",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddPresenceDaily",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditPresenceDaily",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeletePresenceDaily",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuRecapsDaily",
                                  "type": "show",
                                  "functions": []
                              },
                              {
                                  "id": "mnuPresencePerSubject",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddPresencePerSubject",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditPresencePerSubject",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeletePresencePerSubject",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuRecapsPerSubject",
                                  "type": "show",
                                  "functions": []
                              },
                              {
                                  "id": "mnuBukuNilai",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAdd",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEdit",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDelete",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuAlumniClass",
                                  "type": "show",
                                  "functions": []
                              },
                              {
                                  "id": "mnuStudentPresencePerSubject",
                                  "type": "show",
                                  "functions": []
                              }
                          ]
                      },
                      {
                          "id": "mdlProfile",
                          "type": "show",
                          "menus": []
                      },
                      {
                          "id": "mdlExecutiveSummary",
                          "type": "show",
                          "menus": [
                              {
                                  "id": "mnuAlumni",
                                  "type": "show",
                                  "functions": []
                              },
                              {
                                  "id": "mnuKaryawan",
                                  "type": "show",
                                  "functions": []
                              },
                              {
                                  "id": "mnuSiswa",
                                  "type": "show",
                                  "functions": []
                              },
                              {
                                  "id": "mnuPPDB",
                                  "type": "show",
                                  "functions": []
                              }
                          ]
                      },
                      {
                          "id": "mdlPpdb",
                          "type": "show",
                          "menus": [
                              {
                                  "id": "mnuJadwal",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnEditJadwal",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnAddJadwal",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDetailJadwal",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteJadwal",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuPendaftaran",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddInterviewAdmin",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteInterviewAdmin",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditInterviewAdmin",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnStatusKeputusanAdmin",
                                          "type": "show"
                                      }
                                  ]
                              },
                              {
                                  "id": "mnuSetting",
                                  "type": "show",
                                  "functions": [
                                      {
                                          "id": "btnAddBatch",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnDeleteBatch",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditBatch",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditGuide",
                                          "type": "show"
                                      },
                                      {
                                          "id": "btnEditPendaftaranAktif",
                                          "type": "show"
                                      }
                                  ]
                              }
                          ]
                      }
                  ]
              }
          }
      }
  ]
}
