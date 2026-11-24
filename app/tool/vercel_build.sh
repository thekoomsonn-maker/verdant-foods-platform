#!/usr/bin/env bash
# Builds the web preview on Vercel. Flutter is not preinstalled there, so fetch the pinned version.
set -euo pipefail
FLUTTER_VERSION="3.50.1"
if [ ! -x "$HOME/flutter/bin/flutter" ]; then
  git clone --depth 1 -b "$FLUTTER_VERSION" https://github.com/flutter/flutter.git "$HOME/flutter"
fi
export PATH="$HOME/flutter/bin:$PATH"
flutter config --no-analytics >/dev/null
flutter --version
flutter pub get
flutter build web --release --no-web-resources-cdn --pwa-strategy=none
