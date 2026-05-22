import { ExecutionEngine } from './src/main/executionEngine.js'

const workflow = {
  nodes: [
    { id: 'n1', type: 'customNode', data: { type: 'triggerManual', config: {} } },
    { id: 'n2', type: 'customNode', data: { type: 'codeJs', config: { code: 'return { messages: ["hello", "world"] };' } } },
    { id: 'n3', type: 'customNode', data: { type: 'discordWebhook', config: { webhookUrl: 'mock', content: 'fallback', username: 'bot' } } }
  ],
  edges: [
    { source: 'n1', target: 'n2', sourceHandle: 'a', targetHandle: 'a' },
    { source: 'n2', target: 'n3', sourceHandle: 'messages', targetHandle: 'content' }
  ]
}

const engine = new ExecutionEngine(workflow.nodes, workflow.edges, (nodeId, status, data) => {
  console.log(`[${status}] ${nodeId}:`, data)
})

engine.execute().then(res => console.log('Final Result:', res))
