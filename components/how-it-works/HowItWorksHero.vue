<template>
  <section class="how-hero">
    <div class="how-hero__inner container">
      <div class="how-hero__copy">
        <h1>Как это работает</h1>
        <p>
          Всё просто: выбирайте игрушки по подписке, покупайте понравившиеся,
          продавайте те, которыми ребёнок больше не играет, или дарите сертификаты близким.
        </p>
      </div>

      <div class="how-hero__visual" aria-hidden="true">
        <span class="how-hero__shape how-hero__shape--yellow"></span>
        <span class="how-hero__shape how-hero__shape--mint"></span>
        <div class="how-hero__image-frame">
          <img
            src="/images/how-it-works/1.3.jpg"
            alt=""
            width="1254"
            height="1254"
            fetchpriority="high"
          />
        </div>
        <span class="how-hero__note">Выбирайте свой сценарий ↓</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.how-hero {
  position: relative;
  overflow: hidden;
  background: #eee9ff;
}

.how-hero__inner {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.75fr);
  align-items: center;
  gap: clamp(48px, 7vw, 104px);
  min-height: 610px;
  padding-top: 76px;
  padding-bottom: 112px;
}

.how-hero__copy {
  position: relative;
  z-index: 2;
  max-width: 780px;
}

.how-hero h1 {
  max-width: 780px;
  margin: 0;
  font-size: clamp(58px, 7.5vw, 112px);
  font-weight: 900;
  letter-spacing: -0.055em;
  line-height: 0.92;
}

.how-hero p {
  max-width: 670px;
  margin-top: 30px;
  color: #4a4865;
  font-size: clamp(17px, 1.55vw, 22px);
  line-height: 1.55;
}

.how-hero__visual {
  position: relative;
  min-height: 420px;
}

.how-hero__image-frame {
  position: absolute;
  z-index: 2;
  top: 8px;
  right: 0;
  width: min(100%, 430px);
  aspect-ratio: 1;
  padding: 12px;
  transform: rotate(2.5deg);
  border-radius: 38px;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 28px 70px rgba(77, 58, 155, 0.18);
}

.how-hero__image-frame img {
  width: 100%;
  height: 100%;
  border-radius: 29px;
  object-fit: cover;
}

.how-hero__shape {
  position: absolute;
  border-radius: 999px;
}

.how-hero__shape--yellow {
  top: -36px;
  right: -70px;
  width: 230px;
  height: 230px;
  background: #ffd166;
}

.how-hero__shape--mint {
  right: 280px;
  bottom: -14px;
  width: 150px;
  height: 150px;
  background: #74e3c8;
}

.how-hero__note {
  position: absolute;
  z-index: 3;
  right: 278px;
  bottom: 8px;
  transform: rotate(-5deg);
  color: #624ce0;
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 800;
}

@media (max-width: 1000px) {
  .how-hero__inner {
    grid-template-columns: 1fr minmax(300px, 0.68fr);
    min-height: 540px;
    padding-top: 58px;
    padding-bottom: 94px;
  }

  .how-hero__visual {
    min-height: 340px;
  }

  .how-hero__note {
    display: none;
  }
}

@media (max-width: 760px) {
  .how-hero__inner {
    grid-template-columns: 1fr;
    gap: 34px;
    padding-top: 46px;
    padding-bottom: 88px;
  }

  .how-hero h1 {
    font-size: clamp(52px, 16vw, 74px);
  }

  .how-hero p {
    margin-top: 22px;
    font-size: 16px;
  }

  .how-hero__visual {
    min-height: 300px;
  }

  .how-hero__image-frame {
    right: 50%;
    width: min(84vw, 330px);
    transform: translateX(50%) rotate(2deg);
  }

  .how-hero__shape--yellow {
    right: -48px;
    width: 170px;
    height: 170px;
  }

  .how-hero__shape--mint {
    right: auto;
    left: -42px;
    width: 120px;
    height: 120px;
  }
}
</style>
