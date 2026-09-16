# Money Manager brand icons

The approved mint wallet replaces the previous SpendMate icon. Artwork was created
with the built-in image-generation tool; PNG dimensions, padding and alpha-channel
exports were normalized with ImageMagick. No image-processing package was added to
the app.

| Asset | Size | Purpose |
| --- | --- | --- |
| `icon.png` | 1024 × 1024, opaque RGB | Default/iOS and legacy Android app icon |
| `adaptive-icon.png` | 1024 × 1024, RGBA | Android adaptive foreground, transparent outside the wallet |
| `monochrome-icon.png` | 1024 × 1024, RGBA | White alpha mask for wallpaper-tinted Android themed icons |
| `notification-icon.png` | 96 × 96, RGBA | White notification glyph with transparent background/cutouts |
| `splash-icon-dark.png` | 1024 × 1024, RGBA | Splash wallet artwork |
| `splash-icon-light.png` | 1024 × 1024, RGBA | Same splash artwork for dark appearance |
| `../../marketing/play-store/exports/play-store-icon.png` | 512 × 512, opaque RGBA | Upload separately to Play Console; below 1 MB |

The existing splash filenames are retained for compatibility. Both appearances
now use the same brand-green (`#003f2c`) splash background and mint wallet.
The adaptive background is also `#003f2c`. The notification accent is `#087f5b`.

Both adaptive masks fit within Android's centered 66/108-diameter safe circle.
The notification glyph uses an 80-pixel content box within the 96-pixel canvas;
it does not reuse launcher padding. Expo generates the mdpi through xxxhdpi
resources from these masters during prebuild. Do not manually copy one density
into all native resource folders.

Themed icons require a supporting launcher and the user's themed-icon setting;
they follow the system wallpaper/theme, not the in-app theme collection. Icon
assets do not expand the app's minimum Android version or device support.

About and onboarding branding use `icon.png`. Functional UI symbols and the old
archived SVGs in `bak/images` are intentionally unchanged.

## Rebuild

These are native asset changes, not an OTA update. EAS regenerates the ignored
native directories. For a local native build, run Expo prebuild first so existing
native resources are refreshed. Do not use `--clean` unless you intend to regenerate
the entire native project. Test the launcher (normal/themed), notification and
release splash on devices before publishing.

## Generation briefs

- Full-color master: centered mint wallet with layered cards and flowing ledger
  cutout on a full-bleed evergreen square; no text, currency symbols or baked-in
  rounded corners.
- Adaptive foreground: preserve the approved wallet, remove the full background
  and exterior shadow, export real alpha. Normalize padding after generation.
- Final monochrome/notification master prompt:

> Use case logo-brand. A perfectly clean flat BLACK vector-style wallet glyph on a perfectly WHITE background. Square image. Centered wallet occupies 60% width and height. Body is large rounded rectangle, two slanted bank cards protrude above it, right-hand rounded clasp with white circular hole. On left side of wallet are two white rounded slots: lower is short straight horizontal capsule; upper longer horizontal slot curves downward at its right end and meets clasp. Clean geometric black filled shapes, smooth antialiased edges, white cutouts. Absolutely no textures, NO distressed effects, NO shading or gradients, NO transparency, NO shadows, NO grain, NO 3D. Pure solid black ink and white background only. Like an SVG export designed for a small Android notification icon. No text, no presentation, just one centered mark.

Black coverage was encoded as alpha with pure white RGB for Android; white
background and white cutouts became transparent. The two earlier direct-alpha
monochrome attempts were rejected for rough cutouts and are not shipped.

## References

- [Expo icons and splash](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/)
- [Android adaptive layers and safe zone](https://developer.android.com/develop/ui/compose/system/icon_design_adaptive)
- [Expo notification icon](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Play Store icon specifications](https://developer.android.com/distribute/google-play/resources/icon-design-specifications)
