/**
 * HTTP Request Module
 * Makes HTTP requests using the native fetch API.
 */
export default {
  meta: {
    type: 'httpRequest',
    name: 'HTTP Request',
    description: 'Send an HTTP request to any URL and receive the response',
    category: 'network',
    inputs: 1,
    outputs: 1
  },

  async execute(config, inputData) {
    const url = config.url
    if (!url) {
      throw new Error('HTTP Request: URL is required')
    }

    const method = (config.method || 'GET').toUpperCase()
    const headers = config.headers || {}
    const timeout = config.timeout || 30000

    const fetchOptions = {
      method,
      headers: { ...headers },
      signal: AbortSignal.timeout(timeout)
    }

    // Attach body for methods that support it
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      if (config.body !== undefined && config.body !== null) {
        if (typeof config.body === 'object') {
          fetchOptions.body = JSON.stringify(config.body)
          if (!fetchOptions.headers['Content-Type'] && !fetchOptions.headers['content-type']) {
            fetchOptions.headers['Content-Type'] = 'application/json'
          }
        } else {
          fetchOptions.body = String(config.body)
        }
      } else if (inputData && typeof inputData === 'object' && inputData.body) {
        // Use inputData.body as fallback
        if (typeof inputData.body === 'object') {
          fetchOptions.body = JSON.stringify(inputData.body)
          if (!fetchOptions.headers['Content-Type'] && !fetchOptions.headers['content-type']) {
            fetchOptions.headers['Content-Type'] = 'application/json'
          }
        } else {
          fetchOptions.body = String(inputData.body)
        }
      }
    }

    const response = await fetch(url, fetchOptions)

    // Extract response headers
    const responseHeaders = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    // Parse response body
    const contentType = response.headers.get('content-type') || ''
    let data
    if (contentType.includes('application/json')) {
      try {
        data = await response.json()
      } catch {
        data = await response.text()
      }
    } else {
      data = await response.text()
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data
    }
  }
}
