export function asyncHandler(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next)
  }
}

export function requireFields(fields) {
  return (request, response, next) => {
    const missing = fields.filter((field) => request.body[field] === undefined || request.body[field] === '')
    if (missing.length) {
      return response.status(400).json({ detail: `Required fields: ${missing.join(', ')}.` })
    }
    return next()
  }
}

export function requireNonNegativeNumbers(fields) {
  return (request, response, next) => {
    for (const field of fields) {
      const value = Number(request.body[field])
      if (!Number.isFinite(value) || value < 0) {
        return response.status(400).json({ detail: `${field} must be a non-negative number.` })
      }
      request.body[field] = value
    }
    return next()
  }
}
