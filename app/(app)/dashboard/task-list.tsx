'use client'

import { useMutation } from 'convex/react'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { api } from '@/convex/_generated/api'
import type { Doc } from '@/convex/_generated/dataModel'
import { useAuthedQuery } from '@/hooks/use-authed-query'
import { getAppErrorMessage } from '@/lib/errors/app-error'

/**
 * The live half of the dashboard.
 *
 * `initialTasks` is what the server already rendered, so the list paints
 * immediately; `useAuthedQuery` then takes over with a live subscription. The
 * `?? initialTasks` is the handoff — `undefined` means the subscription has
 * not resolved yet, not "no tasks".
 *
 * `useAuthedQuery`, not `useQuery`: the Clerk JWT attaches to the socket after
 * mount, and a guarded query fired in that window throws.
 */
export function TaskList({
  initialTasks,
}: {
  initialTasks: Array<Doc<'tasks'>>
}) {
  const tasks = useAuthedQuery(api.tasks.list, {}) ?? initialTasks
  const createTask = useMutation(api.tasks.create)
  const setCompleted = useMutation(api.tasks.setCompleted)
  const removeTask = useMutation(api.tasks.remove)
  const [title, setTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      return
    }
    setError(null)
    // Clear optimistically: the mutation is a round-trip, and an input that
    // stays full for 200ms invites a double submit.
    setTitle('')
    try {
      await createTask({ title: trimmed })
    } catch (caught) {
      // A typed ConvexError message is written for this user and safe to show.
      // Anything unexpected keeps the generic fallback.
      setError(getAppErrorMessage(caught, 'Could not add that task.'))
      setTitle(trimmed)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <input
          aria-label="New task"
          className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a task"
          value={title}
        />
        <Button type="submit">Add</Button>
      </form>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      {tasks.length === 0 ? (
        <p className="rounded-md border border-dashed px-4 py-8 text-center text-muted-foreground text-sm">
          Nothing here yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <li
              className="flex items-center gap-3 rounded-md border px-3 py-2"
              key={task._id}
            >
              <input
                aria-label={`Mark "${task.title}" complete`}
                checked={task.isCompleted}
                className="size-4"
                onChange={(event) =>
                  setCompleted({
                    taskId: task._id,
                    isCompleted: event.target.checked,
                  })
                }
                type="checkbox"
              />
              <span
                className={
                  task.isCompleted
                    ? 'flex-1 text-muted-foreground line-through'
                    : 'flex-1'
                }
              >
                {task.title}
              </span>
              <Button
                aria-label={`Delete "${task.title}"`}
                onClick={() => removeTask({ taskId: task._id })}
                size="icon"
                variant="ghost"
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
