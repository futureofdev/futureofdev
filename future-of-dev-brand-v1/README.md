# Future of Dev — Brand package v1.0

August 2026 · futureofdev.com · *Learn and build the AI-native way.*

Everything needed to build the brand: the identity system, the target
design for Beehiiv, production logo files, the icon set, design tokens
and the three typefaces.

Start with `01-documents/future-of-dev-brand-kit.html` — open it in a
browser. It has a light/dark toggle and explains the reasoning behind
every value in `04-tokens/`.

---

## What's here

```
01-documents/    The brand kit and the Beehiiv target design
02-logo/         Symbol, wordmark and lockups — SVG (vector) and PNG (raster)
03-icons/        15 SVG icons: lifecycle, career stage, issue anatomy
04-tokens/       Colour and type tokens as CSS and JSON, plus Beehiiv field settings
05-fonts/        Archivo, Inter, JetBrains Mono — variable TTF and WOFF2, all OFL
```

---

## The five rules

These are the ones that break the brand if ignored. Everything else is
guidance.

1. **Build lime is a surface, never a text colour.** #C8FF3D measures
   1.18:1 against white — effectively invisible — but 15.06:1 against
   Ink. Use it as a filled block with #111827 type on top.
2. **Lime appears once per layout.** Roughly 2% of any page or email.
   Its scarcity is what makes it mean "do something here".
3. **Border radius is zero.** Everywhere, on everything.
4. **On dark surfaces, Signal indigo becomes Signal 300.** #4355FF is
   3.66:1 on the Void canvas and fails; #8B98FF is 7.38:1 and passes.
   The mark's advanced unit switches to lime on dark for the same reason.
5. **The channel in the symbol is always 1 unit and never closes.** The
   gap is the concept. Touching or overlapping the two shapes destroys it.

---

## Logo files

All lockup SVGs are **outlined** — the wordmark is converted to vector
paths, so no font needs to be installed anywhere for them to render
correctly. Send them to a printer or a partner without a second thought.

| File | Use |
| --- | --- |
| `fod-lockup-horizontal.svg` | Default. Use this unless you have a reason not to. |
| `fod-lockup-horizontal-reversed.svg` | Dark backgrounds. Unit is lime, not indigo. |
| `fod-lockup-horizontal-mono-*.svg` | Single-colour reproduction: stamps, embroidery, fax, one-colour print. |
| `fod-lockup-stacked.svg` | Narrow columns, print, anywhere horizontal doesn't fit. |
| `fod-wordmark.svg` | Wordmark alone. Rare — the symbol should normally be present. |
| `fod-symbol.svg` | Symbol alone. Required below 24px. |
| `fod-tile-*.svg` | Padded square tiles for avatars and app icons. Clear space already applied. |

**Minimum sizes.** 24px height with the wordmark. 16px symbol-only —
that's the floor. Clear space on all four sides is 8 units on the 32
canvas, which is twice the channel width.

### PNG exports

| File | Use |
| --- | --- |
| `fod-email-masthead-light@2x.png` | Beehiiv email header, light. 712×204, displays at 356×102. |
| `fod-email-masthead-dark@2x.png` | Beehiiv email header, dark. Colours are baked in so no client can invert them. |
| `fod-avatar-1000.png` | LinkedIn, GitHub, social profiles. |
| `favicon.ico`, `favicon-32.png`, `favicon-16.png` | Site favicon. |
| `fod-symbol-1024.png`, `fod-lockup-*@2x.png` | Transparent background, for decks and docs. |

Always set the masthead's `alt` text to **Future of Dev** so a stripped
image still names the publication.

---

## Icons

24×24 grid, 2px stroke, butt caps, mitred joins, zero radius. They use
`currentColor`, so set the colour on the parent element.

Fifteen files, sixteen uses: `lifecycle-build.svg` also serves as issue
block 04, which is why there is no `issue-04`. That's deliberate — the
lifecycle stage and the issue block are the same idea, and a system
earns trust by reusing rather than expanding.

Career-stage labels must always pair an icon **and** a word. Never
colour alone.

---

## Fonts

All three are SIL Open Font Licence — free to use, embed, modify and
redistribute. `OFL.txt` sits alongside each family and must travel with
it.

| Family | Role | Notes |
| --- | --- | --- |
| Archivo | Display | Variable, `wdth` 62–125 and `wght` 100–900. Use wdth 108–118, wght 800. Never below wdth 100. |
| Inter | Body and UI | Variable. 400 for body, 600 for emphasis. |
| JetBrains Mono | Metadata only | Issue numbers, dates, labels, prompts, code. Never body copy. |

`.woff2` for web and Beehiiv upload. `.ttf` if a tool rejects WOFF2.

**Archivo will not work in email.** Beehiiv's Post Builder is limited to
a curated email-safe set and does not accept custom fonts — including in
welcome and automation emails. Use `'Helvetica Neue', Helvetica, Arial`
there and let layout, the mono labels and the lime block carry the
brand. See `04-tokens/beehiiv-settings.md`.

---

## Provenance and status

The colour palette, type direction and visual principles came from the original
*Future of Dev Strategy, GTM & Design Brief* v1.0. The reconciled source now
lives in `docs/strategy/`; the old Word draft is intentionally not retained.
The symbol, wordmark, icon set, typeface selection and the eight system colour
extensions were designed against that brief.

Two things in the package are **not** approved content:

- The sample issue and homepage in the Beehiiv target document are
  illustrative. The testimonials in particular are marked placeholder
  and must not ship.
- The founder credibility copy is drafted from the brief's requirement,
  not from an approved bio. Check it before publishing.

Beehiiv's builders change often. Treat the field names in
`beehiiv-settings.md` as current-as-of-August-2026 and confirm them in
the app.
