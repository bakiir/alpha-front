export interface QuizState {
  childId: number | null
  childName: string
  childLastName: string
  ageMonths: number
  gender: 'male' | 'female'
  developmentFocus: string[]
  plan: string
  parentName: string
  parentLastName: string
  phone: string
  email: string
  address: string
  password: string
}

export const useQuiz = () => {
  const { user, isInitialized, fetchUser } = useAuth()
  const { request } = useApi()
  const isQuizOpen = useState<boolean>('quiz_open', () => false)
  const currentStep = useState<number>('quiz_step', () => 1)

  const form = useState<QuizState>('quiz_form', () => ({
    childId: null,
    childName: '',
    childLastName: '',
    ageMonths: 12,
    gender: 'male',
    developmentFocus: ['fine_motor', 'logic'],
    plan: '',
    parentName: '',
    parentLastName: '',
    phone: '',
    email: '',
    address: '',
    password: '',
  }))

  const openQuiz = async (initialPlan?: string, childId: number | null = null) => {
    if (!isInitialized.value) {
      await fetchUser()
    }

    if (user.value) {
      try {
        const res = await request<any>('/subscriptions')
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
        const hasActive = list.some((s: any) => s.status === 'active' || s.status === 'paused')
        if (hasActive) {
          navigateTo('/subscription')
          return
        }
      } catch {
        // fall through to quiz if subscription check fails
      }
    }

    form.value.childId = childId
    if (initialPlan) {
      form.value.plan = initialPlan
    }
    currentStep.value = 1
    isQuizOpen.value = true
  }

  const closeQuiz = () => {
    isQuizOpen.value = false
  }

  const nextStep = () => {
    if (currentStep.value < 5) {
      currentStep.value++
    }
  }

  const prevStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  return {
    isQuizOpen,
    currentStep,
    form,
    openQuiz,
    closeQuiz,
    nextStep,
    prevStep,
  }
}
