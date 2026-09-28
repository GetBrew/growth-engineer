import { loadPaletteItems, loadTagChips } from '@/lib/catalog/loaders'
import { CommandPaletteDialog } from './command-palette-dialog'

const SUGGESTIONS = 4

/**
 * ⌘K, mounted once in the site chrome (the root layout), with its index
 * prerendered alongside: no request when it opens, no loading state. The
 * "Try searching" chips are the catalog's most-used capabilities, so they
 * always find something.
 */
export function CommandPalette() {
  const [items, tags] = [loadPaletteItems(), loadTagChips()]
  const suggestions = tags
    .filter((tag) => tag.namespace === 'capability')
    .sort(
      (a, b) =>
        b.counts.tools +
          b.counts.workflows -
          (a.counts.tools + a.counts.workflows) ||
        a.label.localeCompare(b.label)
    )
    .slice(0, SUGGESTIONS)
    .map((tag) => tag.label.toLowerCase())
  return <CommandPaletteDialog items={items} suggestions={suggestions} />
}
