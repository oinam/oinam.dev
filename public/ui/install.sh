#!/bin/sh
#
# Oinam UI: take the system into your own project.
#
#   curl -fsSL https://oinam.dev/ui/install.sh | sh
#   curl -fsSL https://oinam.dev/ui/install.sh | sh -s -- public/ui
#
# It copies every file of the system into a folder of yours: ./ui, unless you
# name another. From then on the files are yours. Nothing in them points back
# at oinam.dev, and a page that uses them makes no request to anyone else.
#
# It needs only a POSIX shell and curl. To read it before running it, leave
# off the "| sh".

set -eu

FROM="${OINAM_UI_URL:-https://oinam.dev/ui}"
TO="${1:-ui}"

say() {
  printf '%s\n' "$*"
}

# fetch <file> <destination>
fetch() {
  curl -fsSL "$FROM/$1" -o "$2" || {
    say "Could not download $FROM/$1" >&2
    exit 1
  }
}

# The registry names every file in the system. Each name is a quoted string
# that ends in a file extension, which is enough to pick them out without a
# JSON parser.
files() {
  grep -oE '"[A-Za-z0-9/_-]+\.(css|js|md|woff2|txt)"' "$1" | tr -d '"' | sort -u
}

mkdir -p "$TO"
fetch registry.json "$TO/registry.json"

count=0
for file in $(files "$TO/registry.json"); do
  mkdir -p "$(dirname "$TO/$file")"
  fetch "$file" "$TO/$file"
  count=$((count + 1))
done

say "Oinam UI: $count files are in $TO/"
say ""
say "Link them from your pages, with the path to $TO/ as your site serves it:"
say ""
say '  <link rel="stylesheet" href="/ui/ui.css" />'
say '  <script src="/ui/theme-init.js"></script>'
say '  <script type="module" src="/ui/ui.js"></script>'
say ""
say "Then read $TO/guide.md, or hand it to your agent."
