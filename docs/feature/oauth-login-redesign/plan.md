# ClujParticipa OAuth Login Redesign Plan

## Summary

Implement the redesign in `/home/www/clujparticipa`. Add a custom localized OAuth-only login page that matches the landing page's editorial civic style and bypasses the default NextAuth sign-in screen. Keep only Google and Facebook login.

## Key Changes

- Add localized login routes through `src/i18n/routing.ts`:
  - `/ro/autentificare`
  - `/en/sign-in`
  - `/hu/bejelentkezes`
- Create `src/app/[locale]/login/page.tsx` as the shared route implementation.
- Update `src/components/layout/user-menu.tsx` so unauthenticated users link to the localized login page instead of calling `signIn()` directly.
- On the login page, call:
  - `signIn("google")`
  - `signIn("facebook")`
- Do not add email/password fields, reset password, registration, or user-management UI.

## Design

- Match the current landing page language:
  - `bg-paper`, `bg-paper-muted`, `text-ink`, `text-ink-muted`
  - `civic-teal`, `civic-blue`, `civic-orange`
  - serif headline, compact editorial layout, thin borders, restrained panels
- Use the normal site header/footer.
- Layout:
  - left editorial intro with short trust/prototype notes
  - right bordered sign-in panel with two OAuth buttons
  - responsive single-column layout on mobile
- Keep buttons polished but aligned with site style, not provider-default or NextAuth-default UI.

## Localization

- Add an `AuthPage` namespace to:
  - `src/i18n/messages/ro.json`
  - `src/i18n/messages/en.json`
  - `src/i18n/messages/hu.json`
- Include copy for title, subtitle, Google button, Facebook button, privacy/prototype note, and back-home link.

## Tests

- Add a login page test confirming:
  - Google and Facebook buttons render
  - email/password/reset UI does not render
  - provider clicks call `signIn("google")` and `signIn("facebook")`
- Update `user-menu` tests to expect a localized login link.
- Run `npm run type-check`, relevant Vitest tests, and `npm run build` if feasible.

## Assumptions

- Existing NextAuth Google/Facebook provider configuration remains unchanged.
- This is a frontend redesign over existing OAuth, not a new auth system.
