#!/usr/bin/env python3
"""Inspect local release artifacts and snapshots. All commands are read-only."""

import argparse
import hashlib
import json
import re
import stat
import sys
from pathlib import Path, PurePosixPath

ASSET = re.compile(r"(?:assets|images)/[A-Za-z0-9_-]+\.(?:css|js|woff|woff2|webp)")
ROUTE = re.compile(
    r"(?:it|de|en)/(?:index\.html|"
    r"(?:films|programme|academy|media|venues|tickets|festival|archive)/index\.html|"
    r"(?:films|programme|media|venues)/[a-z0-9]+(?:-[a-z0-9]+)*/index\.html)"
)
DEMO_IMAGES = {f"images/{name}.webp" for name in ("acqua", "binario", "blu", "notte", "resta", "sole")}


def inventory(root):
    root = Path(root).absolute()
    if root != root.resolve(strict=True) or not root.is_dir():
        raise ValueError(f"Use a physical directory without symlink components: {root}")
    entries = {}

    def visit(directory):
        for path in sorted(directory.iterdir()):
            name = path.relative_to(root).as_posix()
            info = path.lstat()
            metadata = {"mode": f"{stat.S_IMODE(info.st_mode):04o}", "mtime_ns": info.st_mtime_ns}
            if stat.S_ISDIR(info.st_mode):
                entries[name] = {"type": "directory", **metadata}
                visit(path)
            elif stat.S_ISREG(info.st_mode):
                digest = hashlib.sha256()
                with path.open("rb") as handle:
                    for block in iter(lambda: handle.read(1024 * 1024), b""):
                        digest.update(block)
                after = path.lstat()
                if (info.st_dev, info.st_ino, info.st_size, info.st_mtime_ns, info.st_ctime_ns) != (
                    after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns, after.st_ctime_ns
                ):
                    raise ValueError(f"File changed during inventory: {name}")
                entries[name] = {
                    "type": "file", **metadata, "bytes": info.st_size, "sha256": digest.hexdigest()
                }
            else:
                raise ValueError(f"Symlink or unsupported filesystem entry: {name}")

    visit(root)
    return entries


def artifact_files(directory):
    files = {path: entry for path, entry in inventory(directory).items() if entry["type"] == "file"}
    if "index.html" not in files:
        raise ValueError(f"Missing index.html in artifact: {directory}")
    for path in files:
        if path not in {"index.html", "sitemap.xml"} and not (ASSET.fullmatch(path) or ROUTE.fullmatch(path)):
            raise ValueError(f"Unexpected artifact path: {path}")
    return files


def digest(entries, path):
    return entries.get(path, {}).get("sha256")


def previous_assets(baseline, candidate, before, observed):
    result = []
    for path in sorted(baseline.keys() - candidate.keys()):
        if path not in DEMO_IMAGES and not (path.startswith("assets/") and ASSET.fullmatch(path)):
            continue
        expected = digest(baseline, path)
        result.append({
            "path": path,
            "baseline_sha256": expected,
            "matches_before": None if before is None else digest(before, path) == expected,
            "matches_observed": None if observed is None else digest(observed, path) == expected,
        })
    return result


def release_plan(baseline, candidate, before, observed):
    plan = {
        "obsolete_asset_candidates": previous_assets(baseline, candidate, before, observed),
        "overwrite_owned_files": [],
        "review_unproven_paths": [],
        "restore_from_backup": [],
        "quarantine_release_only_files": [],
        "remove_release_only_directories_if_empty": [],
        "default_php_before_sha256": None,
    }
    if before is None:
        return plan

    plan["default_php_before_sha256"] = digest(before, "default.php")
    directories = {str(p) for path in candidate for p in PurePosixPath(path).parents if str(p) != "."}
    for path in sorted(directories, key=lambda value: (-value.count("/"), value)):
        before_type = before.get(path, {}).get("type")
        observed_type = observed.get(path, {}).get("type") if observed is not None else None
        if "file" in (before_type, observed_type):
            plan["review_unproven_paths"].append(path)
        elif before_type is None and (observed is None or observed_type == "directory"):
            plan["remove_release_only_directories_if_empty"].append(path)

    for path, release in sorted(candidate.items()):
        prior = before.get(path)
        if prior and (prior["type"] != "file" or prior["sha256"] != digest(baseline, path)):
            plan["review_unproven_paths"].append(path)
        if prior and prior["type"] != "file":
            continue
        if prior and digest(before, path) == digest(baseline, path):
            plan["overwrite_owned_files"].append(path)
        if observed is None:
            action = "restore_from_backup" if prior else "quarantine_release_only_files"
        else:
            actual = observed.get(path)
            if actual == prior:
                continue
            actual_hash = digest(observed, path)
            if prior and (actual is None or actual_hash in (prior["sha256"], release["sha256"])):
                action = "restore_from_backup"
            elif not prior and actual_hash == release["sha256"]:
                action = "quarantine_release_only_files"
            else:
                plan["review_unproven_paths"].append(path)
                continue
        plan[action].append(path)

    plan["review_unproven_paths"] = sorted(set(plan["review_unproven_paths"]))
    return plan


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    scan = commands.add_parser("inventory", help="print paths, modes, mtimes and SHA-256 to stdout")
    scan.add_argument("directory")
    plan = commands.add_parser("plan", help="print a cleanup and rollback comparison to stdout")
    plan.add_argument("baseline", help="prior release artifact directory")
    plan.add_argument("candidate", help="candidate dist directory")
    plan.add_argument("--before", help="extracted pre-release snapshot")
    plan.add_argument("--observed", help="extracted post-attempt snapshot")
    args = parser.parse_args()
    if args.command == "plan" and args.observed and not args.before:
        parser.error("--observed requires --before")
    try:
        if args.command == "inventory":
            output = inventory(args.directory)
        else:
            output = release_plan(
                artifact_files(args.baseline),
                artifact_files(args.candidate),
                inventory(args.before) if args.before else None,
                inventory(args.observed) if args.observed else None,
            )
    except (OSError, ValueError) as error:
        print(f"Stopped: {error}", file=sys.stderr)
        return 1
    print(json.dumps(output, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
