# Beehiiv settings

Field-by-field values for whoever builds the publication. Beehiiv's
builders change often — confirm the field names in the app before you
rely on this.

---

## The constraint that shapes everything

Beehiiv treats the **website** and the **email** as two separate type
systems.

- **Website Builder** — takes Google Fonts and custom uploads (WOFF2,
  TTF, OTF). Archivo works here.
- **Post Builder** — restricted to a curated email-safe set. Custom
  fonts are *not* supported, including in welcome and automation emails.

So Archivo will never render in the inbox. Don't fight this. Design each
issue so it still looks like Future of Dev in Arial: the layout, the
numbered mono block labels, the 2px ink rule under the masthead and the
single lime Build block do the work.

---

## Post Builder → Style → Basic → Colors

Beehiiv doesn't use role names. It has six fixed slots.

| Beehiiv slot | Set to | Drives |
| --- | --- | --- |
| Outside Background | `#F3F5F8` Cloud | Canvas behind the email body |
| Post Background | `#FFFFFF` Base | The reading surface |
| Text on Background | `#111827` Ink | All body copy |
| Primary | `#111827` Ink | Footer background, buttons, blockquotes, table cells, byline |
| Text on Primary | `#FFFFFF` — **verify** | See warning below |
| Secondary | `#E2E6EC` Hairline | Dividers, footer top border, blockquote borders |
| Link colour | `#4355FF` Signal | Inline links. 5.27:1 on white, passes AA. |

**Warning on Text on Primary.** That one value colours the footer text
*and* the post title. With a dark Primary you may end up with a white
title on a white background. Check it in Preview → Email view. If it
breaks, set Primary to `#F3F5F8` and Text on Primary to `#111827`, then
build the dark footer as its own block.

**Build lime is deliberately absent from that table.** None of the six
slots is an accent surface, so the Build block has to be built as a
component — a styled blockquote, or a code/HTML block containing a
background-filled table cell — and saved into the template once.

Never set Primary to lime. It would turn every button and the entire
footer green, and lime is 1.18:1 against white.

---

## Post Builder → Style → Advanced → Body

| Element | Font | Size | Line height | Weight | Tracking |
| --- | --- | --- | --- | --- | --- |
| H1 — issue title | Helvetica Neue / Arial | 30px | 1.04 | 700 | −0.032em |
| H2 — block heading | Helvetica Neue / Arial | 20px | 1.15 | 700 | −0.025em |
| H3 — sub-heading | Helvetica Neue / Arial | 16.5px | 1.2 | 700 | −0.015em |
| Paragraph | Helvetica Neue / Arial | 15.5px | 1.62 | 400 | 0 |
| H5/H6 — block labels | Courier New | 11px | 1.4 | 700 | 0.14em, uppercase |

If letter-spacing isn't exposed on the label style, use Arial caps
instead. Do not ship default Courier at normal tracking — it reads as an
accident rather than a decision.

## Post Builder → Style → Advanced → Email Header

Set the header **Image** to `fod-email-masthead-light@2x.png`. Alt text:
`Future of Dev`. Padding 18px vertical, 28px horizontal.

Shipping the masthead as an image with the lime unit baked in is what
stops Gmail's dark mode inverting the mark into something illegible.

---

## Website Builder → Settings → Themes

Upload from `05-fonts/`, or select from the Google Fonts library.

| Theme slot | Font | Notes |
| --- | --- | --- |
| Header | Archivo | wdth 110, wght 800 |
| Body | Inter | 400 / 600 |
| Button | Inter | 600 |

Colours: Ink `#111827` text, Signal `#4355FF` links and buttons, Cloud
`#F3F5F8` section tints, Base `#FFFFFF` page.

Set corner radius to **0** globally. This is the single setting most
likely to be left at a default and it undoes the whole edge quality of
the identity.

---

## Don't forget the web version of a post

Background, text and link colours on the *web* version of a post are
controlled by the Website Builder's Post page, not the Post Builder. Set
them to match or your archive will visibly drift from your inbox.

Website → Builder → Pages → Dynamic Pages → Post page.

---

## Build order

1. Fonts onto the site. Website Builder → Settings → Themes → Custom fonts.
2. Export masthead PNGs and favicons (already in `02-logo/png/`).
3. Set the Post Builder style once, then save it as a template post named `FoD Weekly v1`.
4. Put the six issue blocks into that template as placeholders: The Shift / Why it Matters / Learn / Build / Keep / Go Deeper, each with its label, icon and number.
5. Mirror the colours on the web Post page.
6. Wire the welcome survey: career stage, work area, what they want AI to help with, confidence, and what would make this valuable in 30 days.

---

## Verify on the first test send

- Gmail dark mode — masthead legible, Build block still lime, title not inverted into invisibility
- Outlook desktop — falls back to Arial without the layout collapsing
- Images off — masthead alt text reads "Future of Dev", no headline has vanished
- Phone at 375px — single column intact, Build block padding not crushed
- Web version matches the email — same background, link colour, type scale
- Lime appears exactly once. If it appears twice, one of them is decoration.
