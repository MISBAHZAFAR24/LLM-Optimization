import dns from 'node:dns'
import mongoose from 'mongoose'

dns.setServers(['8.8.8.8', '1.1.1.1'])

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URL
  if (!uri) {
    throw new Error('MONGODB_URI is required to start the API.')
  }
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DATABASE || 'llm_cost_optimization' })
  console.log(`MongoDB connected: ${mongoose.connection.name}`)
}

export async function disconnectDatabase() {
  await mongoose.disconnect()
}
