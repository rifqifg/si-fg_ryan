import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Account from '../../Models/Account'

export default class extends BaseSeeder {
  public async run() {
    console.log(">>> START seeding table: finance.accounts")

    const accountsToCreate = [
      {
        id: "2f5e0d47-7a9b-4c18-b017-990558e5e49e",
        student_id: "8cdc7765-3707-49fa-9588-2451d29083cc",
        // owner: "Anon",
        account_name: "Rekening Rahasisa",
        balance: "100",
        number: "12121212"
      },
      {
        id: "a73c8f12-6be7-4d28-aec0-8fd43f679c09",
        student_id: "97c9bd05-d638-4123-9a73-12cebaf42c38",
        // owner: "Anon",
        account_name: "Rekening SPP TES",
        balance: "100",
        number: "121212333"
      },
      {
        id: "e914c2b0-8f34-4737-b5b9-6028a5a4b3b1",
        student_id: "68a108d7-8202-4374-bf3a-5d0ae0101f26",
        // owner: "Anon",
        account_name: "Rekening SPP TES 2",
        balance: "100",
        number: "12331212"
      },
      {
        id: "56dc0623-9c64-489a-96e1-7459df9b2fb3",
        // student_id: "fe12707e-cd2b-4594-84f6-8cf729ef7264",
        owner: "Anonym",
        account_name: "Rekening Rahasisa",
        balance: "100",
        number: "12121212"
      },
      {
        id: "d8a517ef-20a7-42e8-a5d6-b8c5e6d9a0c6",
        // student_id: "fe12707e-cd2b-4594-84f6-8cf729ef7264",
        owner: "Anon",
        account_name: "Rekening Rahasya",
        balance: "100",
        number: "12121212"
      }
    ]

    await Account.updateOrCreateMany('id', accountsToCreate)

    console.log(">>> DONE seeding table: finance.accounts")
  }
}
