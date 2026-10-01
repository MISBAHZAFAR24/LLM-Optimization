export function calculateCost(inputTokens, outputTokens, pricing) {
  return (inputTokens * pricing.input_cost_per_million +
    outputTokens * pricing.output_cost_per_million) / 1_000_000
}
