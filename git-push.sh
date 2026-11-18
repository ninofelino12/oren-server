#!/usr/bin/env bash
set -e

# Script to stage, commit, and push changes to GitHub

echo "==> Checking git status..."
git status

# Check if there are any changes
if [[ -z "$(git status --porcelain)" ]]; then
  echo "No changes to commit. Working tree is clean."
  exit 0
fi

# Get commit message from argument or prompt user
COMMIT_MSG="$1"
if [ -z "$COMMIT_MSG" ]; then
  read -p "Enter commit message: " COMMIT_MSG
fi

if [ -z "$COMMIT_MSG" ]; then
  echo "Commit message cannot be empty. Aborted."
  exit 1
fi

echo "==> Staging changes..."
git add -A

echo "==> Committing changes with message: '$COMMIT_MSG'..."
git commit -m "$COMMIT_MSG"

echo "==> Pushing to GitHub..."
git push origin main

echo "==> Successfully pushed to GitHub!"
