/**
 * Webhook Module
 * Creates a temporary HTTP server that waits for an incoming request.
 * Returns the first request received, then shuts down.
 */
import http from 'http'

export default {
  meta: {
    type: 'webhook',
    name: 'Webhook',
    description: 'Listens for an incoming HTTP request on a specified port',
    category: 'triggers',
    inputs: 0,
    outputs: 1
  },

  async execute(config, _inputData) {
    const port = config.port || 9100
    const path = config.path || '/'
    const timeout = config.timeout || 60000

    return new Promise((resolve, reject) => {
      let resolved = false

      const server = http.createServer((req, res) => {
        // Only accept requests matching the configured path
        const reqPath = req.url.split('?')[0]
        if (reqPath !== path && path !== '/') {
          res.writeHead(404, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Not found' }))
          return
        }

        let body = ''
        req.on('data', (chunk) => {
          body += chunk.toString()
        })

        req.on('end', () => {
          if (resolved) return
          resolved = true

          // Parse body if JSON
          let parsedBody = body
          const contentType = req.headers['content-type'] || ''
          if (contentType.includes('application/json') && body) {
            try {
              parsedBody = JSON.parse(body)
            } catch {
              // keep as string
            }
          }

          // Parse query params
          const urlObj = new URL(req.url, `http://localhost:${port}`)
          const query = Object.fromEntries(urlObj.searchParams.entries())

          // Send success response
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ received: true }))

          // Close server and resolve
          server.close()

          resolve({
            method: req.method,
            path: reqPath,
            headers: req.headers,
            query,
            body: parsedBody,
            timestamp: Date.now()
          })
        })
      })

      server.on('error', (err) => {
        if (!resolved) {
          resolved = true
          reject(new Error(`Webhook server error: ${err.message}`))
        }
      })

      // Timeout if no request received
      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true
          server.close()
          resolve({
            timeout: true,
            message: `No request received within ${timeout}ms`,
            timestamp: Date.now()
          })
        }
      }, timeout)

      server.listen(port, () => {
        // Server is listening
      })

      // Ensure timer is cleaned up when server closes
      server.on('close', () => {
        clearTimeout(timer)
      })
    })
  }
}
