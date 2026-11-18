# Festival production release plan

Scope is `italyshortfilmdays2027.rawdrivers.org`, PR #3, and the site build at `0cfb4df`. This plan authorizes no production changes.

## 1. Document-root verification

| Check | Result |
| --- | --- |
| Festival HTTP response | Homepage and existing marker returned HTTP 200. The marker matched the expected festival format. |
| Parent HTTP response | The marker path on `rawdrivers.org` returned 404. The `www` marker path redirected to that bare-host URL. |
| Prior build | All 19 files from the rebuilt `adb4adc` baseline matched the bytes served by the festival hostname. This includes both bundles referenced by the homepage and the six demo images. [Last successful production run](https://github.com/Matschimonk/isfd-festival-platform/actions/runs/44262149290) |
| Physical paths, symlinks and aliases | **Unverified.** The workspace has no usable Hostinger session, SSH identity or document-root value. GitHub’s environment-secret listing is unavailable to this integration. HTTP responses cannot establish filesystem isolation. |

### Required operator checks in Hostinger

1. In hPanel, open the festival website’s hosting entry. Record its assigned document root and all hostnames, redirects, parked domains and aliases that can serve that directory. Repeat for `rawdrivers.org`, `www.rawdrivers.org`, and other sites on the plan. The README describes how to locate the folder and compare it to the GitHub environment configuration. [Deployment setup](../README.md#verify-the-destination-and-ssh-access-in-hpanel)
2. In an authenticated, host-key-verified SSH session, compare `realpath -e` and `stat -Lc '%d:%i %n'` for both assigned document roots. Use `namei -l` where available to inspect each path component. Stop if the roots coincide, one contains the other, or aliases or mounts expose the same tree. Review mount information where available and confirm the exact festival path matches the configured deployment target. Record the results privately.
3. Inventory the festival root and each in-scope subtree with `find -P`. Inspect symlinks without traversing them. Check mounts and files with multiple hard links in the managed paths, and confirm existing targets are regular files or directories as expected. Stop on an unexplained link, mount, or ownership conflict. Confirm the existing on-disk marker matches the festival’s public response. Keep the marker and `github-source/` in place.
4. Identify the directory-index settings and any festival-specific redirects, access rules, PHP settings, and inherited server configuration. Record the hPanel settings privately and verify checkout access restrictions. Keep any inherited parent configuration outside the festival backup and rollback scope. Confirm the private backup directory is outside every served root and alias.

## 2. Backup and dry-run rehearsal

These steps are for a separately approved backup window. They were rehearsed only on a local fixture.

1. Keep the release paused. Confirm the root checks above, obtain a quiet snapshot window, and record the prior release and candidate revisions. Identify the actual festival-owned paths to archive. At minimum include the existing managed build paths and any applicable configuration. Preserve the marker in the archive for evidence. Exclude `github-source/`, unrelated folders and every other virtual host. Review any extra festival-specific configuration before adding it.
2. Create a fresh timestamped snapshot directory under a verified private backup parent with enough free space. Use a random suffix and restricted permissions. This leaves every existing production backup intact.
3. Use GNU tar with PAX format to retain relative paths, permissions, timestamps and ownership information. Include ACLs and extended attributes where the hosting environment supports them. If the required metadata cannot be captured, obtain a suitable Hostinger snapshot before release. Below, `FESTIVAL_ROOT`, `PARENT_ROOT`, and `BACKUP_PARENT` are the operator-verified physical directories. Adjust the approved list only after inspecting the festival scope.

```bash
set -euo pipefail
umask 077
for dir in "$FESTIVAL_ROOT" "$PARENT_ROOT" "$BACKUP_PARENT"; do
  [[ -d $dir && $dir == "$(realpath -e -- "$dir")" ]] || exit 1
done
[[ "$FESTIVAL_ROOT/" != "$PARENT_ROOT/"* && "$PARENT_ROOT/" != "$FESTIVAL_ROOT/"* ]] || exit 1
[[ "$BACKUP_PARENT/" != "$FESTIVAL_ROOT/"* && "$BACKUP_PARENT/" != "$PARENT_ROOT/"* ]] || exit 1
[[ "$BACKUP_PARENT/" != */public_html/* ]] || exit 1
[[ -f "$FESTIVAL_ROOT/index.html" && -f "$FESTIVAL_ROOT/isfd-deploy-target.txt" ]] || exit 1
approved=(
  index.html assets images it de en sitemap.xml default.php
  .htaccess .user.ini php.ini isfd-deploy-target.txt
)
present=()
for path in "${approved[@]}"; do
  [[ ! -L "$FESTIVAL_ROOT/$path" ]] || exit 1
  if [[ -e "$FESTIVAL_ROOT/$path" ]]; then
    present+=("$path")
  fi
done
snapshot=$(mktemp -d "$BACKUP_PARENT/isfd-$(date -u +%Y%m%dT%H%M%SZ).XXXXXXXX")
tar --create --file="$snapshot/festival.tar" --format=pax \
  --acls --xattrs --numeric-owner --one-file-system \
  --directory="$FESTIVAL_ROOT" -- "${present[@]}"
(
  cd -- "$snapshot"
  sha256sum festival.tar > festival.tar.sha256
  sha256sum -c festival.tar.sha256
)
tar --list --verbose --numeric-owner --file="$snapshot/festival.tar" | tee "$snapshot/member-list.txt"
tar --compare --numeric-owner --file="$snapshot/festival.tar" --directory="$FESTIVAL_ROOT"
```

The prior link and mount review is required before running the archive command. Save the reviewed archive member list, date, release revisions, and relevant hPanel settings alongside the snapshot. If the comparison changes while the site is active, take a fresh snapshot in a new directory.

4. Copy the snapshot and checksum into approved private storage. Verify the package checksum there. Inspect the archive member list and extract it only into a new, empty private rehearsal directory. Restore permissions and timestamps in the rehearsal using GNU tar’s `--same-permissions` and `--delay-directory-restore`. Use `--no-same-owner` for a local rehearsal under a different account. Verify ACLs, extended attributes, and expected ownership separately where they matter.
5. Generate inventories and a no-write plan locally. The helper reads trusted local copies, rejects symlinks and unusual file types, and writes JSON to stdout. Create a new local evidence directory outside the inspected directories for the redirected outputs. Keep the pre-release inventory with the backup and checksum its file as well.

```bash
python3 scripts/plan-hostinger-release.py inventory "$REHEARSAL_ROOT" > "$LOCAL_EVIDENCE/before.json"
python3 scripts/plan-hostinger-release.py inventory "$BASELINE_DIST" > "$LOCAL_EVIDENCE/baseline.json"
python3 scripts/plan-hostinger-release.py inventory "$CANDIDATE_DIST" > "$LOCAL_EVIDENCE/candidate.json"
python3 scripts/plan-hostinger-release.py plan "$BASELINE_DIST" "$CANDIDATE_DIST" \
  --before "$REHEARSAL_ROOT" > "$LOCAL_EVIDENCE/release-plan.json"
(
  cd -- "$LOCAL_EVIDENCE"
  sha256sum before.json baseline.json candidate.json release-plan.json > inventories.sha256
  sha256sum -c inventories.sha256
)
```

Before release, resolve every `review_unproven_paths` entry. A public hash or filename alone cannot authorize replacing a file of unknown ownership. The plan records candidate paths absent before release, including the localized routes, so recovery can distinguish additions from replacements. Test the old home and its asset links using a local static server over the extracted rehearsal. Keep both the archive and the original known-good build independently of GitHub’s artifact expiry.

## 3. Cleanup manifest

Of the 19 files in the previous release, 10 share the same relative path and bytes with the 230-file candidate. The shared `index.html` changes, and the candidate introduces 219 paths at the artifact level. The comparison below is for the publicly observed build. The pre-release filesystem inventory determines what actually exists on disk and whether a proposed move is safe.

| Obsolete path candidate | SHA-256 observed over HTTPS and matched to baseline |
| --- | --- |
| `assets/index-BNs4diaC.js` | `45a57df1006a6795ad99f8c64857e6e476bf3a7e6cc14652d8cec89d26421f8f` |
| `assets/index-ZLhL4Pub.css` | `e5182b3f818d1fd98e62d787fad60a67e48dec1590aa5aa006d3cb3bfbe976ff` |
| `images/acqua.webp` | `3ef16501da7aaa21f0c3ecb991ff8f4d1658cbda95d5fddb96facfaf7bb9703e` |
| `images/binario.webp` | `f6964cda4c3d02d8eeffd31098f33f485acdca315cf01b61632de6e973e5c2fa` |
| `images/blu.webp` | `3d6545d88dad039f326b39fd901e947533250b3b1d4e82663317d9183c0dd720` |
| `images/notte.webp` | `7675fd7506e57ae1b9c96c1d5f5c9b24f27f5d7f8a752a8edc214036a310b3a5` |
| `images/resta.webp` | `aa7565d0761615b727fd71eeb940191c42ed05ec3bbede88f4b2b3727977914a` |
| `images/sole.webp` | `54c932c7d40a3426997fb1fdb5f9ac70416ce9f4310fd9a2ffd513117c9f2fdb` |

The six WebP files are the fictional film stills. The old JS and CSS are referenced by the current public homepage, so retain them until the new entry points are verified and the rollback window is resolved. Retain the shared fonts and `images/hero.webp`. Treat `index.html` as a replacement path. Leave unknown files, checkout directories, the marker and configuration outside cleanup.

After an approved and verified release, take a fresh read-only inventory and use the planner with both snapshots. Check that each proposed path is festival-owned, a regular file, and matches the exact baseline digest both before and after the release. Confirm no retained HTML, CSS, JS or cached entry point requires it. After separate approval, move only those approved files to a new private quarantine preserving relative paths and metadata. Keep the quarantine through the rollback window. If a path changed, an alias is unresolved, or references remain, leave it in place. Confirm the approved URLs stop serving old content only after the move and any separately approved festival cache refresh.

## 4. Recovery after a partial deployment

1. Pause further publication and cleanup. Keep the failed run log. Record the reachable homepage, assets, available programme routes and sitemap. Capture a fresh scoped snapshot of the observed state in a separate private directory, preserving the original pre-release backup.
2. Run the same local plan with `--before "$REHEARSAL_ROOT" --observed "$AFTER_ROOT"`. Review each difference with the verified backup and the exact artifact from the failed run. Restore only approved present-before files. Treat missing files, unexpected digests, or type conflicts as items to reconcile. A release-only file is a quarantine candidate when its path was absent before and its observed digest equals the failed build’s digest.
3. Rehearse the rollback in a separate local copy. Restore previous assets and dependent files first, then the previous entry point. For any separately approved live recovery, recheck root, ancestors, link status, and the observed digest immediately before each operation. Stage each approved original in its destination directory and replace it by a same-filesystem rename with the backed-up mode and mtime. Keep ownership changes within the operator’s authority. Restore `default.php` only if an approved rollback requires the exact placeholder that publication retired. Apply the saved web configuration only when recovery requires it and its scope is confirmed.
4. Move approved release-only files to private quarantine after the previous entry point is restored. Remove only reviewed newly introduced directories that are empty after quarantine, starting with the deepest. Verify restored file SHA-256, permissions, timestamps and relevant directory metadata against the backup, and check the old entry point and assets over HTTPS. The current uploader is per-file and does not remove added routes. Replaying a prior artifact with its matching publisher alone leaves newer files on disk.

## Release decision

**GO for local preparation and review. NO-GO for a deployment-enabled merge or release.** Live root and alias isolation, filesystem link checks, a festival-only private snapshot and a successful restore rehearsal remain open. The cleanup shortlist is evidence for a separate review. The release plan has not been applied to Hostinger.
