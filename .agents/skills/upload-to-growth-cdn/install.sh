#!/usr/bin/env bash
# Install the growth.engineer upload-to-cdn skill for your agent, globally.
#
#   ./.agents/skills/upload-to-growth-cdn/install.sh
#
# Installs as "upload-to-growth-cdn", NOT "upload-to-cdn": ~/.claude/skills is a
# flat namespace and Brew ships a skill by that name pointing at a different
# blob store. Two entries with one name is a coin flip over which store your
# uploads land in.
#
# To use the skill only inside this repo, you need none of this -- the repo
# already carries .claude/skills/upload-to-growth-cdn.
set -euo pipefail

NAME="upload-to-growth-cdn"
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="$HOME/.claude/skills/$NAME"

if [ ! -f "$SRC/SKILL.md" ]; then
  echo "error: $SRC does not look like the skill (no SKILL.md)" >&2
  exit 1
fi

if [ -e "$HOME/.claude/skills/upload-to-cdn" ] && [ "$(readlink "$HOME/.claude/skills/upload-to-cdn" || true)" != "" ]; then
  echo "note: an 'upload-to-cdn' skill is already installed (Brew's, most likely)."
  echo "      Installing this one as '$NAME' so the two cannot be confused."
fi

if [ -e "$DEST" ] || [ -L "$DEST" ]; then
  current="$(readlink "$DEST" || echo "<a real directory>")"
  if [ "$current" = "$SRC" ]; then
    echo "already installed: $DEST -> $SRC"
    exit 0
  fi
  echo "error: $DEST already exists and points at $current" >&2
  echo "       Remove it first if you meant to replace it." >&2
  exit 1
fi

mkdir -p "$HOME/.claude/skills"
ln -s "$SRC" "$DEST"
echo "installed: $DEST -> $SRC"
echo
echo "Next: export the token for the growtheng-cdn store (never commit it)."
echo "No CLI command prints it -- copy it from the Vercel dashboard:"
echo "  brew team -> Storage -> growtheng-cdn -> tokens"
echo "  export GROWTH_ENGINEER_BLOB_READ_WRITE_TOKEN=..."
echo
echo "Verify without uploading anything:"
echo "  node $SRC/scripts/upload.mjs <some-file> --dry-run"
