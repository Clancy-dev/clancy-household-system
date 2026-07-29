export interface ContactField {
  id: string
  name: string
  email: string
  phone: string
  countryCode: string
}

export interface CompanyContact {
  name: string
  phone: string
}

export type Currency =
  | "USD" | "EUR" | "GBP" | "UGX" | "KES" | "NGN" | "ZAR" | "CAD" | "AUD" | "JPY" | "CNY" | "CHF"

export interface ReceiptFormData {
  id: string
  customerName: string
  customerNames: { id: string; name: string }[]
  customerEmail: string
  customerEmails: { id: string; email: string }[]
  customerOrganization: string
  clientContacts: ContactField[]

  projectName: string
  serviceType: string
  projectStartDate: string
  projectEndDate: string
  description: string

  projectTotal: number
  amountPaid: number
  remainingBalance: number
  currency: Currency

  paymentMethod: string
  bankName?: string
  bankAccountNumber?: string
  cardNumber?: string
  mobileMoneyProvider?: string
  mobileNumber?: string
  countryCode?: string

  companyName?: string
  companyEmail?: string
  companyLogo?: string
  companyContacts?: CompanyContact[]

}