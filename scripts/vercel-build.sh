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
    pnpm run build
  fi

else
  pnpm run build
fi
