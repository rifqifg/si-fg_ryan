export enum BillingPeriod {
    MONTHLY = 'monthly',
    ANNUALY = 'annualy',
    ONE_TIME = 'one_time'
}

export enum BillingType {
    SPP = 'spp',
    BWT = 'bwt',
    BP = 'bp',
    FG_EXTRA = 'fg_extra'
}

export enum BillingStatus {
    UNPAID = 'unpaid',
    PAID_PARTIAL = 'paid_partial',
    PAID_FULL = 'paid_full',
    APPROVED = 'approved'
}

export enum CoaTypes {
    ASSETS = 'assets',
    LIABILITIES = 'liabilities',
    EQUITY = 'equity',
    REVENUE = 'revenue',
    EXPENSES = 'expenses',
    GAINS = 'gains',
    LOSSES = 'losses'
}

export enum TransactionMethods {
    VIRTUAL_ACCOUNT = 'virtual_account',
    CASH = 'cash'
}

export enum TransactionTypes {
    DEBIT = 'debit',
    CREDIT = 'credit'
}

export enum TransactionStatus {
    WAITING = 'waiting',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

export enum RevenueStatus {
    NEW = 'new',
    EXPORTED = 'exported'
}