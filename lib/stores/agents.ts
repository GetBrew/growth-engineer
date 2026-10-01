'use client'

import { useSyncExternalStore } from 'react'

/**
 * The agents the hero shows how to connect, and the steps for each. Only
 * clients that take a remote (Streamable HTTP) MCP server by URL are listed,
 * and the steps say what the server needs: nothing — it is public, read-only
 * and has no sign-in. `SERVER_URL` in a step is replaced with the real URL
 * where it is shown, and `backticks` mark what to type or paste, set as code.
 */

export type Agent = {
  name: string
  headline?: string
  logo: string
  steps: ReadonlyArray<string>
  /** The client's own setup guide: the fallback when its screens change
      before these steps do, and the source to check them against. */
  guide: string
}

const SERVER_URL = '<server URL>'

export const AGENTS = [
  {
    name: 'Claude',
    logo: '/marquee/claude.svg',
    guide:
      'https://support.claude.com/en/articles/11175166-getting-started-with-custom-connectors-using-remote-mcp',
    steps: [
      'Open Claude and go to Settings, then Connectors.',
      'Click Add, then choose Add custom connector.',
      `Name it growth.engineer, paste \`${SERVER_URL}\` and click Add. There is nothing to sign in to.`,
      'In a chat, open the + menu, then Connectors, and turn growth.engineer on.',
    ],
  },
  {
    name: 'Claude Code',
    logo: '/marquee/claude-code.svg',
    guide: 'https://code.claude.com/docs/en/mcp',
    steps: [
      'Open your terminal.',
      // User scope: every project, not only the folder it was run in.
      `Run: \`claude mcp add --transport http growth-engineer --scope user ${SERVER_URL}\``,
      'Run `claude mcp list` to check it was added.',
      'Start Claude Code and run `/mcp` to see it connected.',
      'Ask Claude to use the growth-engineer tools.',
    ],
  },
  {
    name: 'ChatGPT',
    logo: '/marquee/openai.svg',
    guide: 'https://developers.openai.com/plugins/deploy/connect-chatgpt',
    steps: [
      'Open ChatGPT and click Plugins in the sidebar.',
      'Click Add, then choose Create MCP App.',
      `Name it growth.engineer, paste \`${SERVER_URL}\` and pick No authentication.`,
      'Accept the warning and click Create.',
      'Select growth.engineer in a new chat to use its tools.',
    ],
  },
  {
    name: 'Codex',
    logo: '/marquee/codex.svg',
    guide: 'https://learn.chatgpt.com/docs/extend/mcp?surface=cli',
    steps: [
      'Open your terminal.',
      `Run: \`codex mcp add growth-engineer --url ${SERVER_URL}\``,
      'Run `codex mcp list` to check it was added.',
      'Open or restart Codex.',
      'Ask Codex to use the growth-engineer tools.',
    ],
  },
  {
    name: 'Cursor',
    logo: '/marquee/cursor.svg',
    guide: 'https://cursor.com/docs/mcp',
    steps: [
      'Open `~/.cursor/mcp.json`, or create it if it is missing.',
      `Under \`"mcpServers"\`, add \`"growth-engineer": { "url": "${SERVER_URL}" }\`.`,
      'Save, then open Customize in the sidebar and check growth-engineer is on.',
      'Ask the agent to use the growth-engineer tools.',
    ],
  },
  {
    name: 'MCP',
    headline: 'any MCP client',
    logo: '/marquee/mcp.svg',
    guide:
      'https://modelcontextprotocol.io/docs/2026-07-28/develop/connect-remote-servers',
    steps: [
      "Open your client's MCP configuration.",
      `Add a Streamable HTTP server with the URL \`${SERVER_URL}\`.`,
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

function selectAgent(agent: Agent) {
  if (selected.name === agent.name) {
    return
  }

  selected = agent
  publish()
}

/** The next (1) or previous (-1) agent, round the list. */
export function stepAgent(by: number) {
  const at = AGENTS.findIndex((one) => one.name === selected.name)
  const next = AGENTS[(at + by + AGENTS.length) % AGENTS.length]
  if (next) {
    selectAgent(next)
  }
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
