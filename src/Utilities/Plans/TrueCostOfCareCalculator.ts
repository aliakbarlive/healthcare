import { moneyNumber } from './ContributionCalculator'

export class TrueCostOfCareCalculator {
  premium: number
  oopMax: number
  candorSavingsPercentage = 0.65

  constructor(premium: number, oopMax: number) {
    this.premium = premium
    this.oopMax = oopMax
  }

  minimumSpend() { return moneyNumber(this.premium) * 12 }
  maxSpend() { return this.minimumSpend() + moneyNumber(this.oopMax) }
  competitorCostOfCare() { return (this.minimumSpend() + this.maxSpend()) / 2 }
  candorCostOfCare() { return this.competitorCostOfCare() * this.candorSavingsPercentage }
}
