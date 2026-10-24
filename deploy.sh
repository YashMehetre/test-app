#!/usr/bin/env bash
# Runs ON THE SERVER (the GitHub workflow calls it over SSH).
# -e: stop at the first failing command, so a failed pull never leads to a restart of old code.
# -u: an unset variable is an error, not an empty string.
# pipefail: a failure anywhere in a pipeline counts, not just the last command.
set -euo pipefail

cd ~/test-app

# --ff-only refuses to create a merge commit; if the server's copy has diverged we
# want a loud failure rather than a silent merge on a production machine.
git pull --ff-only

# npm ci installs exactly what package-lock.json says (reproducible), and
# --omit=dev skips packages the running app does not need.
npm ci --omit=dev

# The app runs as a systemd service; restarting is what makes it load the new code.
sudo systemctl restart testapp

# Printing the commit makes it obvious in the Actions log which version is now live.
echo "Deployed $(git rev-parse --short HEAD)"
