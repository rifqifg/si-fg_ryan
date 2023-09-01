import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { BillingStatus, BillingType } from '../../lib/enums'
import Billing from '../../Models/Billing'

export default class extends BaseSeeder {
  public async run() {
    console.log(">>> START seeding table: finance.billings")

    const billingsToCreate = [
      {
        id: 'e38dfecb-7e5e-4d01-9cda-26b057b5340a',
        studentId: 'c57be98a-70da-4514-a94e-050dadc7eda5',
        masterBillingId: '9d6e2a88-6d79-4e54-bf7c-3e78a1d4d61a',
        name: 'SPP Bulan April',
        amount: '1000000',
        description: '',
        status: BillingStatus.UNPAID,
        type: BillingType.SPP
      },
      {
        id: '88e5ea4a-71a9-4d5a-92a9-4dbb40ef04b6',
        studentId: '06d27fce-0e18-4f58-95cf-5bd52625c154',
        masterBillingId: '7c402ea1-8f4f-483b-9bfb-0a38a82dcbb1',
        name: 'SPP Bulan April',
        amount: '1300000',
        description: '',
        status: BillingStatus.UNPAID,
        type: BillingType.SPP
      },
      {
        id: '3fa215c9-102a-4f9f-9c22-7a22b1788928',
        studentId: '7ad6e4c0-67f1-41a5-8d35-62f41f6643fa',
        masterBillingId: '9d6e2a88-6d79-4e54-bf7c-3e78a1d4d61a',
        name: 'SPP Bulan April',
        amount: '1000000',
        description: '',
        status: BillingStatus.PAID_FULL,
        type: BillingType.SPP
      },
      {
        id: 'd5a63e88-6a1a-4b3b-864d-8793d860a352',
        studentId: '94339b92-2f79-4a51-a71d-bf9888d45864',
        masterBillingId: 'f2dcdbe5-9417-465b-8b8e-75d8e4c4cfac',
        name: 'asdfasdfadfs',
        amount: '1800000',
        description: '',
        status: BillingStatus.UNPAID,
        type: BillingType.SPP
      },
      {
        id: 'b0139309-77d0-448e-9a50-1823adef16e3',
        studentId: '2a091fa8-98ad-4a12-9e44-4ba4b03926ce',
        masterBillingId: '6b8658c2-af99-4753-b1e3-cdb076880a27',
        name: 'Biaya Wajib Tahunan',
        amount: '3000000',
        description: '',
        status: BillingStatus.UNPAID,
        type: BillingType.BWT
      },
      {
        id: '6f8fcd2c-9a7c-4245-8e77-6910ec6573a2',
        studentId: '01f714dd-a19e-448d-b192-26ab15962ea7',
        masterBillingId: 'a3f51f4a-1f02-4b4d-9e11-97c93818e46d',
        name: 'Bea Pendidikan',
        amount: '20000000',
        description: '',
        status: BillingStatus.UNPAID,
        type: BillingType.BP
      },
    ]

    await Billing.updateOrCreateMany('id', billingsToCreate)

    console.log(">>> DONE seeding table: finance.billings")
  }
}
