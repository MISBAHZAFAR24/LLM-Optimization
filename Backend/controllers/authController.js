import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email })

export async function register(request, response) {
  const { name, email, password } = request.body
  if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response.status(400).json({ detail: 'Enter your name and a valid email address, such as name@example.com.' })
  }
  if (typeof password !== 'string' || password.length < 8) {
    return response.status(400).json({ detail: 'Password must be at least 8 characters.' })
  }
  const passwordHash = await bcrypt.hash(password, 12)
  const user = await User.create({ name, email, passwordHash })
  const access_token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '12h' })
  return response.status(201).json({ access_token, token_type: 'bearer', user: publicUser(user) })
}

export async function login(request, response) {
  const email = typeof request.body.email === 'string' ? request.body.email.trim().toLowerCase() : ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response.status(400).json({ detail: 'Enter a valid email address, such as name@example.com.' })
  }
  if (typeof request.body.password !== 'string') {
    return response.status(400).json({ detail: 'Password must be a string.' })
  }
  const user = await User.findOne({ email })
  if (!user || !(await bcrypt.compare(request.body.password, user.passwordHash))) {
    return response.status(401).json({ detail: 'Email or password is incorrect.' })
  }
  const access_token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '12h' })
  return response.json({ access_token, token_type: 'bearer', user: publicUser(user) })
}
