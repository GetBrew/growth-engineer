'use client'

import { useSyncExternalStore } from 'react'
import { MCP_URL } from '@/lib/constants/site'

export type Agent = {
  name: string
  headline?: string
  logo: string
  path: ReadonlyArray<string>
  steps: ReadonlyArray<string>
}

export const AGENTS = [
  {
    name: 'Claude',
    logo: '/marquee/claude.svg',
    path: ['Open Settings', 'Connectors'],
    steps: [
      'Open Claude and go to Settings, then Connectors.',
      'Choose Add custom connector.',
      'Paste the server URL and choose Connect.',
      'Sign in when Claude asks, and the tools appear in the composer.',
    ],
  },
  {
    name: 'Claude Code',
    logo: '/marquee/claude-code.svg',
    path: ['Run /mcp in the terminal'],
    steps: [
      'Run /mcp in the terminal where Claude Code is running.',
      'Choose Add server and pick HTTP as the transport.',
      'Paste the server URL when prompted.',
      'Run /mcp again to sign in and confirm the server is connected.',
    ],
  },
  {
    name: 'ChatGPT',
    logo: '/marquee/openai.svg',
    path: ['Open Settings', 'Connectors'],
    steps: [
      'Open ChatGPT and go to Settings, then Connectors.',
      'Choose Add custom connector.',
      'Paste the server URL and authorise access.',
      'Enable the connector in a new chat to use the tools.',
    ],
  },
  {
    name: 'Codex',
    logo: '/marquee/codex.svg',
    path: ['Open your config', 'MCP servers'],
    steps: [
      'Open your Codex config file.',
      'Add an entry under MCP servers.',
      'Set the transport to HTTP and the URL to the server below.',
      'Reload Codex so it picks the server up.',
    ],
  },
  {
    name: 'Cursor',
    logo: '/marquee/cursor.svg',
    path: ['Open Settings', 'MCP'],
    steps: [
      'Open Cursor and go to Settings, then MCP.',
      'Choose Add new MCP server.',
      'Paste the server URL and save.',
      'Enable the server; its tools show in the agent panel.',
    ],
  },
  {
    name: 'Perplexity',
    logo: '/marquee/perplexity.svg',
    path: ['Open Settings', 'Connectors'],
    steps: [
      'Open Perplexity and go to Settings, then Connectors.',
      'Add a custom connector.',
      'Paste the server URL and authorise access.',
    ],
  },
  {
    name: 'Grok',
    logo: '/marquee/grok-bot.svg',
    path: ['Open Settings', 'Connectors'],
    steps: [
      'Open Grok and go to Settings, then Connectors.',
      'Add a custom connector.',
      'Paste the server URL and authorise access.',
    ],
  },
  {
    name: 'DeepSeek',
    logo: '/marquee/deepseek.svg',
    path: ['Open your config', 'MCP servers'],
    steps: [
      "Open your client's config file.",
      'Add an entry under MCP servers.',
      'Set the transport to HTTP and the URL to the server below.',
      'Reload the client so it picks the server up.',
    ],
  },
  {
    name: 'Muse',
    logo: '/marquee/muse.svg',
    path: ['Open Settings', 'Connectors'],
    steps: [
      'Open Muse and go to Settings, then Connectors.',
      'Add a custom connector.',
      'Paste the server URL and authorise access.',
    ],
  },
  {
    name: 'MCP',
    headline: 'any MCP client',
    logo: '/marquee/mcp.svg',
    path: ['Open your config', 'Streamable HTTP'],
    steps: [
      "Open your client's MCP configuration.",
      'Add a streamable HTTP server.',
      'Set its URL to the server below.',
      'Reload the client so it picks the server up.',
    ],
  },
] as const satisfies ReadonlyArray<Agent>

let selected: Agent = AGENTS[0]
let stepsOpen = false
const listeners = new Set<() => void>()

function publish() {
  for (const listener of listeners) {
    listener()
  }
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  return () => listeners.delete(onStoreChange)
}

export function selectAgent(agent: Agent) {
  if (selected.name === agent.name) {
    return
  }

  selected = agent
  publish()
}

export function useSelectedAgent() {
  return useSyncExternalStore(
    subscribe,
    () => selected,
    () => AGENTS[0]
  )
}

export function showStepsFor(agent: Agent) {
  selected = agent
  stepsOpen = true
  publish()
}

export function closeSteps() {
  if (!stepsOpen) {
    return
  }

  stepsOpen = false
  publish()
}

export function openSteps() {
  if (stepsOpen) {
    return
  }

  stepsOpen = true
  publish()
}

export function useStepsOpen() {
  return useSyncExternalStore(
    subscribe,
    () => stepsOpen,
    () => false
  )
}

export function aiPrompt(agent: Agent): string {
  return [
    `Connect me to the growth.engineer MCP server in ${agent.name}.`,
    '',
    `Server URL: ${MCP_URL}`,
    'Transport: streamable HTTP',
    '',
    'Steps:',
    ...agent.steps.map((step, index) => `${index + 1}. ${step}`),
  ].join('\n')
}
