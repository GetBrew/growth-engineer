import { loadPaletteItems } from '@/lib/catalog/loaders'
import { CommandPaletteDialog } from './command-palette-dialog'

/**
 * ⌘K, mounted once in the site chrome (the root layout), with its index
 * prerendered alongside: no request when it opens, no loading state.
 */
export async function CommandPalette() {
  return <CommandPaletteDialog items={await loadPaletteItems()} />
}
