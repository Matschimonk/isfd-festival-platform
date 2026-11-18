#!/usr/bin/env bash
set -euo pipefail

fail() { printf '%s\n' "$*" >&2; exit 1; }
root=$1
marker=$2
placeholder_hash=$3

cd -- "$root"
[[ $(pwd -P) == "$root" ]] || fail 'Destination is not the canonical document root.'
[[ $root != */rawdrivers.org/public_html ]] || fail 'Destination is the parent website.'
[[ -f isfd-deploy-target.txt && ! -L isfd-deploy-target.txt ]] ||
  fail 'Festival marker missing or invalid in the SSH destination.'
[[ $(cat isfd-deploy-target.txt) == "$marker" ]] || fail 'SSH destination marker mismatch.'

private_home=$(cd -- "$HOME" && pwd -P)
[[ $private_home != "$root" && $private_home != "$root/"* ]] ||
  fail 'SSH home must be outside the web root.'
stage=$(mktemp -d "$private_home/.isfd-stage.XXXXXXXX")
pending=
trap 'if [[ -n $pending ]]; then rm -f -- "$pending"; fi; rm -rf -- "$stage"' EXIT
tar -xzf - -C "$stage"

for dir in assets images it de en; do
  [[ -d $stage/$dir && ! -L $stage/$dir ]] || fail "Invalid staged directory: $dir"
done

shopt -s nullglob
files=("$stage"/assets/* "$stage"/images/*)
while IFS= read -r -d '' file; do
  files+=("$file")
done < <(find "$stage/it" "$stage/de" "$stage/en" -type f -print0)
files+=("$stage/sitemap.xml" "$stage/index.html")

# Check every destination and its parent directories before writing any file.
for file in "${files[@]}"; do
  dest=${file#"$stage/"}
  [[ -f $file && ! -L $file && ! -L $dest && ( ! -e $dest || -f $dest ) ]] ||
    fail "Invalid publish file: $dest"
  dir=$dest
  while [[ $dir == */* ]]; do
    dir=${dir%/*}
    [[ ! -L $stage/$dir && ! -L $dir && ( ! -e $dir || -d $dir ) ]] ||
      fail "Invalid publish directory: $dir"
  done
done

backup=
if [[ -e default.php || -L default.php ]]; then
  [[ -f default.php && ! -L default.php && -n $placeholder_hash ]] ||
    fail 'default.php exists. Verify the placeholder and configure its SHA-256 first.'
  [[ $(sha256sum default.php | cut -d ' ' -f 1) == "$placeholder_hash" ]] ||
    fail 'default.php differs from the verified placeholder.'
  backup=$(mktemp -d "$private_home/.isfd-default-backup.XXXXXXXX")
  cp -p -- default.php "$backup/default.php"
  chmod 600 "$backup/default.php"
fi

for file in "${files[@]}"; do
  dest=${file#"$stage/"}
  dir=.
  if [[ $dest == */* ]]; then
    dir=${dest%/*}
    (umask 022; mkdir -p -- "$dir")
  fi
  pending=$(mktemp "$dir/.isfd-publish.XXXXXXXX")
  install -m 0644 -- "$file" "$pending"
  mv -fT -- "$pending" "$dest"
  pending=
done

if [[ -n $backup ]]; then
  [[ -f default.php && ! -L default.php ]] &&
    [[ $(sha256sum default.php | cut -d ' ' -f 1) == "$placeholder_hash" ]] ||
    fail 'default.php changed during publishing. The original backup was retained.'
  rm -- default.php
  printf 'Verified placeholder retired. Backup directory: %s\n' "${backup##*/}"
fi
