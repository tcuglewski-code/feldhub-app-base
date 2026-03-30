# 📱 App Store Assets Guide

Comprehensive guide for preparing App Store and Play Store assets for new tenant apps.

## 📁 Directory Structure

```
assets/
├── icon/
│   ├── icon-template.svg      # 1024x1024 base template
│   ├── icon-1024.png          # iOS App Store (1024x1024)
│   ├── adaptive-icon.png      # Android Adaptive (1024x1024)
│   └── adaptive-foreground.png
├── splash/
│   ├── splash-template.svg    # Base splash screen
│   ├── splash.png             # Universal (1284x2778)
│   └── splash-tablet.png      # iPad (2048x2732)
└── screenshots/
    ├── ios/
    │   ├── 6.5-inch/          # iPhone Pro Max (1284x2778)
    │   ├── 5.5-inch/          # iPhone 8 Plus (1242x2208)
    │   └── 12.9-inch/         # iPad Pro (2048x2732)
    └── android/
        ├── phone/             # Standard (1080x1920)
        └── tablet/            # 7-inch (1200x1920)
```

## 🎨 Icon Requirements

### iOS App Store Icon
- **Size:** 1024 x 1024 pixels
- **Format:** PNG (no transparency, no rounded corners)
- **Color Profile:** sRGB
- iOS automatically applies rounded corners

### Android Adaptive Icon
- **Size:** 1024 x 1024 pixels (foreground)
- **Safe Zone:** Center 66% (672x672)
- **Format:** PNG with transparency
- Foreground layer contains logo
- Background color from `tenant.ts` primaryColor

### Icon Design Guidelines
1. Keep design simple and recognizable
2. Logo centered within safe zone
3. Use tenant's primary color as background
4. Avoid text in icons (too small to read)
5. Test at small sizes (29x29, 60x60)

## 🌊 Splash Screen Requirements

### Universal Splash (Portrait)
- **Size:** 1284 x 2778 pixels (iPhone Pro Max)
- **Content:** Centered logo + brand color background
- **Logo Area:** Max 500x500 centered
- **Safe Area:** Top 200px, Bottom 400px clear

### iPad Splash
- **Size:** 2048 x 2732 pixels
- **Content:** Same as universal, scaled

### Design Guidelines
1. Background: Solid tenant primaryColor
2. Logo: Centered, white or contrasting
3. Optional: Small tagline below logo
4. No loading indicators (Expo handles these)

## 📸 Screenshot Requirements

### iOS Screenshots

| Device | Size (Portrait) | Required |
|--------|-----------------|----------|
| iPhone 6.5" | 1284 x 2778 | Yes (App Store) |
| iPhone 5.5" | 1242 x 2208 | Yes (legacy) |
| iPad 12.9" | 2048 x 2732 | If iPad support |

### Android Screenshots

| Device | Size (Portrait) | Required |
|--------|-----------------|----------|
| Phone | 1080 x 1920 | Yes |
| 7" Tablet | 1200 x 1920 | Optional |
| 10" Tablet | 1920 x 1200 (Landscape) | Optional |

### Screenshot Content Recommendations
1. **Screenshot 1:** Login/Onboarding (first impression)
2. **Screenshot 2:** Dashboard/Home (core value)
3. **Screenshot 3:** Key Feature 1 (task management)
4. **Screenshot 4:** Key Feature 2 (offline/sync)
5. **Screenshot 5:** Settings/Profile
6. **Screenshot 6:** Unique differentiator

### Screenshot Design Tips
- Use device frames (mockup)
- Add headline text above device (large, bold)
- Background gradient using brand colors
- Consistent style across all screenshots
- Show real data (anonymized) not placeholders

## 🏷️ Tenant Branding Checklist

When setting up a new tenant app:

### 1. Collect from Client
- [ ] Company logo (SVG or PNG 1024+)
- [ ] Brand colors (primary, secondary, accent)
- [ ] Tagline (optional, for splash)
- [ ] App name (max 30 chars for stores)
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)

### 2. Generate Assets
```bash
# Using tenant.ts config:
npm run generate:assets -- --tenant=newtenant
```

### 3. Asset Generation Script
The `scripts/generate-assets.js` script (create if needed):
1. Reads `tenant.ts` for colors/logo path
2. Generates icon variants (sharp/jimp)
3. Generates splash screen
4. Outputs to `assets/generated/[tenant]/`

### 4. Update app.config.js
```javascript
// app.config.js
export default {
  expo: {
    name: tenant.appName,
    icon: './assets/icon/icon-1024.png',
    splash: {
      image: './assets/splash/splash.png',
      backgroundColor: tenant.primaryColor,
      resizeMode: 'contain'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/icon/adaptive-foreground.png',
        backgroundColor: tenant.primaryColor
      }
    }
  }
}
```

## 🛠️ Tools Recommended

### Icon/Splash Generation
- **Figma** - Design templates, export all sizes
- **Sharp** (Node.js) - Automated resizing
- **ImageMagick** - CLI batch processing
- **App Icon Generator** - makeappicon.com

### Screenshots
- **Playwright** - Automated screenshots from app
- **Rotato** - Device mockups
- **AppLaunchpad** - Store listing previews

### Automation Command
```bash
# Install sharp for asset generation
npm install sharp --save-dev

# Generate all icon sizes from 1024 source
node scripts/generate-icons.js assets/icon/icon-1024.png

# Generate splash screens
node scripts/generate-splash.js assets/splash/splash.png
```

## 📋 Store Listing Checklist

### App Store Connect (iOS)
- [ ] 1024x1024 App Icon
- [ ] 6.5" iPhone screenshots (required)
- [ ] 5.5" iPhone screenshots (required)
- [ ] iPad screenshots (if universal)
- [ ] App Preview video (optional)
- [ ] Privacy Policy URL
- [ ] Support URL
- [ ] Marketing URL (optional)

### Google Play Console (Android)
- [ ] 512x512 High-res icon
- [ ] 1024x500 Feature graphic
- [ ] Phone screenshots (2-8)
- [ ] Tablet screenshots (if tablet support)
- [ ] Privacy Policy URL
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)

## 🎯 Quick Start for New Tenant

1. Copy `assets/` folder structure to tenant repo
2. Replace placeholder images with client branding
3. Run `npm run generate:assets`
4. Update `app.config.js` with asset paths
5. Test with `expo start` before building
6. Run EAS build for store submission

---

**Last Updated:** 2026-03-30
**Maintainer:** Amadeus (Feldhub Tech)
