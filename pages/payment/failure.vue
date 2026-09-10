<template>
  <div class="payment-result-page">
    <TheHeader />
    <main class="container page-content">
      <div class="result-card">
        <div class="badge">!</div>
        <h1>Оплата не завершена</h1>
        <p>
          Платёж отменён или не прошёл. Заказ
          <template v-if="orderId"> №{{ orderId }} </template>
          остаётся неоплаченным — можно попробовать снова.
        </p>
        <div class="actions">
          <NuxtLink to="/checkout" class="btn btn--primary">Повторить оплату</NuxtLink>
          <NuxtLink to="/cart" class="btn">В корзину</NuxtLink>
          <NuxtLink to="/cabinet" class="btn">В кабинет</NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const orderId = computed(() => {
  const raw = route.query.order_id
  const n = Number(Array.isArray(raw) ? raw[0] : raw)
  return Number.isFinite(n) && n > 0 ? n : null
})
</script>

<style scoped>
.payment-result-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f4ef 0%, #fff 45%);
}
.page-content {
  padding: 48px 16px 80px;
  display: flex;
  justify-content: center;
}
.result-card {
  width: min(520px, 100%);
  background: #fff;
  border: 1px solid rgba(63, 103, 87, 0.12);
  border-radius: 20px;
  padding: 36px 28px;
  text-align: center;
  box-shadow: 0 12px 40px rgba(40, 50, 40, 0.06);
}
h1 {
  font-size: 1.5rem;
  margin: 16px 0 8px;
  color: #24352e;
}
p {
  color: #5b6b63;
  line-height: 1.5;
  margin: 0 0 24px;
}
.badge {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 700;
  background: #fdeceb;
  color: #b42318;
  margin: 0 auto;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 18px;
  border-radius: 12px;
  border: 1px solid rgba(63, 103, 87, 0.2);
  color: #3F6757;
  text-decoration: none;
  background: #fff;
  font: inherit;
}
.btn--primary {
  background: #3F6757;
  border-color: #3F6757;
  color: #fff;
}
</style>
