interface ContractWizardInput {
  supplierName?: string
  supplierInn?: string
  buyerName?: string
  buyerInn?: string
  subject?: string
  firstItemName?: string
  paymentDays?: number
  paymentTerms?: string
  penaltyRate?: number
  jurisdiction?: string
  endDate?: string
}

export function getContractWizardStatus(input: ContractWizardInput) {
  const partiesDone = Boolean(input.supplierName?.trim() && input.supplierInn?.trim() && input.buyerName?.trim() && input.buyerInn?.trim())
  const scopeDone = Boolean(input.subject?.trim() && input.firstItemName?.trim())
  const paymentDone = Boolean((input.paymentDays || 0) > 0 || input.paymentTerms?.trim())
  const liabilityDone = input.penaltyRate !== undefined && input.penaltyRate >= 0 && Boolean(input.jurisdiction?.trim())
  const previewDone = Boolean(input.endDate?.trim())

  return {
    partiesDone,
    scopeDone,
    paymentDone,
    liabilityDone,
    previewDone,
  }
}
