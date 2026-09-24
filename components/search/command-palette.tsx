import { loadPaletteItems } from '@/lib/catalog/loaders'
import { CommandPaletteDialog } from './command-palette-dialog'

export async function CommandPalette() {
  const items = await loadPaletteItems()

  return <CommandPaletteDialog items={items} />
}
