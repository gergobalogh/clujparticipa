# Journey: Resident Encounters Privacy Consent

## Visual Journey

```
┌──────────────────────────────────────────────────────────────────┐
│  RESIDENT CONSENT JOURNEY                                        │
├──────────┬──────────┬──────────┬──────────┬──────────────────────┤
│  Step 1  │  Step 2  │  Step 3  │  Step 4  │      Step 5          │
│  Land    │  See     │  Decide  │  Use     │  Return and          │
│  on site │  notice  │  opt-in  │  site    │  reconsider          │
│          │          │  or out  │  normally│                      │
├──────────┼──────────┼──────────┼──────────┼──────────────────────┤
│  😐      │  😟→😊   │  🤔      │  😊      │  🤔                  │
│  curious │  wary    │  deciding│  natural │  can change mind     │
│          │  then OK │          │  flow    │                      │
└──────────┴──────────┴──────────┴──────────┴──────────────────────┘

Shared artifacts:
  ${consentChoice} → Step 3 produces → consumed by Steps 4-5
  ${trackingActive} → derived from ${consentChoice} → consumed by all tracking events
```

## Steps

### Step 1: Land on site
- **Action**: Visit any page on clujparticipa.ro
- **Expected output**: Page loads with all content visible. No content is gated behind consent.
- **Emotional state**: curious (same as any visit)
- **Artifacts produced**: —
- **Artifacts consumed**: —

### Step 2: See privacy notice
- **Action**: Notice a lightweight banner or footer note about analytics
- **Expected output**: Clear, short text: "We use privacy-friendly analytics to understand how the platform is used. No personal data is collected." With "Accept" and "Decline" options.
- **Emotional state**: wary → OK (brief evaluation — "is this shady?")
- **Artifacts produced**: —
- **Artifacts consumed**: —

### Step 3: Decide — opt in or out
- **Action**: Click "Accept" or "Decline" (or ignore — notice dismissed after scroll)
- **Expected output**: Choice is remembered in localStorage. If declined, no tracking events fire. If accepted, Umami script activates. Site works identically either way.
- **Emotional state**: deciding (brief, low-stakes choice)
- **Artifacts produced**: `${consentChoice}`
- **Artifacts consumed**: —

### Step 4: Use site normally
- **Action**: Browse ideas, vote, comment — same as before analytics existed
- **Expected output**: No visible difference whether tracking is active or not. No popups, no cookie prompts, no behavior changes.
- **Emotional state**: natural flow (tracking is invisible)
- **Artifacts produced**: —
- **Artifacts consumed**: `${consentChoice}`

### Step 5: Return and reconsider
- **Action**: Visit privacy page or settings to change consent choice
- **Expected output**: Privacy page shows current consent status and a toggle to change it
- **Emotional state**: thoughtful (low frequency — most users never revisit)
- **Artifacts produced**: updated `${consentChoice}`
- **Artifacts consumed**: `${consentChoice}`

## Error paths

| Error | Trigger | Recovery |
|-------|---------|----------|
| Notice blocks content | Consent banner overlays page and blocks interaction | Banner must be dismissable, non-modal, and never gate content. Fix: use footer notice or small bottom bar. |
| Consent not remembered | localStorage cleared or not persisted | Graceful: treat as "no consent" — no tracking fires. Notice re-shows on next visit. |
| Ad blocker strips script | User has uBlock/NoScript | Umami script doesn't load — graceful no-op. Site works perfectly. Don't show error to user. |
