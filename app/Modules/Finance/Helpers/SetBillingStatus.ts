import { DateTime } from "luxon"
import Billing from "../Models/Billing"
import { BillingStatus } from "../lib/enums"

// Karena status billing value nya ngga disimpan di db,
// jadi harus set status setiap kali billing di get.
// NOTE: mutating argument
export const SetBillingStatus = async (billings: Billing[]) => {
    const currentTime = DateTime.local({ zone: 'utc+7' })

    // TODO: cek due_date

    /*
     * - jika sudah past due dan belum lunas, set ke past due
     * - selain itu set status by sisa tagihan
     *   - sisa === amount => unpaid
     *   - sisa === 0 => paid full
     *   - sisa > 0 && sisa < amount => paid partial
     *   ....
    */

    return billings.map(billing => {
        const remainingTime = billing.dueDate.diff(currentTime, 'seconds').toObject().seconds!
        if (billing.remainingAmount !== 0 && remainingTime < 0) {
            billing.$extras.status = BillingStatus.PAST_DUE
        } else if (billing.remainingAmount > 0 && billing.remainingAmount < billing.amount) {
            billing.$extras.status = BillingStatus.PAID_PARTIAL
        } else if (billing.remainingAmount === billing.amount) {
            billing.$extras.status = BillingStatus.UNPAID
        } else if (billing.remainingAmount === 0) {
            billing.$extras.status = BillingStatus.PAID_FULL
        }

        return billing
    })
}