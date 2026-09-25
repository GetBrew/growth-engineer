/**
 * One `<script type="application/ld+json">` per page section. The data is
 * built server-side from the catalog and serialized once; `<` is escaped so
 * a name containing markup can never close the script tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON.stringify output with `<` escaped; the only way to emit JSON-LD
      dangerouslySetInnerHTML={{ __html: json }}
      type="application/ld+json"
    />
  )
}
