# Italy Short Film Days Berlin 2027

A bilingual React, TypeScript and Vite festival homepage. The June 2027 programme is an advance outline. Exact dates, times, venues and ticketing are pending. The 2026 archive uses the official festival retrospective and the TaxiDrivers programme.

## Setup

Use Node.js 20 or newer and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Select EN or IT in the header, explore the seven-day programme with day and category filters, or open a film from the 2026 archive. Language is carried in the URL and remembered for new visits.

```sh
npm run build
npm run preview
```

The build checks TypeScript and writes static assets to `dist/`. Preview serves that directory locally.

## WordPress integration

`src/content.ts` defines the domain models, bilingual programme outline and `FestivalRepository` contract. `src/archive.ts` implements the mock repository with separately sourced historical records. Only published records are shown publicly. A future CMS adapter should validate API responses, provide stable IDs and source links, and normalise references and translations before returning them. Global interface translations live in `src/copy.ts`.

## Archive and editorial data

- The [official 2026 retrospective](https://www.italyshortfilmdays.com/en/experience), [official selection](https://www.italyshortfilmdays.com/en/line), [official programme](https://www.italyshortfilmdays.com/en/program) and [TaxiDrivers programme](https://www.taxidrivers.it/533140/italy-short-film-days/italy-short-film-days-berlin-screening-programm.html) support the historical edition. The published sources disagree on the directing credit for Juggernaut, so that credit is omitted pending confirmation. Screening times are listed at programme-block level.
- Remaining editorial work includes confirming 2027 dates, venues and accessibility, credits for team and jury, partners, selection, media, registration links and ticket offers. Some 2026 films still need verified production metadata, translated synopses and rights-cleared artwork or trailers.
- Build generates `seo/sitemap.xml` alongside `dist/`. The current Hostinger deployment allowlist accepts the existing layout only, so the sitemap is an unshipped artifact. Publish it separately to the verified festival root when authorised. Detail URLs use query parameters and React updates their translated metadata after load. Crawlers that skip JavaScript receive the generic homepage social preview.

## Production deployment to Hostinger

The workflow builds on pull requests and pushes to `main` using Node.js 22. The `festival-dist` artifact contains the static website. Production deployment starts only from `main` when the repository variable `FESTIVAL_DEPLOY_ENABLED` is `true`. You can also run the workflow manually on `main` after configuration.

### Verify the destination and SSH access in hPanel

1. Open the hosting entry for `italyshortfilmdays2027.rawdrivers.org` and confirm its assigned document root with Hostinger. Compare it with the document root for `rawdrivers.org` and any other sites on the plan. If the festival shares a document root with another site, leave deployment disabled until Hostinger can provide a dedicated root.
2. In that festival hosting entry, enable **SSH Access** and record the hostname, port, and username shown by hPanel. Register the public half of a dedicated automation key there. Store the private half only in GitHub. Use a key that can authenticate noninteractively. Obtain the server host key or fingerprint from Hostinger and verify the OpenSSH `known_hosts` entry against it. For a nonstandard port, the entry should use `[hostname]:port`. A key returned by `ssh-keyscan` still needs independent verification.
3. Connect with the new key and change to the assigned festival directory. Run `pwd -P` to get the exact path. Confirm that your SSH account can write there, that its home is outside the document root, and that Bash, GNU coreutils, and tar are available. This workflow uses SSH shell access. Keep deployment disabled if the hosting account only provides SFTP.
4. Generate a public marker value using `printf 'isfd-2027-%s\n' "$(openssl rand -hex 16)"` locally. In the verified festival root, create `isfd-deploy-target.txt` containing that value on its own line. Confirm the exact value is served by `https://italyshortfilmdays2027.rawdrivers.org/isfd-deploy-target.txt` and is absent at the corresponding path on the main Raw Drivers domain. The workflow checks both URLs and the file reached over SSH. The marker supplements the hPanel document-root check.
5. If `default.php` exists, inspect it in hPanel or over SSH. Only for the confirmed Hostinger placeholder, run `sha256sum default.php` from the festival root and save the first field for GitHub. The workflow copies that exact file to a private backup in the SSH home and removes the live placeholder after installing `index.html`. An unverified or changed file stops deployment. If there is no `default.php`, leave the hash unset. Confirm that the festival server serves `index.html` for requests to `/`, including when a folder-specific server rule overrides the default directory index.
6. Preserve `github-source/`. Since it is already under a web root, verify that Hostinger denies public HTTP access to the checkout and its contents, while keeping the Git integration functional.

### Configure GitHub

In the repository's **Settings → Environments**, create `festival-production`. Restrict deployment branches to `main` and add required reviewers if your GitHub plan supports them.

Add these **environment secrets** to `festival-production`.

| Secret | Value |
| --- | --- |
| `HOSTINGER_SSH_HOST` | SSH hostname or IPv4 address shown by hPanel |
| `HOSTINGER_SSH_PORT` | SSH port shown by hPanel |
| `HOSTINGER_SSH_USER` | SSH username shown by hPanel |
| `HOSTINGER_SSH_PRIVATE_KEY` | Complete private key, including the header and footer |
| `HOSTINGER_SSH_KNOWN_HOSTS` | Independently verified OpenSSH host-key entry |
| `HOSTINGER_FESTIVAL_ROOT` | Canonical absolute path printed by `pwd -P` in the verified festival directory |

Add these **environment variables** to the same environment.

| Variable | Value |
| --- | --- |
| `HOSTINGER_FESTIVAL_MARKER` | Contents of `isfd-deploy-target.txt` |
| `HOSTINGER_DEFAULT_PHP_SHA256` | SHA-256 of the inspected Hostinger placeholder, when present |

After verifying the above and merging the workflow, open **Settings → Secrets and variables → Actions → Variables** and set the **repository variable** `FESTIVAL_DEPLOY_ENABLED` to `true`. In **Actions → Festival production**, choose **Run workflow** on `main` for the initial deployment. Review and approve the environment job if required. Subsequent pushes to `main` run the same process. Set the repository variable to `false` to pause deployment.

### Published files and verification

Vite uses the root base path `/`. The deployment uploads the build's `index.html`, `assets/`, and `images/`, with `index.html` installed last. The target directories should be dedicated to festival build assets. There is no directory synchronisation or cleanup of older assets. Source, dependencies, and Git metadata are excluded from the build upload. The workflow compares the HTTPS response at `/` and each published asset with the build to detect a stale cache, missing files, or a wrong directory index. If that check fails, inspect the festival's directory index and cache settings and rerun from `main` once corrected. The deploy does not change DNS or the parent site.
