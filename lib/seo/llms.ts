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
