<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isQuizOpen" class="quiz-overlay" @click.self="closeQuiz">
        <div class="quiz-card">
          <!-- Close button -->
          <button class="close-btn" @click="closeQuiz" aria-label="Закрыть">&times;</button>

          <!-- Top Progress Bar -->
          <div class="progress-container">
            <div class="progress-bar" :style="{ width: `${(currentStep / 5) * 100}%` }"></div>
          </div>

          <div class="quiz-content">
            <!-- STEP 1: Child details -->
            <div v-if="currentStep === 1" class="step-pane">
              <div class="step-badge">Шаг 1 из 5</div>
              <h2 class="step-title">Расскажите о вашем малыше</h2>
              <p class="step-desc">Методисты Alpha подберут игрушки строго под текущий этап развития.</p>

              <div class="quiz-fields">
                <div class="form-group">
                  <label for="child-name">Как зовут ребёнка?</label>
                  <input 
                    id="child-name"
                    v-model="form.childName" 
                    type="text" 
                    placeholder="Например: Миша или София" 
                    required 
                  />
                </div>

                <div class="form-group">
                  <div class="label-with-val">
                    <label for="child-age">Возраст ребёнка:</label>
                    <span class="age-badge">{{ form.ageMonths }} месяцев ({{ formatAge(form.ageMonths) }})</span>
                  </div>
                  <input 
                    id="child-age"
                    v-model.number="form.ageMonths" 
                    type="range" 
                    min="1" 
                    max="60" 
                    step="1"
                    class="range-slider"
                    @change="fetchSampleToys"
                  />
                  <div class="slider-marks">
                    <span>1 мес</span>
                    <span>1 год</span>
                    <span>2 года</span>
                    <span>3 года</span>
                    <span>5 лет</span>
                  </div>
                </div>

                <div class="form-group">
                  <label>Пол ребёнка:</label>
                  <div class="gender-selector">
                    <button 
                      type="button" 
                      :class="['gender-btn', { active: form.gender === 'male' }]"
                      @click="form.gender = 'male'"
                    >
                      Мальчик
                    </button>
                    <button 
                      type="button" 
                      :class="['gender-btn', { active: form.gender === 'female' }]"
                      @click="form.gender = 'female'"
                    >
                      Девочка
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 2: Development Focus -->
            <div v-if="currentStep === 2" class="step-pane">
              <div class="step-badge">Шаг 2 из 5</div>
              <h2 class="step-title">Что вы хотите развивать?</h2>
              <p class="step-desc">Выберите 1 или несколько приоритетных навыков.</p>

              <div class="focus-grid">
                <div 
                  v-for="skill in skills" 
                  :key="skill.id"
                  :class="['skill-card', { selected: form.developmentFocus.includes(skill.id) }]"
                  @click="toggleSkill(skill.id)"
                >
                  <span class="skill-icon"><AppIcon :name="skill.icon" :size="22" /></span>
                  <div class="skill-info">
                    <strong>{{ skill.title }}</strong>
                    <p>{{ skill.desc }}</p>
                  </div>
                  <span class="check-mark">{{ form.developmentFocus.includes(skill.id) ? '✓' : '+' }}</span>
                </div>
              </div>
            </div>

            <!-- STEP 3: Plan Selection -->
            <div v-if="currentStep === 3" class="step-pane">
              <div class="step-badge">Шаг 3 из 5</div>
              <h2 class="step-title">Выберите подходящий тариф</h2>
              <p class="step-desc">Каждый тариф включает бесплатную замену каждые 2 месяца.</p>

              <div v-if="isLoadingPlans" class="loading-state">
                <span class="spinner-purple"></span>
                <p>Загружаем тарифы...</p>
              </div>

              <div v-else-if="quizPlans.length === 0" class="loading-state">
                <p>Активные тарифы пока не настроены.</p>
              </div>

              <div v-else class="plans-grid">
                <div
                  v-for="plan in quizPlans"
                  :key="plan.slug"
                  :class="['plan-select-card', { popular: plan.isFeatured, active: form.plan === plan.slug }]"
                  @click="form.plan = plan.slug"
                >
                  <span v-if="plan.isFeatured" class="popular-tag">Хит выбор родителей</span>
                  <div class="plan-head">
                    <h3>{{ plan.name }}</h3>
                    <span class="plan-price">{{ formatPrice(plan.price_monthly) }} ₸ <small>/мес</small></span>
                  </div>
                  <p class="plan-toys-count"><AppIcon name="toy" :size="14" class="inline-icon" /> <strong>{{ plan.toys_count }} {{ plan.toys_count === 1 ? 'игрушка' : 'игрушки' }}</strong> в наборе</p>
                  <span class="plan-sub">{{ plan.description || 'Развивающий набор по возрасту ребёнка' }}</span>
                </div>
              </div>
            </div>

            <!-- STEP 4: Live Kit Preview -->
            <div v-if="currentStep === 4" class="step-pane">
              <div class="step-badge">Шаг 4 из 5</div>
              <h2 class="step-title">Пример набора для {{ form.childName || 'малыша' }}</h2>
              <p class="step-desc">
                Эти игрушки из каталога Alpha подобраны под возраст <strong>{{ form.ageMonths }} мес</strong>:
              </p>

              <div v-if="isLoadingToys" class="loading-state">
                <span class="spinner-purple"></span>
                <p>Подбираем развивающие игрушки по методике Монтессори...</p>
              </div>

              <div v-else class="toys-preview-grid">
                <div v-for="toy in sampleToys" :key="toy.id" class="toy-card-mini">
                  <img :src="toy.image_url" :alt="toy.name" class="toy-img" />
                  <div class="toy-details">
                    <strong class="toy-name">{{ toy.name }}</strong>
                    <div class="toy-badges">
                      <span class="age-pill">{{ toy.min_age_months }}-{{ toy.max_age_months }} мес</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 5: Delivery & Account -->
            <div v-if="currentStep === 5" class="step-pane">
              <div class="step-badge">Шаг 5 из 5</div>
              <h2 class="step-title">Куда доставить первый набор?</h2>
              <p class="step-desc">Заполните адрес и контакты для бесплатной доставки курьером.</p>

              <!-- Error -->
              <div v-if="submissionError" class="error-alert">
                <AppIcon name="alert" :size="16" class="inline-icon" /> {{ submissionError }}
              </div>

              <div class="quiz-fields">
                <div class="form-row">
                  <div class="form-group">
                    <label for="parent-name">Ваше имя (родитель)</label>
                    <input 
                      id="parent-name"
                      v-model="form.parentName" 
                      type="text" 
                      placeholder="Анна Смирнова" 
                      required 
                    />
                  </div>
                  <div class="form-group">
                    <label for="parent-phone">Номер телефона</label>
                    <input 
                      id="parent-phone"
                      :value="form.phone" 
                      type="tel" 
                      placeholder="+7 (701) 123-45-67" 
                      maxlength="18"
                      @input="onPhoneInput"
                      required 
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label for="parent-address">Адрес доставки (город, улица, дом, кв.)</label>
                  <input 
                    id="parent-address"
                    v-model="form.address" 
                    type="text" 
                    placeholder="г. Алматы, пр. Абая 45, кв. 12" 
                    required 
                  />
                </div>

                <div v-if="!user" class="form-row">
                  <div class="form-group">
                    <label for="parent-email">Email для личного кабинета</label>
                    <input 
                      id="parent-email"
                      v-model="form.email" 
                      type="email" 
                      placeholder="anna@example.com" 
                      required 
                    />
                  </div>
                  <div class="form-group">
                    <label for="parent-pass">Придумайте пароль</label>
                    <input 
                      id="parent-pass"
                      v-model="form.password" 
                      type="password" 
                      placeholder="Минимум 8 символов" 
                      required 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Navigation Controls -->
          <div class="quiz-controls">
            <button 
              v-if="currentStep > 1" 
              type="button" 
              class="prev-btn" 
              @click="prevStep"
            >
              ← Назад
            </button>
            <div v-else></div>

            <button 
              v-if="currentStep < 5" 
              type="button" 
              class="next-btn" 
              @click="handleNextStep"
            >
              Продолжить →
            </button>

            <button 
              v-else 
              type="button" 
              class="finish-btn" 
              :disabled="isSubmitting"
              @click="submitSubscription"
            >
              <span v-if="isSubmitting" class="spinner"></span>
              <span v-else>Оформить подписку{{ selectedQuizPlan ? ` (${formatPrice(selectedQuizPlan.price_monthly)} ₸)` : '' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

const { isQuizOpen, currentStep, form, closeQuiz, nextStep, prevStep } = useQuiz()
const { user, register, login } = useAuth()
const { request } = useApi()
const { plans, fetchPlans, isLoading: isLoadingPlans } = useSubscriptionPlans()

const isSubmitting = ref<boolean>(false)
const submissionError = ref<string>('')
const isLoadingToys = ref<boolean>(false)
const sampleToys = ref<any[]>([])

const quizPlans = computed(() => (
  plans.value.map((plan, index) => ({
    ...plan,
    isFeatured: index === 1 || Boolean(plan.badge && /хит|популяр/i.test(plan.badge)),
  }))
))

const selectedQuizPlan = computed(() => (
  quizPlans.value.find(plan => plan.slug === form.value.plan) || quizPlans.value[0]
))

const formatPrice = (value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

const skills = [
  { id: 'fine_motor', icon: 'baby', title: 'Мелкая моторика', desc: 'Пинцетный захват, координация пальцев' },
  { id: 'montessori', icon: 'leaf', title: 'Монтессори', desc: 'Натуральное дерево, сенсорное познание' },
  { id: 'logic', icon: 'how-it-works', title: 'Логика и мышление', desc: 'Сортеры, последовательности, пространственное мышление' },
  { id: 'sensory', icon: 'palette', title: 'Сенсорика и формы', desc: 'Фактуры, геометрические формы, цвета' },
  { id: 'language', icon: 'message', title: 'Речь и звуки', desc: 'Тактильные карточки, звуковые элементы' },
  { id: 'creativity', icon: 'sparkles', title: 'Воображение', desc: 'Сюжетно-ролевая игра, конструирование' },
]

const toggleSkill = (skillId: string) => {
  const idx = form.value.developmentFocus.indexOf(skillId)
  if (idx > -1) {
    if (form.value.developmentFocus.length > 1) {
      form.value.developmentFocus.splice(idx, 1)
    }
  } else {
    form.value.developmentFocus.push(skillId)
  }
}

const onPhoneInput = (event: Event) => {
  handlePhoneInput(event, (val) => {
    form.value.phone = val
  })
}

const formatAge = (months: number) => {
  const years = Math.floor(months / 12)
  const remMonths = months % 12
  if (years === 0) return `${months} мес`
  if (remMonths === 0) return `${years} ${years === 1 ? 'год' : (years < 5 ? 'года' : 'лет')}`
  return `${years} г ${remMonths} мес`
}

const fetchSampleToys = async () => {
  isLoadingToys.value = true
  try {
    const res = await request<any>(`/toys?age_months=${form.value.ageMonths}`)
    const toysCount = selectedQuizPlan.value?.toys_count || 3
    sampleToys.value = (res.data || []).slice(0, toysCount)
  } catch (err) {
    console.error('Failed to load sample toys', err)
  } finally {
    isLoadingToys.value = false
  }
}

const handleNextStep = () => {
  if (currentStep.value === 1 && !form.value.childName.trim()) {
    form.value.childName = 'Малыш'
  }
  if (currentStep.value === 3) {
    fetchSampleToys()
  }
  nextStep()
}

const submitSubscription = async () => {
  submissionError.value = ''
  isSubmitting.value = true

  try {
    // 1. If not logged in, register/login parent
    if (!user.value) {
      if (!form.value.email || !form.value.password || !form.value.phone) {
        submissionError.value = 'Заполните все контактные поля'
        isSubmitting.value = false
        return
      }

      try {
        await register({
          name: form.value.parentName || 'Родитель',
          email: form.value.email,
          phone: form.value.phone,
          password: form.value.password,
          password_confirmation: form.value.password,
        })
      } catch (err: any) {
        // If already registered, try login
        try {
          await login({ email: form.value.email, password: form.value.password })
        } catch {
          submissionError.value = err?.data?.message || 'Ошибка регистрации аккаунта'
          isSubmitting.value = false
          return
        }
      }
    }

    // Calculate approx birth date from months
    const birthDate = new Date()
    birthDate.setMonth(birthDate.getMonth() - form.value.ageMonths)
    const birthDateStr = birthDate.toISOString().split('T')[0]

    // 2. Create Child profile
    const childRes = await request<any>('/children', {
      method: 'POST',
      body: {
        name: form.value.childName || 'Малыш',
        birth_date: birthDateStr,
        interests: form.value.developmentFocus,
      },
    })

    const childId = childRes.data?.id || childRes.id

    // 3. Create Subscription
    const subscriptionBody: Record<string, number> = { child_id: childId }
    if (selectedQuizPlan.value?.id) {
      subscriptionBody.subscription_plan_id = selectedQuizPlan.value.id
    }

    await request('/subscriptions', {
      method: 'POST',
      body: subscriptionBody,
    })

    // Success! Redirect to subscription dashboard
    closeQuiz()
    navigateTo('/subscription')
  } catch (err: any) {
    submissionError.value = err?.data?.message || 'Не удалось оформить подписку. Попробуйте еще раз.'
  } finally {
    isSubmitting.value = false
  }
}

watch(() => isQuizOpen.value, async (open) => {
  if (open) {
    await fetchPlans()
    if (!form.value.plan && quizPlans.value.length > 0) {
      const featured = quizPlans.value.find(plan => plan.isFeatured) || quizPlans.value[0]
      form.value.plan = featured.slug
    }
    fetchSampleToys()
  }
})
</script>

<style scoped>
.quiz-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 46, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.quiz-card {
  position: relative;
  background: #FFFFFF;
  width: 100%;
  max-width: 620px;
  max-height: 90vh;
  border-radius: 28px;
  box-shadow: 0 25px 50px -12px rgba(26, 26, 46, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #F4F4F8;
  color: #4A4A68;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #E8E8EE;
  color: #1A1A2E;
}

.progress-container {
  width: 100%;
  height: 6px;
  background: #F0F0F6;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #7C5CFC, #06D6A0);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.quiz-content {
  padding: 36px 36px 20px 36px;
  overflow-y: auto;
  flex: 1;
}

.step-badge {
  display: inline-block;
  background: rgba(124, 92, 252, 0.1);
  color: #7C5CFC;
  font-weight: 700;
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 12px;
}

.step-title {
  font-family: 'Outfit', sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: #1A1A2E;
  margin-bottom: 8px;
  line-height: 1.25;
}

.step-desc {
  font-size: 15px;
  color: #7B7B93;
  margin-bottom: 24px;
}

.quiz-fields {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.form-row {
  display: flex;
  gap: 14px;
}

.label-with-val {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.age-badge {
  background: #7C5CFC;
  color: white;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
}

.range-slider {
  width: 100%;
  accent-color: #7C5CFC;
  cursor: pointer;
  height: 8px;
}

.slider-marks {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #A0A0B2;
}

.form-group label {
  font-size: 14px;
  font-weight: 700;
  color: #1A1A2E;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="tel"],
.form-group input[type="password"] {
  padding: 13px 16px;
  border: 1.5px solid #E2E2EC;
  border-radius: 14px;
  font-size: 15px;
  color: #1A1A2E;
  background: #FAFAFC;
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #7C5CFC;
  background: #FFFFFF;
  box-shadow: 0 0 0 3px rgba(124, 92, 252, 0.15);
}

.gender-selector {
  display: flex;
  gap: 12px;
}

.gender-btn {
  flex: 1;
  padding: 12px;
  border-radius: 14px;
  border: 1.5px solid #E2E2EC;
  background: #FAFAFC;
  font-size: 15px;
  font-weight: 700;
  color: #4A4A68;
  cursor: pointer;
  transition: all 0.2s ease;
}

.gender-btn.active {
  border-color: #7C5CFC;
  background: rgba(124, 92, 252, 0.08);
  color: #7C5CFC;
}

/* Skills Grid */
.focus-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.skill-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
  border: 1.5px solid #EAEAF2;
  background: #FAFAFC;
  cursor: pointer;
  transition: all 0.2s ease;
}

.skill-card.selected {
  border-color: #7C5CFC;
  background: rgba(124, 92, 252, 0.06);
}

.skill-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7C5CFC;
}

.plan-toys-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.skill-info strong {
  display: block;
  font-size: 14px;
  color: #1A1A2E;
}

.skill-info p {
  font-size: 12px;
  color: #7B7B93;
  margin-top: 2px;
  line-height: 1.3;
}

.check-mark {
  margin-left: auto;
  font-weight: 800;
  color: #7C5CFC;
}

/* Plans */
.plans-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plan-select-card {
  position: relative;
  padding: 16px 20px;
  border-radius: 18px;
  border: 2px solid #EAEAF2;
  background: #FAFAFC;
  cursor: pointer;
  transition: all 0.2s ease;
}

.plan-select-card.active {
  border-color: #7C5CFC;
  background: rgba(124, 92, 252, 0.05);
  box-shadow: 0 8px 20px rgba(124, 92, 252, 0.12);
}

.plan-select-card.popular {
  border-color: #FFD166;
}

.popular-tag {
  position: absolute;
  top: -10px;
  right: 16px;
  background: #FFD166;
  color: #1A1A2E;
  font-weight: 800;
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 10px;
}

.plan-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.plan-head h3 {
  font-size: 18px;
  font-weight: 800;
  color: #1A1A2E;
}

.plan-price {
  font-size: 18px;
  font-weight: 800;
  color: #7C5CFC;
}

.plan-price small {
  font-size: 13px;
  color: #7B7B93;
}

.plan-toys-count {
  font-size: 14px;
  color: #1A1A2E;
  margin-bottom: 2px;
}

.plan-sub {
  font-size: 12px;
  color: #7B7B93;
}

/* Toys Preview Grid */
.toys-preview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-height: 280px;
  overflow-y: auto;
}

.toy-card-mini {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #F8F8FC;
  border-radius: 14px;
  border: 1px solid #ECECF4;
}

.toy-img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 10px;
}

.toy-details {
  flex: 1;
  min-width: 0;
}

.toy-name {
  display: block;
  font-size: 13px;
  color: #1A1A2E;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.age-pill {
  display: inline-block;
  background: #EAEAF4;
  color: #4A4A68;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 6px;
  margin-top: 4px;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #7B7B93;
}

/* Controls */
.quiz-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 36px 28px 36px;
  background: #FFFFFF;
  border-top: 1px solid #F0F0F6;
}

.prev-btn {
  background: transparent;
  border: none;
  font-weight: 700;
  font-size: 15px;
  color: #7B7B93;
  cursor: pointer;
}

.next-btn, .finish-btn {
  padding: 14px 28px;
  border-radius: 14px;
  border: none;
  background: #7C5CFC;
  color: #FFFFFF;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(124, 92, 252, 0.3);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.next-btn:hover, .finish-btn:hover {
  background: #6848e0;
  transform: translateY(-1px);
}

.finish-btn {
  background: #06D6A0;
  box-shadow: 0 8px 24px rgba(6, 214, 160, 0.35);
  color: #0A3622;
  font-weight: 800;
}

.finish-btn:hover {
  background: #05bf8e;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(10, 54, 34, 0.3);
  border-top-color: #0A3622;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-purple {
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid rgba(124, 92, 252, 0.2);
  border-top-color: #7C5CFC;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

.error-alert {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #FFF0F2;
  border: 1px solid #FFD0D6;
  color: #E63946;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 16px;
  font-size: 14px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .quiz-content { padding: 24px 20px 16px 20px; }
  .quiz-controls { padding: 14px 20px 20px 20px; }
  .focus-grid { grid-template-columns: 1fr; }
  .form-row { flex-direction: column; gap: 10px; }
}
</style>
