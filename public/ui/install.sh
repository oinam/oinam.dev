#!/bin/sh
#
# Oinam UI: take the system into your own project, or bring your copy up to date.
#
#   curl -fsSL https://oinam.dev/ui/install.sh | sh
#   curl -fsSL https://oinam.dev/ui/install.sh | sh -s -- public/ui
#
# It copies every file of the system into a folder of yours: ./ui, unless you
# name another. From then on the files are yours. Nothing in them points back
# at oinam.dev, and a page that uses them makes no request to anyone else.
#
# Run it again in the same place to upgrade. It never overwrites a file you
# have changed: it leaves yours alone, puts the new one beside it as
# <name>.new, and says so. It tells one from the other by the checksums it
# wrote down in <folder>/.installed the last time it ran.
#
# It needs only a POSIX shell and curl. To read it before running it, leave
# off the "| sh".

set -eu

FROM="${OINAM_UI_URL:-https://oinam.dev/ui}"
TO="${1:-ui}"
LOCK="$TO/.installed"

say() {
  printf '%s\n' "$*"
}

# fetch <file> <destination>
fetch() {
  curl -fsSL "$FROM/$1" -o "$2" || {
    say "Could not download $FROM/$1" >&2
    say "Nothing in $TO/ was changed." >&2
    exit 1
  }
}

# The registry names every file in the system. Each name is a quoted string
# that ends in a file extension, which is enough to pick them out without a
# JSON parser.
files() {
  grep -oE '"[A-Za-z0-9/_-]+\.(css|js|md|woff2|txt)"' "$1" | tr -d '"' | sort -u
}

# version <registry>
version() {
  sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' "$1" | head -n 1
}

# sum <file>: a checksum that changes when the file does.
sum() {
  cksum <"$1" | tr -s ' \t' ' '
}

# recorded <file>: the checksum written down for it at the last install.
recorded() {
  [ -f "$LOCK" ] || return 0
  sed -n "s|^\(.*\) $1\$|\1|p" "$LOCK" | head -n 1
}

# Download everything first, into a folder of its own. If any file fails, the
# project has not been touched.
NEW="$(mktemp -d)"
trap 'rm -rf "$NEW"' EXIT

fetch registry.json "$NEW/registry.json"
for file in $(files "$NEW/registry.json"); do
  mkdir -p "$(dirname "$NEW/$file")"
  fetch "$file" "$NEW/$file"
done

before=""
[ -f "$TO/registry.json" ] && before="$(version "$TO/registry.json")"
after="$(version "$NEW/registry.json")"

added=0
updated=0
kept=""

mkdir -p "$TO"
: >"$NEW/.installed"

for file in registry.json $(files "$NEW/registry.json"); do
  new="$NEW/$file"
  mine="$TO/$file"
  mkdir -p "$(dirname "$mine")"

  if [ ! -f "$mine" ]; then
    cp "$new" "$mine"
    added=$((added + 1))
  elif cmp -s "$new" "$mine"; then
    rm -f "$mine.new"
  elif [ "$(recorded "$file")" = "$(sum "$mine")" ]; then
    # Unchanged since it was installed, so it is ours to replace.
    cp "$new" "$mine"
    rm -f "$mine.new"
    updated=$((updated + 1))
  elif [ "$(recorded "$file")" = "$(sum "$new")" ]; then
    # Changed here, and not by the system since the last install. Theirs
    # stands and there is nothing new to merge, unless a merge is still owed.
    [ -f "$mine.new" ] && kept="$kept $file"
  else
    # Changed here, or put here by other means. It is theirs; leave it be.
    cp "$new" "$mine.new"
    kept="$kept $file"
  fi

  say "$(sum "$new") $file" >>"$NEW/.installed"
done

# Files the last install put here that the system no longer has.
gone=""
if [ -f "$LOCK" ]; then
  while read -r _ _ file; do
    if [ -f "$TO/$file" ] && ! grep -q " $file\$" "$NEW/.installed"; then
      gone="$gone $file"
    fi
  done <"$LOCK"
fi

cp "$NEW/.installed" "$LOCK"

# Say what happened, and what to do about it.

if [ -z "$before" ]; then
  say "Oinam UI $after is in $TO/ ($added files)."
  say ""
  say "Link it from your pages, with the path to $TO/ as your site serves it:"
  say ""
  say '  <link rel="stylesheet" href="/ui/ui.css" />'
  say '  <script src="/ui/theme-init.js"></script>'
  say '  <script type="module" src="/ui/ui.js"></script>'
  say ""
  say "Then read $TO/guide.md, or hand it to your agent."
elif [ "$added" -eq 0 ] && [ "$updated" -eq 0 ] && [ -z "$kept" ]; then
  say "Oinam UI $after in $TO/ is already up to date."
elif [ "$before" = "$after" ]; then
  say "Oinam UI $after in $TO/: $updated files updated, $added added."
else
  say "Oinam UI in $TO/ went from $before to $after: $updated files updated, $added added."
fi

if [ -n "$kept" ]; then
  say ""
  say "Kept as they are, because they differ from what was installed:"
  for file in $kept; do
    say "  $TO/$file    (the new one is $TO/$file.new)"
  done
  say "For each: compare the two, carry your change into the new file, put it in"
  say "place of the old one, and delete the .new file."
fi

if [ -n "$gone" ]; then
  say ""
  say "No longer part of the system. Delete them once nothing links to them:"
  for file in $gone; do
    say "  $TO/$file"
  done
fi

if [ -n "$before" ] && [ "$before" != "$after" ]; then
  say ""
  say "Next: read $TO/CHANGELOG.md, every entry above $before, oldest first, and do"
  say "what each one says under \"What to do\". $TO/guide.md has the steps, under"
  say "\"Upgrade\"."
fi
