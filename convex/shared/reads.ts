import type { Doc, Id, TableNames } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'

/**
 * Point-read a set of ids in one round of parallel `db.get`s — deduplicated,
 * first-seen order kept. A missing row is simply absent from the map; the
 * caller decides whether that is an error.
 */
export async function getMany<T extends TableNames>(
  ctx: QueryCtx,
  ids: ReadonlyArray<Id<T>>
): Promise<Map<Id<T>, Doc<T>>> {
  const unique = [...new Set(ids)]
  const loaded = await Promise.all(unique.map((id) => ctx.db.get(id)))
  const rows = new Map<Id<T>, Doc<T>>()
  for (const [index, id] of unique.entries()) {
    const row = loaded[index]
    if (row) {
      rows.set(id, row)
    }
  }
  return rows
}
