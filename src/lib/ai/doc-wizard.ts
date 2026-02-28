interface InvoiceWizardInput {
  supplierName?: string
  supplierInn?: string
  buyerName?: string
  buyerInn?: string
  firstItemName?: string
  totalAmount?: number
}

interface ActWizardInput {
  supplierName?: string
  supplierInn?: string
  buyerName?: string
  buyerInn?: string
  firstItemName?: string
  contractNumber?: string
  totalAmount?: number
}

export function getInvoiceWizardStatus(input: InvoiceWizardInput) {
  return {
    partiesDone: Boolean(input.supplierName?.trim() && input.supplierInn?.trim() && input.buyerName?.trim() && input.buyerInn?.trim()),
    itemsDone: Boolean(input.firstItemName?.trim()),
    totalsDone: (input.totalAmount || 0) > 0,
  }
}

export function getActWizardStatus(input: ActWizardInput) {
  return {
    partiesDone: Boolean(input.supplierName?.trim() && input.supplierInn?.trim() && input.buyerName?.trim() && input.buyerInn?.trim()),
    basisDone: Boolean(input.contractNumber?.trim()),
    itemsDone: Boolean(input.firstItemName?.trim()),
    totalsDone: (input.totalAmount || 0) > 0,
  }
}
