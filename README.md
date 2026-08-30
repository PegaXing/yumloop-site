# yumloop.net

Holding page for Yumloop. Solid electric blue, the wordmark, "games coming soon",
and a Contact button that opens mail to yoni@yumloop.net.

Plain static HTML — no build step, no dependencies. Hosted on GitHub Pages.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The landing page. All CSS inline. |
| `privacy.html` | Privacy policy. Required by App Store Connect. |
| `support.html` | Support page. Required by App Store Connect. |
| `page.css` | Shared styles for the text pages (privacy, support). |
| `404.html` | Branded not-found page. |
| `yumloop-logo.png` | Wordmark, white on transparent (1400×196), cleaned and trimmed from the source art. |
| `yumloop-mark.png` | The ∞ loop alone — icon source and spare asset. |
| `favicon-32.png`, `favicon-192.png`, `apple-touch-icon.png`, `icon-512.png` | White loop on electric blue. |
| `og.png` | 1200×630 link preview card. |
| `CNAME` | Tells GitHub Pages the custom domain. |
| `robots.txt`, `sitemap.xml` | Basic SEO. |
| `_archive/full-site.html` | The longer About / Sightline / Contact page, parked for later. Not published. |

Brand: electric blue `#140FD7` (matches the app splash), white, Archivo + JetBrains Mono.
Flat and square throughout — no rounded corners, shadows, gradients, or background art.

## App Store Connect URLs

- Privacy Policy URL — `https://yumloop.net/privacy.html`
- Support URL — `https://yumloop.net/support.html`

The privacy policy was written against what Sightline actually does, audited from
`~/Downloads/sightline-ios`: TelemetryDeck analytics (`AnalyticsPlugin.swift`),
Game Center (`GameCenterPlugin.swift`), StoreKit purchases (`PurchasePlugin.swift`),
`localStorage` for progress, Google Fonts loaded at runtime, and a Google Form for
in-game feedback. No ad SDKs, no IDFA, no Firebase. **If any of that changes, the
policy has to change with it.**

## Publishing changes

Edit, then:

```
git add -A && git commit -m "update" && git push
```

Pages redeploys in about a minute.

## DNS (Wix)

The domain is registered at Wix. In **Wix → Domains → yumloop.net → Advanced →
Edit DNS records**, point the apex at GitHub Pages:

- `A` @ → `185.199.108.153`
- `A` @ → `185.199.109.153`
- `A` @ → `185.199.110.153`
- `A` @ → `185.199.111.153`
- `CNAME` www → `pegaxing.github.io`

Remove any existing A / CNAME records on `@` and `www` that point at Wix first.
Once DNS resolves, turn on **Enforce HTTPS** in the repo's Pages settings.
