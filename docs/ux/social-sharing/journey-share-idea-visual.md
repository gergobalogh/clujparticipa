# Journey: Share an Idea — Visual

**Persona**: Maria (engaged resident, Manastur district)
**Job**: JOB-006 (Civic Advocacy) + JOB-007 (Credible First Impression)
**Trigger**: Maria has just supported an idea and wants to rally her neighbors

---

## Step 1: Decide to share
- **Action**: Maria finishes reading an idea detail page. She thinks "My WhatsApp group needs to see this."
- **Emotional state**: Motivated, slightly uncertain ("is there a share button?")
- **Output**: Intent to share formed

## Step 2: Locate share controls
- **Action**: Maria scans the idea detail page for a share action. She finds a share row below the vote section (desktop: action rail; mobile: below vote button).
- **Emotional state**: Relieved ("it's right there")
- **Output**: Share UI discovered — icons for WhatsApp, Facebook, and a copy-link button

## Step 3: Choose channel
- **Action**: Maria taps the WhatsApp icon. The browser opens WhatsApp Web with a pre-filled message containing the idea title, category, district, and a call-to-action, plus the idea URL.
- **Emotional state**: Satisfied ("one tap, that's easy")
- **Output**: WhatsApp Web compose window with pre-filled text

## Step 4: Send
- **Action**: Maria reviews the pre-filled message (optional: edits it), selects her neighborhood group, hits send.
- **Emotional state**: Confident ("this looks professional, not spammy")
- **Output**: Message sent to WhatsApp group

## Step 5: Recipient sees preview
- **Action**: Group members see the message. WhatsApp fetches the OG metadata and renders a preview card with the idea image, title, district, and support count.
- **Emotional state** (recipient): Curious ("oh, this is about my district")
- **Output**: Rich preview card rendered in the chat

## Step 6: Recipient clicks through
- **Action**: A group member taps the preview card and lands on the idea detail page.
- **Emotional state** (recipient): Engaged ("this is a real civic platform")
- **Output**: New visitor on idea detail page

## Step 7: Recipient supports
- **Action**: The new visitor reads the idea and clicks "Back this idea".
- **Emotional state** (recipient): Empowered ("I can make a difference")
- **Output**: Vote recorded, support count incremented

---

## Emotional Arc

```
Step 1: Motivated (7/10)    ████████░░
Step 2: Relieved (8/10)     █████████░
Step 3: Satisfied (8/10)    █████████░
Step 4: Confident (9/10)    █████████░
Step 5: Curious (6/10)      ██████░░░░  ← recipient enters
Step 6: Engaged (7/10)      ████████░░
Step 7: Empowered (9/10)    █████████░
```

Confidence builds progressively. The sharer's arc is smooth (motivated → confident). The recipient's arc starts at curiosity and rises to empowerment — the rich preview is the bridge that makes them click.

---

## Error Paths

| Step | Failure | Recovery |
|------|---------|----------|
| 2 | Share buttons not visible (mobile scroll position) | Sticky share bar or scroll indicator |
| 3 | WhatsApp not installed — intent URL fails silently | Fallback: copy link with toast "Link copied!" |
| 5 | OG image missing (idea has no images) | Category-colored placeholder image with idea title overlay |
| 5 | WhatsApp cache serves stale OG data | Add `?utm_source=whatsapp` to bypass cache on first fetch |
| 5 | Network fetch for OG data fails (offline recipient) | Text-only fallback: pre-filled message body already contains idea summary |
