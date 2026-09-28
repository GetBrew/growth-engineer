import { AGENT_ACCESS, DEFINITIONS, SITE } from '@/lib/catalog/definitions'

/**
 * The preamble `/llms.txt` and `/llms-full.txt` share, in the llmstxt.org
 * shape: an H1, a blockquote summary, then free-form markdown with no
 * headings — the definitions and how to read a file —
 * before the H2 file sections start. PURE: strings from the definitions.
 */
export function llmsPreamble(origin: string, title: string): Array<string> {
  return [
    `# ${title}`,
    '',
    `> ${SITE.tagline}`,
    '',
    SITE.description,
    '',
    `Site: ${origin}`,
    `Source: ${SITE.repository} — add a company, tool or workflow by pull request.`,
    '',
    'How to use it:',
    '',
    '- Pick a workflow below whose title is the result you want, fetch its file, and follow it: it names the inputs and keys to ask the user for, sets up each tool, and lists the steps and the rules.',
    '- A tool file is one call, set up; use it to run a single step or to build your own workflow.',
    `- To contribute, read ${SITE.repository}/blob/main/CONTRIBUTING.md.`,
    '',
    'Definitions:',
    '',
    ...DEFINITIONS.map(
      (entry) =>
        `- **${entry.term}** (\`${entry.example}\`): ${entry.definition} ${entry.detail} Source file: \`${entry.path}\`.`
    ),
    '',
    'Reading a file:',
    '',
    ...AGENT_ACCESS.map((line) => `- ${line}`),
    '- Each file has a flat YAML header (ref, name, updated, …), then setup, steps and rules; the header names its relations by key.',
    '',
  ]
}
