export interface PackageProgressState {
  contractDone: boolean
  invoiceDone: boolean
  actDone: boolean
}

export function calcPackageProgress(state: PackageProgressState) {
  const doneCount = [state.contractDone, state.invoiceDone, state.actDone].filter(Boolean).length
  return {
    doneCount,
    total: 3,
    isComplete: doneCount === 3,
  }
}
