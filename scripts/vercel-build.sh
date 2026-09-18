#!/usr/bin/env bash
#
# Vercel build entrypoint.
#
# The whole job of this script is to get the CONVEX DEPLOY right for each
# environment, because the three cases are genuinely different and the failure
# modes are expensive.
set -euo pipefail

# `convex deploy` has two shapes of key and they are trivially confused in the
# dashboard:
#
#   preview:<team>:<project>|<secret>   → creates a per-branch preview deployment
#   dev:<name>|<secret> / prod:<name>|<secret>
#                                       → targets THAT ONE existing deployment
#
# Paste a DEPLOYMENT key into the preview environment and `convex deploy` does
# not create a preview at all: it pushes this branch's functions and schema
# straight onto that deployment. Every PR build then clobbers the backend every
# other preview is using. This test mirrors `isPreviewDeployKey` in the Convex
# CLI: the prefix before the pipe must be exactly three colon-separated parts
# starting with `preview`.
is_convex_preview_deploy_key() {
  local key="${1:-}"
  case "$key" in
    *'|'*) : ;;
    *) return 1 ;;
  esac
  local prefix="${key%%|*}"
  case "$prefix" in
    preview:*:*:*) return 1 ;;  # too many parts
    preview:*:*) return 0 ;;
    *) return 1 ;;
  esac
}

# `next build` reads NEXT_PUBLIC_CONVEX_URL at module scope (lib/env.ts), so a
# missing one does not fail here — it fails three minutes later, inside page
# collection, as a Zod trace pointing at `/_not-found`. That error names the
# variable but not the reason, and the reason is always one of the two below.
#
# On the deploy paths `convex deploy` WRITES this variable, so it is only ever
# missing when no deploy ran. Say that, here, before the build starts.
require_convex_url() {
  if [ -n "${NEXT_PUBLIC_CONVEX_URL:-}" ]; then
    return 0
  fi
  echo "############################################################" >&2
  echo "NEXT_PUBLIC_CONVEX_URL is empty, and no convex deploy ran to" >&2
  echo "set it. The build cannot start. Fix ONE of these:"            >&2
  echo                                                                >&2
  echo "  1. Set CONVEX_DEPLOY_KEY for this environment to a PREVIEW" >&2
  echo "     key (preview:<team>:<project>|<secret>). Convex then"    >&2
  echo "     creates a per-branch backend and sets the URL itself."   >&2
  echo "  2. Or set NEXT_PUBLIC_CONVEX_URL to an existing deployment" >&2
  echo "     URL (https://<name>.convex.cloud)."                      >&2
  echo                                                                >&2
  echo "A BLANK value counts as missing — check for a variable that"  >&2
  echo "exists in the dashboard with nothing in it."                  >&2
  echo "############################################################" >&2
  exit 1
}

if [ "${VERCEL_ENV:-}" = "production" ]; then
  # Functions are pushed only AFTER the build succeeds — deliberate: a failing
  # build must never push backend changes.
  #
  # The consequence to remember: a statically prerendered page must not
  # hard-depend on a Convex function signature introduced in the SAME commit.
  # At build time it is still talking to the previous deployment.
  npx convex deploy --cmd 'pnpm run build'

elif [ "${VERCEL_ENV:-}" = "preview" ] && [ -n "${CONVEX_DEPLOY_KEY:-}" ]; then
  if is_convex_preview_deploy_key "${CONVEX_DEPLOY_KEY:-}"; then
    # TWO passes, deliberately. `convex deploy --cmd` runs the build BEFORE it
    # pushes functions — right for a long-lived deployment, fatal for a brand
    # new preview: the build would prerender against a deployment with NO
    # functions on it and fail with "Could not find public function for …".
    #
    # Pass 1 has no `--cmd`, so it is a push-only deploy. Pass 2 then builds
    # against a populated deployment; its own push is a near no-op.
    npx convex deploy
    npx convex deploy --cmd 'pnpm run build'
  else
    # Fall back rather than fail — a mis-set key must not wall every PR — but
    # say so loudly, because the quiet version of this is "previews are
    # silently sharing one backend", which is the exact thing it prevents.
    echo "############################################################" >&2
    echo "WARNING: CONVEX_DEPLOY_KEY is NOT a preview deploy key."      >&2
    echo "  Expected: preview:<team>:<project>|<secret>"                >&2
    echo "  A dev:/prod: key would push this branch onto that SHARED"   >&2
    echo "  deployment instead of creating a per-PR preview."           >&2
    echo "  Generate one at Convex → Project Settings → Deploy Keys."   >&2
    echo "  Skipping convex deploy; building against the existing"      >&2
    echo "  NEXT_PUBLIC_CONVEX_URL instead."                            >&2
    echo "############################################################" >&2
    require_convex_url
    pnpm run build
  fi

else
  require_convex_url
  pnpm run build
fi
