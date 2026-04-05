# TODO

## Auth / session

- **Background token refresh**: The app refreshes access tokens on a timer (`TOKEN_REFRESH_INTERVAL_MS`) only while it is **foregrounded**; the OS may throttle or pause `setInterval` in the background. To renew tokens when the app is backgrounded or not running, plan **native** mechanisms (e.g. silent **push** to trigger refresh, **iOS** `BGAppRefreshTask` / `BGProcessingTask`, **Android** `WorkManager`), plus security and product review.
