# Turn on Google sign-in with Clerk

The app now supports Clerk's sign-in screen, which can offer Google and email sign-in. The key is intentionally blank until the Numora Clerk application is selected.

1. In Clerk, create or open the Numora application and copy its **Publishable Key** (starts with `pk_`). This key is safe to use in browser code. Never use a Secret Key here.
2. In `clerk-config.js`, set `window.NUMORA_CLERK_PUBLISHABLE_KEY` to that key.
3. In the Clerk Dashboard, enable Google as a social connection for both sign-up and sign-in. For a live site, configure your own Google OAuth credentials in Clerk and add `https://numoramath.github.io` as an allowed application origin/redirect according to Clerk's dashboard instructions.
4. Publish the changed files to GitHub Pages and try signing in with Google.

Clerk manages account identity and login. Numora lesson progress and settings remain stored in this browser, organized separately by Clerk email; they do not sync between computers without a server/database.
