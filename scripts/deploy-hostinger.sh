#!/usr/bin/env bash
set -euo pipefail

fail() { printf '%s\n' "$*" >&2; exit 1; }
site=https://italyshortfilmdays2027.rawdrivers.org
marker_name=isfd-deploy-target.txt
marker=${HOSTINGER_FESTIVAL_MARKER:-}
root=${HOSTINGER_FESTIVAL_ROOT:-}
placeholder_hash=${HOSTINGER_DEFAULT_PHP_SHA256:-}

for name in HOSTINGER_SSH_HOST HOSTINGER_SSH_PORT HOSTINGER_SSH_USER HOSTINGER_SSH_PRIVATE_KEY HOSTINGER_SSH_KNOWN_HOSTS; do
  [[ -n ${!name:-} ]] || fail "Missing environment secret: $name"
done
[[ $HOSTINGER_SSH_HOST =~ ^[A-Za-z0-9][A-Za-z0-9.-]*$ ]] || fail 'Invalid SSH hostname.'
[[ $HOSTINGER_SSH_PORT =~ ^[0-9]{1,5}$ ]] && (( 10#$HOSTINGER_SSH_PORT >= 1 && 10#$HOSTINGER_SSH_PORT <= 65535 )) || fail 'Invalid SSH port.'
[[ $HOSTINGER_SSH_USER =~ ^[A-Za-z0-9_][A-Za-z0-9_.-]*$ ]] || fail 'Invalid SSH username.'
[[ $root =~ ^(/[A-Za-z0-9_.-]+)+$ && $root != */../* && $root != */./* && $root != */.. && $root != */. ]] || fail 'Use the canonical, absolute SSH document root.'
[[ $marker =~ ^isfd-2027-[a-f0-9]{32}$ ]] || fail 'Set the festival marker to isfd-2027- plus 32 lowercase hex characters.'
[[ -z $placeholder_hash || $placeholder_hash =~ ^[a-f0-9]{64}$ ]] || fail 'Invalid default.php SHA-256.'
[[ -s dist/index.html && -s dist/sitemap.xml && -d dist/assets && -d dist/images ]] || fail 'Incomplete Vite build.'
[[ -z $(find dist ! -type d ! -type f -print -quit) ]] || fail 'Unexpected file type in dist.'
for locale in it de en; do
  [[ -s dist/$locale/index.html ]] || fail "Missing homepage for $locale"
done
route_file='^dist/(it|de|en)/(index\.html|(films|programme|academy|media|venues|tickets|festival|archive)/index\.html|(films|programme|media|venues)/[a-z0-9]+(-[a-z0-9]+)*/index\.html)$'
while IFS= read -r -d '' path; do
  [[ $path == dist/index.html || $path == dist/sitemap.xml ||
     $path =~ ^dist/(assets|images)/[A-Za-z0-9_-]+\.(css|js|woff|woff2|webp)$ ||
     $path =~ $route_file ]] || fail "Unexpected dist file: $path"
done < <(find dist -type f -print0)

curl_site() { curl --fail --silent --show-error --max-time 20 --proto '=https' "$1"; }
tmp=$(mktemp -d)
trap 'rm -rf -- "$tmp"' EXIT
[[ $(curl_site "$site/$marker_name?verify=${GITHUB_RUN_ID:-local}") == "$marker" ]] ||
  fail 'The production hostname did not serve the expected festival marker.'
if [[ $(curl_site "https://rawdrivers.org/$marker_name" 2>/dev/null) == "$marker" ]]; then
  fail 'The parent website serves the same marker. Deployment stopped.'
fi

umask 077
printf '%s\n' "$HOSTINGER_SSH_PRIVATE_KEY" > "$tmp/key"
printf '%s\n' "$HOSTINGER_SSH_KNOWN_HOSTS" > "$tmp/known_hosts"
remote_script=$(sed "s/'/'\\\\''/g" scripts/publish-hostinger.sh)
tar -C dist -czf - index.html assets images it de en sitemap.xml |
  ssh -T -p "$HOSTINGER_SSH_PORT" -i "$tmp/key" \
    -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes \
    -o "UserKnownHostsFile=$tmp/known_hosts" -o GlobalKnownHostsFile=/dev/null \
    -o ConnectTimeout=20 -- "$HOSTINGER_SSH_USER@$HOSTINGER_SSH_HOST" \
    "bash -c '$remote_script' -- '$root' '$marker' '$placeholder_hash'"

# Compare each public file with the build, including the response at the site root.
while IFS= read -r -d '' path; do
  url_path=${path#dist/}
  url_path=${url_path%index.html}
  curl_site "$site/$url_path?verify=${GITHUB_RUN_ID:-local}" > "$tmp/served"
  cmp -s "$path" "$tmp/served" || fail "Published response differs from the build: /$url_path"
done < <(find dist -type f -print0)
