import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import MasterBilling from '../../Models/MasterBilling'
import { BillingPeriod, BillingType } from '../../lib/enums'
import { DateTime } from "luxon"

export default class extends BaseSeeder {
  public async run() {
    console.log(">>> START seeding table: finance.master_billings")

    const masterBillingsToCreate = [
      {
        id: '9d6e2a88-6d79-4e54-bf7c-3e78a1d4d61a',
        name: 'Skema SPP 1 Juta',
        period: BillingPeriod.MONTHLY,
        amount: '1000000',
        type: BillingType.SPP,
        dueDate: DateTime.local(2021, 4, 1, { zone: "utc+7" })
      },
      {
        id: '7c402ea1-8f4f-483b-9bfb-0a38a82dcbb1',
        name: 'Skema SPP 1,3 Juta',
        period: BillingPeriod.MONTHLY,
        amount: '1300000',
        type: BillingType.SPP,
        dueDate: DateTime.local(2021, 4, 1, { zone: "utc+7" })
      },
      {
        id: 'f2dcdbe5-9417-465b-8b8e-75d8e4c4cfac',
        name: 'Skema SPP 1,8 Juta',
        period: BillingPeriod.MONTHLY,
        amount: '1800000',
        type: BillingType.SPP,
        dueDate: DateTime.local(2021, 4, 1, { zone: "utc+7" })
      },
      {
        id: '6b8658c2-af99-4753-b1e3-cdb076880a27',
        name: 'Skema BWT 3 Juta',
        period: BillingPeriod.MONTHLY,
        amount: '3000000',
        type: BillingType.BWT,
        dueDate: DateTime.local(2021, 4, 1, { zone: "utc+7" })
      },
      {
        id: 'a3f51f4a-1f02-4b4d-9e11-97c93818e46d',
        name: 'Skema Bea Pendidikan 20 Juta',
        period: BillingPeriod.MONTHLY,
        amount: '20000000',
        type: BillingType.BP,
        dueDate: DateTime.local(2021, 4, 1, { zone: "utc+7" })
      }
    ]

    await MasterBilling.updateOrCreateMany('id', masterBillingsToCreate)

    console.log(">>> DONE seeding table: finance.master_billings")
  }
}
