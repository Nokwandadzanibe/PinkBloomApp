// Smart Resource Allocation
// When inventory is limited, recommends how to allocate across requests
// based on need score, learners affected, shortage, and available quantity.
// The NGO must always be able to override the recommendation.

export function recommendAllocation(requests, availableQuantity) {
  // requests: [{ id, schoolName, quantity, needScore, learnersAffected, shortageHistory }]
  const totalRequested = requests.reduce((s, r) => s + r.quantity, 0)
  const insufficient = availableQuantity < totalRequested

  // Sort requests by priority: needScore desc, then learnersAffected desc, then shortage
  const sorted = [...requests].sort((a, b) => {
    if (b.needScore !== a.needScore) return b.needScore - a.needScore
    if (b.learnersAffected !== a.learnersAffected) return b.learnersAffected - a.learnersAffected
    return b.shortageHistory - a.shortageHistory
  })

  let remaining = availableQuantity
  const allocation = sorted.map(r => {
    if (remaining <= 0) return { requestId: r.id, schoolName: r.schoolName, requested: r.quantity, allocated: 0 }
    const give = Math.min(r.quantity, remaining)
    remaining -= give
    return { requestId: r.id, schoolName: r.schoolName, requested: r.quantity, allocated: give }
  })

  return {
    insufficient,
    totalRequested,
    availableQuantity,
    allocation
  }
}
