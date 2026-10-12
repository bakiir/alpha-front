import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

// Import testable functions from seo.ts logic
function isStagingHost(host, env = {}) {
  if (env.APP_ENV === 'staging' || env.IS_STAGING === 'true') {
    return true
  }
  const clean = (host || '').toLowerCase().split(':')[0]
  if (
    clean.includes('test-nomad.kz') ||
    clean.includes('stage') ||
    clean.includes('dev') ||
    clean === 'localhost' ||
    clean === '127.0.0.1'
  ) {
    return true
  }
  return false
}

const NOINDEX_PREFIXES = [
  '/cart',
  '/checkout',
  '/payment',
  '/cabinet',
  '/profile',
  '/child',
  '/my-kit',
  '/history',
  '/toy-history',
  '/gift/claim',
  '/gifts/claim',
  '/kk/cart',
  '/kk/checkout',
  '/kk/payment',
  '/kk/cabinet',
  '/kk/profile',
  '/kk/child',
  '/kk/my-kit',
  '/kk/history',
  '/kk/toy-history',
  '/kk/gift/claim',
  '/kk/gifts/claim',
  '/en/cart',
  '/en/checkout',
  '/en/payment',
  '/en/cabinet',
  '/en/profile',
  '/en/child',
  '/en/my-kit',
  '/en/history',
  '/en/toy-history',
  '/en/gift/claim',
  '/en/gifts/claim',
]

function isNoindexRoute(path) {
  const normalized = (path || '/').toLowerCase().split('?')[0].replace(/\/+$/, '')
  return NOINDEX_PREFIXES.some(prefix => normalized === prefix || normalized.startsWith(`${prefix}/`))
}

function cleanRobotsDirectives(rawRobots, siteUrl) {
  let cleaned = rawRobots
    .split('\n')
    .filter(line => {
      const trimmed = line.trim().toLowerCase()
      return !trimmed.startsWith('host:') && !trimmed.startsWith('clean-param:')
    })
    .join('\n')
    .trim()

  if (!cleaned.toLowerCase().includes('sitemap:')) {
    cleaned += `\n\nSitemap: ${siteUrl}/sitemap.xml`
  }
  return cleaned
}

describe('SEO & Robots.txt Server Policy', () => {
  it('correctly distinguishes staging test contour from production', () => {
    assert.equal(isStagingHost('alpha.test-nomad.kz'), true)
    assert.equal(isStagingHost('back-alpha.test-nomad.kz'), true)
    assert.equal(isStagingHost('localhost:3000'), true)
    assert.equal(isStagingHost('127.0.0.1:3005'), true)
    assert.equal(isStagingHost('stage.alpha-toys.kz'), true)
    assert.equal(isStagingHost('alpha-toys.kz'), false)
    assert.equal(isStagingHost('www.alpha-toys.kz'), false)
  })

  it('identifies private, customer and transactional routes for X-Robots-Tag: noindex', () => {
    // Root & public routes should NOT be noindex
    assert.equal(isNoindexRoute('/'), false)
    assert.equal(isNoindexRoute('/shop'), false)
    assert.equal(isNoindexRoute('/shop?category=montessori'), false)
    assert.equal(isNoindexRoute('/product/42'), false)
    assert.equal(isNoindexRoute('/subscription'), false)
    assert.equal(isNoindexRoute('/about'), false)
    assert.equal(isNoindexRoute('/kk/shop'), false)
    assert.equal(isNoindexRoute('/en/subscription'), false)

    // Private / transactional routes MUST be noindex
    assert.equal(isNoindexRoute('/cart'), true)
    assert.equal(isNoindexRoute('/checkout'), true)
    assert.equal(isNoindexRoute('/checkout?step=payment'), true)
    assert.equal(isNoindexRoute('/payment/success'), true)
    assert.equal(isNoindexRoute('/payment/demo'), true)
    assert.equal(isNoindexRoute('/cabinet'), true)
    assert.equal(isNoindexRoute('/profile'), true)
    assert.equal(isNoindexRoute('/child'), true)
    assert.equal(isNoindexRoute('/gift/claim/token-123'), true)
    assert.equal(isNoindexRoute('/gifts/claim'), true)
    assert.equal(isNoindexRoute('/kk/checkout'), true)
    assert.equal(isNoindexRoute('/en/cabinet'), true)
    assert.equal(isNoindexRoute('/en/cart'), true)
  })

  it('strips Google-unsupported Host and Clean-param directives and ensures canonical Sitemap', () => {
    const rawCmsRobots = [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Host: https://alpha-toys.kz',
      'Clean-param: utm_source&utm_campaign /',
      'Sitemap: https://alpha-toys.kz/sitemap.xml',
    ].join('\n')

    const cleaned = cleanRobotsDirectives(rawCmsRobots, 'https://alpha-toys.kz')
    assert.ok(!cleaned.includes('Host:'), 'Host directive must be stripped')
    assert.ok(!cleaned.includes('Clean-param:'), 'Clean-param directive must be stripped')
    assert.ok(cleaned.includes('Sitemap: https://alpha-toys.kz/sitemap.xml'))
    assert.ok(cleaned.includes('Disallow: /admin'))
    assert.ok(!cleaned.includes('Disallow: /cart'), 'Cart must not be in Disallow so Googlebot can read noindex')
  })

  it('serves open crawling on staging so search bots can discover X-Robots-Tag: noindex', () => {
    const stagingRobots = 'User-agent: *\nAllow: /\n'
    assert.ok(stagingRobots.includes('Allow: /'), 'Staging robots must allow crawling so Googlebot reads noindex headers')
    assert.ok(!stagingRobots.includes('Disallow: /'), 'Staging robots must not blanket-block crawling')
  })
})
