# Fantrax private-league sync

The site refreshes Troy Bolton's private Fantrax data every six hours and can also be refreshed manually from the repository's **Actions → Sync Fantrax league → Run workflow** page.

## First-time setup and cookie renewal

1. Sign in to Fantrax in a private browser window.
2. Open the Troy Bolton league page and open the browser's developer tools.
3. In **Network**, reload the page and select a request to `fantrax.com`.
4. Under **Request Headers**, copy only the value after `Cookie:`. It should be one line containing semicolon-separated name/value pairs.
5. In the GitHub repository, open **Settings → Secrets and variables → Actions**.
6. Create or replace the repository secret named `FANTRAX_COOKIE` with that value.
7. Close the private browser window without explicitly logging out, then manually run the workflow once.

Never paste the cookie into a file, commit, issue, workflow log, or chat. It grants the same Fantrax access as the browser session.

## Expiration behavior

An expired or missing cookie does not overwrite `private-league.json`. The workflow publishes only the safe sync status, leaves the last successful snapshot on the website, and ends in failure so GitHub can send the repository owner an Actions notification. Replace the secret and run the workflow again to restore syncing.

Only normalized league information is committed. The Fantrax cookie remains in GitHub Actions Secrets and is never included in the website data.
