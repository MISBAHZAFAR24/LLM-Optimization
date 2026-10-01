import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateCost } from '../utils/calculateCost.js'

test('calculates token cost from per-million input and output prices', () => {
  assert.equal(calculateCost(1_000_000, 1_000_000, {
    input_cost_per_million: 5,
    output_cost_per_million: 15,
  }), 20)
})
