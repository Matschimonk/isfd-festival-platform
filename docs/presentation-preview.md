# Presenting the Director’s Preview

## Run a private rehearsal

Open the [Director’s deck](isfd-director-presentation.pdf) alongside the site. The browser preview runs on your laptop and works for an in-person meeting or screen share. No account, hosting charge or public address is required.

```sh
git switch feature/festival-experience-v3
npm ci
npm run build
npm run preview -- --host 127.0.0.1 --port 4277 --strictPort
```

Open `http://127.0.0.1:4277/en/` and use the header to try the other languages or theme. Start on Discover, then go to [the Thursday timetable](http://127.0.0.1:4277/en/programme/#day-3). Try Week, choose a day, filter by Night, then save an event with its bookmark and open My Festival. Open a film in the 2026 archive. The ticket QR on a local address can be read on the presenting machine, since a separate phone cannot reach that machine’s loopback address. Use the on-page demo link during a screen share. The archive, artwork and programme are served from the build. The trailer needs access to YouTube and its video delivery hosts after activation.

## Separate hosted address for remote review

The lowest-effort hosted option is a dedicated Cloudflare Pages Direct Upload project on a new `*.pages.dev` hostname. No custom domain or Hostinger access is required. Creating the project and uploading its files require an authorized Cloudflare account and a separately approved destination. Keep the content private until access controls have been checked. If access cannot be protected across all reachable hostnames, use the laptop rehearsal and a screen share.

1. Have the account owner create a **new** Pages Direct Upload project with a unique name and use that project only for the preview. Set its production branch explicitly to `main` and keep the production alias empty. A Pages owner can provision that exact configuration with `npx wrangler pages project create YOUR_PREVIEW_PROJECT --production-branch main`. In the new project’s settings, enable the Cloudflare Access policy for preview deployments. In Zero Trust, restrict access to the Director and named reviewers. Verify coverage of both the deployment-specific and branch preview hostnames. Authentication must be enforced server-side. Link obscurity and `noindex` are insufficient. [Cloudflare Pages preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
2. Confirm the protected HTTPS branch alias, such as `https://director.<project>.pages.dev`. Build from the reviewed PR #7 commit with that exact origin. The preview flag sets `noindex,nofollow` on every HTML page. The main build remains indexable by default.

   ```sh
   npm ci
   VITE_PRESENTATION_PREVIEW=1 \
     VITE_SITE_ORIGIN=https://director.YOUR_PREVIEW_PROJECT.pages.dev \
     npm run build
   ```

   Substitute the actual hostname at build time. The generated public artifact is `dist/` and includes directory indexes for direct links. Source, Editorial Studio Lite and dependencies stay outside it.
3. After authorization, upload only `dist/` to the named preview branch using Direct Upload. If using Wrangler, authenticate through the account owner’s browser or a scoped Cloudflare Pages Edit token for that account and keep it out of source control. Select the dedicated project and `director` branch explicitly, for example `npx wrangler pages deploy dist --project-name YOUR_PREVIEW_PROJECT --branch director`. Never target the project’s production branch. [Cloudflare Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
4. From a signed-out browser, verify every URL variant requires login, including the root, a film deep link and both preview hostname types. With reviewer access, refresh a film route, test language switching, and load the trailer once. Give named reviewers the protected branch URL. Remove the preview deployment and its access grants when the review ends.

The remote setup is prepared as instructions only. Keep the official domain, DNS, Hostinger and the production workflow outside this rehearsal.
