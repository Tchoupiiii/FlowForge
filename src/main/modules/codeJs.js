/**
 * Code (JavaScript) Module
 * Executes arbitrary JavaScript code with inputData available as a parameter.
 */
export default {
  meta: {
    type: 'codeJs',
    name: 'JavaScript Code',
    description: 'Execute custom JavaScript code with access to input data',
    category: 'transform',
    inputs: 1,
    outputs: 1
  },

  async execute(config, inputData) {
    const code = config.code
    if (!code) {
      throw new Error('JavaScript Code: code is required')
    }

    const timeout = config.timeout || 10000

    try {
      // Create a function with inputData as the argument
      // The user code should return a value
      const fn = new Function(
        'input',
        'console',
        `
        "use strict";
        ${code}
        `
      )

      // Create a sandboxed console that captures logs
      const logs = []
      const sandboxConsole = {
        log: (...args) => logs.push({ level: 'log', message: args.map(formatArg).join(' ') }),
        warn: (...args) => logs.push({ level: 'warn', message: args.map(formatArg).join(' ') }),
        error: (...args) => logs.push({ level: 'error', message: args.map(formatArg).join(' ') }),
        info: (...args) => logs.push({ level: 'info', message: args.map(formatArg).join(' ') })
      }

      // Execute with timeout
      const result = await Promise.race([
        Promise.resolve(fn(structuredClone(inputData), sandboxConsole)),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Code execution timed out after ${timeout}ms`)), timeout)
        )
      ])

      return {
        result: result !== undefined ? result : null,
        logs,
        executionTime: Date.now()
      }
    } catch (err) {
      throw new Error(`JavaScript Code execution error: ${err.message}`)
    }
  }
}

function formatArg(arg) {
  if (arg === null) return 'null'
  if (arg === undefined) return 'undefined'
  if (typeof arg === 'object') {
    try {
      return JSON.stringify(arg)
    } catch {
      return String(arg)
    }
  }
  return String(arg)
}
