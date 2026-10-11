# Free account setup

Guest building, local saving and all exports already work at https://folionest.onrender.com without registration.

GitHub sign-in through Supabase avoids a separate SMTP service and purchased sender domain. Visitors need a GitHub account. Email confirmation stays enabled; do not disable it to work around missing mail delivery.

1. Open [GitHub OAuth apps](https://github.com/settings/developers), then **New OAuth app**. Use application name **FolioNest**, homepage **https://folionest.onrender.com**, and redirect URI **https://vdolkritobdicnqoywiv.supabase.co/auth/v1/callback**. Keep wildcard matching and Device Flow off. Leave token expiry enabled.
2. Register the application. Generate a client secret yourself and save it securely. Do not put it in chat, Git, the browser application environment or the portfolio editor.
3. Open [FolioNest sign-in providers](https://supabase.com/dashboard/project/vdolkritobdicnqoywiv/auth/providers), select **GitHub**, enable it, enter the Client ID and secret directly, then **Save**. The secret belongs only in Supabase's provider configuration.
4. Supabase Site URL is **https://folionest.onrender.com**; the exact redirect allowlist must include **https://folionest.onrender.com/builder**. Add exact local builder URLs only when testing local OAuth. Do not add wildcard production redirects.
5. Set Render's public build flag `VITE_GITHUB_AUTH_ENABLED=true` and `VITE_EMAIL_SIGNUP_ENABLED=false`, then rebuild/deploy. Until provider setup is finished, keep GitHub disabled so visitors do not see a broken sign-in button.
6. Use **Account → Continue with GitHub** on the live site. Review the identity permissions before authorizing. Check that the guest draft survives the redirect, then test save/load, publish/republish/unpublish, sign-out and a second account's access denial.

The application requests GitHub's provider defaults; it does not request repository management scopes. Account authentication is handled by Supabase. Positive OAuth and cloud operations remain unverified until these steps are completed.

For email registration later, configure custom SMTP in Supabase and verify delivery, sender-domain authentication and provider quotas before enabling `VITE_EMAIL_SIGNUP_ENABLED=true`. Supabase's default sender is restricted to project-team addresses. Brevo offers a free sending allowance but requires a suitable authenticated sender domain; a free allowance does not supply a domain. Existing confirmed email/password accounts can still sign in when the registration button is hidden.

Sources: [Supabase GitHub Auth](https://supabase.com/docs/guides/auth/social-login/auth-github), [GitHub OAuth setup](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app), [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp).
