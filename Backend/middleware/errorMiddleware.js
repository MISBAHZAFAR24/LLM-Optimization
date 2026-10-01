export function errorMiddleware(error, _request, response, _next) {
  if (error.code === 11000) {
    return response.status(409).json({ detail: 'A record with these details already exists.' })
  }
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return response.status(400).json({ detail: error.message })
  }
  console.error(error)
  return response.status(error.status || 500).json({
    detail: error.status ? error.message : 'An unexpected server error occurred.',
  })
}
