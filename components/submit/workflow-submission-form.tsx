'use client'

import { FileUploadIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import { type FormEvent, useId, useState } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup } from '@/components/ui/input-group'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils/cn'

const RECIPIENT = 'founders@brew.new'

export function WorkflowSubmissionForm() {
  const fileId = useId()
  const [file, setFile] = useState<File | null>(null)
  const [hasFileError, setHasFileError] = useState(false)

  function submitByEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) {
      setHasFileError(true)
      return
    }
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const note = String(data.get('note') ?? '').trim()
    const subject = encodeURIComponent(`Catalog submission from ${name}`)
    const body = encodeURIComponent(
      [
        'Hi Brew team,',
        '',
        "I'd like to submit a workflow or tool.",
        '',
        `Name: ${name}`,
        `Email: ${email}`,
        `File: ${file?.name ?? 'Not selected'}`,
        `Note: ${note || 'None'}`,
        '',
        'I will attach the selected file to this email before sending.',
      ].join('\n')
    )

    window.location.href = `mailto:${RECIPIENT}?subject=${subject}&body=${body}`
  }

  return (
    <form
      aria-label="Submit a workflow or tool"
      className="flex w-full max-w-95 flex-col gap-6"
      onSubmit={submitByEmail}
    >
      <header>
        <Image
          alt=""
          className="size-8 object-contain"
          height={32}
          priority
          src="/logo.png"
          width={32}
        />
        <h1 className="type-form-title mt-6">Submit a workflow or tool</h1>
        <p className="type-body mt-3 text-subtle">
          The catalog is open source: the fastest path is a pull request that
          adds the file —{' '}
          <a
            className="text-foreground underline-offset-4 hover:underline"
            href="https://github.com/GetBrew/growth-engineer/blob/main/CONTRIBUTING.md"
            rel="noreferrer"
            target="_blank"
          >
            how to contribute
          </a>
          . Or email it to us and we will open one for you.
        </p>
      </header>

      <FieldGroup className="gap-4">
        <Field className="gap-1.5">
          <FieldLabel className="text-subtle" htmlFor="submission-name">
            Name
          </FieldLabel>
          <Input
            autoComplete="name"
            id="submission-name"
            name="name"
            placeholder="Your name"
            required
            variant="muted"
          />
        </Field>

        <Field className="gap-1.5">
          <FieldLabel className="text-subtle" htmlFor="submission-email">
            Email
          </FieldLabel>
          <Input
            autoComplete="email"
            id="submission-email"
            name="email"
            placeholder="you@company.com"
            required
            type="email"
            variant="muted"
          />
        </Field>

        <Field className="gap-1.5" data-invalid={hasFileError}>
          <FieldLabel className="text-subtle" htmlFor={fileId}>
            Workflow or tool file
          </FieldLabel>
          <InputGroup
            className={cn(
              'gap-3 p-1 pl-4',
              hasFileError && 'border-destructive'
            )}
            variant="muted"
          >
            <input
              accept=".md,.txt,text/markdown,text/plain"
              aria-describedby={`${fileId}-status`}
              aria-invalid={hasFileError}
              className="sr-only"
              id={fileId}
              name="submission-file"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null)
                setHasFileError(false)
              }}
              type="file"
            />
            <FieldDescription
              aria-live="polite"
              className="min-w-0 flex-1 truncate"
              id={`${fileId}-status`}
            >
              {file?.name ?? 'Markdown or text file'}
            </FieldDescription>
            <label
              className={cn(
                buttonVariants({ variant: 'outline', size: 'pill-sm' })
              )}
              htmlFor={fileId}
            >
              <HugeiconsIcon
                aria-hidden="true"
                data-icon="inline-start"
                icon={FileUploadIcon}
                size={16}
                strokeWidth={1.8}
              />
              {file ? 'Change' : 'Choose'}
            </label>
          </InputGroup>
          <FieldError>
            {hasFileError ? 'Choose a file to continue' : null}
          </FieldError>
        </Field>

        <Field className="gap-1.5">
          <FieldLabel className="text-subtle" htmlFor="submission-note">
            Anything else?
          </FieldLabel>
          <Textarea
            id="submission-note"
            name="note"
            placeholder="Add context, links, or anything we should know"
            rows={3}
            variant="muted"
          />
        </Field>
      </FieldGroup>

      <Button size="pill" type="submit">
        Email to Brew founders
      </Button>
    </form>
  )
}
