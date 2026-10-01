import jwt from 'jsonwebtoken'

export function requireAuth(request, response, next) {
  const authorization = request.headers.authorization || ''
  const [scheme, token] = authorization.split(' ')
  if (scheme !== 'Bearer' || !token) {
    return response.status(401).json({ detail: 'Sign in to continue.' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    request.userId = payload.sub
    return next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return response.status(401).json({ detail: 'Your session is invalid or has expired. Please sign in again.' })
    }
    return next(error)
  }
}
