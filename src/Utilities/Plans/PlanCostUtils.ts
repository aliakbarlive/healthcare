export const centsFormat = '$0,0.00'
export const dollarsFormat = '$0,0'

export const isDollar = (amount?: string) => {
  return amount?.startsWith('$') || false
}

export const isPercentage = (amount?: string) => {
  return amount?.endsWith('%') || false
}
