'use client'

import { useSyncExternalStore } from 'react'

/**
 * The agents the hero shows how to connect, and the steps for each. Only
 * clients that take a remote (Streamable HTTP) MCP server by URL are listed,
 * and the steps say what the server needs: nothing — it is public, read-only
 * and has no sign-in. `SERVER_URL` in a step is replaced with the real URL
 * where it is shown.
 */

export type Agent = {
  name: string
  headline?: string
  logo: string
  steps: ReadonlyArray<string>
}

const SERVER_URL = '<server URL>'

export const AGENTS = [
  {
    name: 'Claude',
    logo: '/marquee/claude.svg',
    steps: [
      'Open Claude and go to Settings, then Connectors.',
      'Choose Add custom connector and name it growth.engineer.',
      `Paste ${SERVER_URL} as the URL and choose Add. There is nothing to sign in to.`,
      'Turn the connector on in a chat; its search and get tools appear.',
    ],
  },
  {
    name: 'Claude Code',
    logo: '/marquee/claude-code.svg',
    steps: [
      `In your terminal, run: claude mcp add --transport http growth-engineer ${SERVER_URL}`,
      'Start Claude Code and run /mcp to see the server connected.',
    ],
  },
  {
    name: 'ChatGPT',
    logo: '/marquee/openai.svg',
    steps: [
      'Open ChatGPT and go to Settings, then Apps & Connectors.',
      'Under Advanced settings, turn on Developer mode, then choose Create.',
      `Name it growth.engineer, paste ${SERVER_URL} and pick No authentication.`,
      'Enable it in a new chat to use its tools.',
    ],
  },
  {
    name: 'Codex',
    logo: '/marquee/codex.svg',
    steps: [
      'Open ~/.codex/config.toml.',
      `Add a [mcp_servers.growth-engineer] table with url = "${SERVER_URL}".`,
      'Restart Codex and run /mcp to see the server.',
    ],
  },
  {
    name: 'Cursor',
    logo: '/marquee/cursor.svg',
    steps: [
      'Open Cursor Settings, then MCP, and choose Add new MCP server.',
      `In mcp.json, add "growth-engineer": { "url": "${SERVER_URL}" } under mcpServers.`,
      'Save; the tools show in the agent panel.',
    ],
  },
  {
    name: 'MCP',
    headline: 'any MCP client',
    logo: '/marquee/mcp.svg',
    steps: [
      "Open your client's MCP configuration.",
      `Add a Streamable HTTP server with the URL ${SERVER_URL}.`,
      'No authentication is needed. Reload the client so it picks the server up.',
    ],
  },
] as const satisfies ReadonlyArray<Agent>

/** A step with the real server URL in place of the placeholder. */
export function stepWithUrl(step: string, url: string): string {
  return step.replaceAll(SERVER_URL, url)
}

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

/** What the Prompt button copies: ask an agent to do the connecting. */
export function aiPrompt(agent: Agent, url: string): string {
  return [
    `Connect me to the growth.engineer MCP server in ${agent.name}.`,
    '',
    `Server URL: ${url}`,
    'Transport: Streamable HTTP. No authentication.',
    '',
    'Steps:',
    ...agent.steps.map(
      (step, index) => `${index + 1}. ${stepWithUrl(step, url)}`
    ),
  ].join('\n')
}
