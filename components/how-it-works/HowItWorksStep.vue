<template>
  <article class="how-step" :class="{ 'is-reversed': reversed }">
    <span class="how-step__number" aria-hidden="true">{{ formattedIndex }}</span>

    <div class="how-step__media">
      <img
        :src="step.image"
        :alt="step.imageAlt"
        width="1254"
        height="1254"
        loading="lazy"
      />
    </div>

    <div class="how-step__content">
      <span class="how-step__eyebrow">ШАГ {{ formattedIndex }}</span>
      <h3>{{ step.title }}</h3>
      <p v-for="paragraph in step.paragraphs" :key="paragraph">{{ paragraph }}</p>
      <NuxtLink v-if="step.cta" :to="step.cta.to" class="how-step__cta">
        {{ step.cta.label }}
        <span aria-hidden="true">→</span>
      </NuxtLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { HowItWorksStepData } from '~/types/how-it-works'

const props = defineProps<{
  step: HowItWorksStepData
  index: number
  reversed?: boolean
}>()

const formattedIndex = computed(() => String(props.index + 1).padStart(2, '0'))
</script>

<style scoped>
.how-step {
  position: relative;
  display: grid;
  grid-template-columns: minmax(320px, 0.92fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(54px, 8vw, 122px);
  min-height: 460px;
}

.how-step.is-reversed .how-step__media {
  order: 2;
}

.how-step.is-reversed .how-step__content {
  order: 1;
}

.how-step__number {
  position: absolute;
  z-index: 0;
  top: -34px;
  right: 0;
  color: rgba(51, 61, 54, 0.065);
  font-family: 'Onest', sans-serif;
  font-size: clamp(96px, 11vw, 152px);
  font-weight: 900;
  line-height: 1;
}

.how-step.is-reversed .how-step__number {
  right: auto;
  left: 0;
}

.how-step__media {
  position: relative;
  z-index: 1;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 30px;
  background: #EFE9DF;
}

.how-step__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 400ms ease;
}

.how-step:hover .how-step__media img {
  transform: scale(1.018);
}

.how-step__content {
  position: relative;
  z-index: 1;
  max-width: 590px;
}

.how-step__eyebrow {
  display: block;
  margin-bottom: 13px;
  color: #496B5A;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.4px;
}

.how-step h3 {
  margin: 0 0 20px;
  font-size: clamp(30px, 3.3vw, 48px);
  line-height: 1.07;
}

.how-step p {
  margin: 0 0 13px;
  color: #615e76;
  font-size: 16px;
  line-height: 1.7;
}

.how-step__cta {
  display: inline-flex;
  align-items: center;
  gap: 11px;
  margin-top: 14px;
  padding: 14px 20px;
  border-radius: var(--radius-full);
  color: #fff;
  background: #496B5A;
  box-shadow: 0 10px 24px rgba(51, 61, 54, 0.22);
  font-size: 14px;
  font-weight: 800;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.how-step__cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(51, 61, 54, 0.28);
}

@media (max-width: 900px) {
  .how-step {
    grid-template-columns: minmax(250px, 0.82fr) minmax(0, 1fr);
    gap: 42px;
    min-height: 390px;
  }
}

@media (max-width: 680px) {
  .how-step,
  .how-step.is-reversed {
    display: flex;
    align-items: stretch;
    flex-direction: column;
    gap: 24px;
    min-height: 0;
    padding: 0;
  }

  .how-step__number,
  .how-step.is-reversed .how-step__number {
    position: relative;
    top: auto;
    right: auto;
    left: auto;
    order: 1;
    font-size: 66px;
    line-height: 0.8;
  }

  .how-step__media,
  .how-step.is-reversed .how-step__media {
    order: 2;
    width: 100%;
    border-radius: 23px;
  }

  .how-step__content,
  .how-step.is-reversed .how-step__content {
    order: 3;
  }

  .how-step h3 {
    font-size: 30px;
  }

  .how-step p {
    font-size: 15px;
    line-height: 1.62;
  }
}
</style>
