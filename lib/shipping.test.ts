import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  FLAT_SHIPPING_COST,
  FREE_SHIPPING_THRESHOLD,
  getFreeShippingMessage,
  getFreeShippingProgress,
  getFreeShippingRemaining,
  getShippingCost,
} from './shipping'

const UNLOCKED = 'You’ve unlocked free shipping!'

interface Case {
  name: string
  subtotal: number
  shipping: number
  remaining: number
  progress: number
  message: string
}

function check(c: Case) {
  it(c.name, () => {
    assert.equal(getShippingCost(c.subtotal), c.shipping)
    assert.equal(getFreeShippingRemaining(c.subtotal), c.remaining)
    assert.equal(getFreeShippingProgress(c.subtotal), c.progress)
    assert.equal(getFreeShippingMessage(c.subtotal), c.message)
  })
}

describe('shipping policy constants', () => {
  it('free at 5000 cents, otherwise 500 cents', () => {
    assert.equal(FREE_SHIPPING_THRESHOLD, 5000)
    assert.equal(FLAT_SHIPPING_COST, 500)
  })
})

describe('below the free-shipping threshold', () => {
  check({
    name: 'one shampoo (3900)',
    subtotal: 3900,
    shipping: 500,
    remaining: 1100,
    progress: 0.78,
    message: 'Add $11 more for free shipping.',
  })
  check({
    name: 'one conditioner (2500)',
    subtotal: 2500,
    shipping: 500,
    remaining: 2500,
    progress: 0.5,
    message: 'Add $25 more for free shipping.',
  })
  check({
    name: 'fractional remaining (4950)',
    subtotal: 4950,
    shipping: 500,
    remaining: 50,
    progress: 0.99,
    message: 'Add $0.50 more for free shipping.',
  })
  check({
    name: 'empty cart (0)',
    subtotal: 0,
    shipping: 500,
    remaining: 5000,
    progress: 0,
    message: 'Add $50 more for free shipping.',
  })
})

describe('exactly at the free-shipping threshold', () => {
  check({
    name: 'two conditioners (5000)',
    subtotal: 5000,
    shipping: 0,
    remaining: 0,
    progress: 1,
    message: UNLOCKED,
  })
})

describe('above the free-shipping threshold', () => {
  check({
    name: 'two shampoos (7800), progress capped at 1',
    subtotal: 7800,
    shipping: 0,
    remaining: 0,
    progress: 1,
    message: UNLOCKED,
  })
})
