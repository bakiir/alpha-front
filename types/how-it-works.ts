export type HowItWorksScenarioKey = 'subscription' | 'buying' | 'selling' | 'gift'

export interface HowItWorksCta {
  label: string
  to: string
}

export interface HowItWorksStepData {
  title: string
  paragraphs: string[]
  image: string
  imageAlt: string
  cta?: HowItWorksCta
}

export interface HowItWorksScenario {
  key: HowItWorksScenarioKey
  tabLabel: string
  eyebrow: string
  title: string
  description: string
  steps: HowItWorksStepData[]
}
