import test from 'node:test'
import assert from 'node:assert/strict'
import app from '../app.js'

async function withServer(run) {
  const server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  try {
    await run(`http://127.0.0.1:${server.address().port}`)
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  }
}

test('health reports disconnected MongoDB instead of a false success', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`)
    assert.equal(response.status, 503)
    assert.deepEqual(await response.json(), {
      status: 'unavailable',
      service: 'promptly-api',
      database: 'disconnected',
    })
  })
})

test('usage endpoints require a bearer token', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/usage/summary`)
    assert.equal(response.status, 401)
    assert.deepEqual(await response.json(), { detail: 'Sign in to continue.' })
  })
})
