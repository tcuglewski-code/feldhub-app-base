# App Store Assets Guide

Complete guide for preparing iOS App Store and Google Play Store assets for tenant apps.

## Quick Links

- **Main Documentation**: [`../assets/README.md`](../assets/README.md)
- **Icon Templates**: `../assets/icon/`
- **Splash Templates**: `../assets/splash/`
- **Screenshot Guide**: [`../assets/screenshots/README.md`](../assets/screenshots/README.md)

## Asset Generation

### Prerequisites

```bash
npm install sharp --save-dev
```

### Generate All Assets

```bash
# From repo root
node scripts/generate-assets.js \
  --icon=path/to/client-logo-1024.png \
  --splash=path/to/client-logo.png \
  --bg='#ClientPrimaryColor' \
  --output=assets/generated
```

### Output Structure

```
assets/generated/
├── ios/
│   ├── icon-1024.png      # App Store
│   ├── icon-180.png       # iPhone @3x
│   ├── icon-120.png       # iPhone @2x
│   └── Contents.json      # Xcode catalog
├── android/
│   ├── mipmap-xxxhdpi/
│   ├── mipmap-xxhdpi/
│   └── ...
├── expo/
│   ├── icon.png
│   └── adaptive-icon.png
├── splash/
│   ├── splash.png         # iPhone
│   ├── splash-tablet.png  # iPad
│   └── splash-android.png
└── screenshots/
    ├── ios/
    └── android/
```

## Tenant Branding Checklist

### From Client (Required)

- [ ] High-res logo (SVG or PNG 1024+)
- [ ] Primary brand color (hex)
- [ ] Secondary color (optional)
- [ ] App display name (max 30 chars)
- [ ] Short tagline (optional)

### From Feldhub (Generated)

- [ ] All icon sizes (iOS + Android)
- [ ] Splash screens (all devices)
- [ ] Screenshot templates
- [ ] app.config.js updates

## Store Submission Checklist

### iOS App Store Connect

- [ ] 1024x1024 App Icon
- [ ] 6.5" iPhone screenshots (2-10)
- [ ] 5.5" iPhone screenshots (2-10)
- [ ] iPad screenshots (if universal app)
- [ ] App Preview video (optional)
- [ ] Privacy Policy URL
- [ ] Support URL

### Google Play Console

- [ ] 512x512 App Icon
- [ ] 1024x500 Feature Graphic
- [ ] Phone screenshots (2-8)
- [ ] Tablet screenshots (optional)
- [ ] Privacy Policy URL
- [ ] Full description (4000 chars max)

## Related Documentation

- [Tenant Setup Guide](./tenant-setup-guide.md)
- [Vercel Organization Strategy](./vercel-organization-strategy.md)
- [EAS Build Pipeline](../eas.template.json)
