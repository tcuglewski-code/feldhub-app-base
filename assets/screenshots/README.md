# 📸 App Store Screenshots

Screenshots for App Store Connect (iOS) and Google Play Console (Android).

## Required Screenshots

### iOS (App Store Connect)

| Device | Folder | Size | Count |
|--------|--------|------|-------|
| iPhone 6.5" (required) | `ios/6.5-inch/` | 1284 x 2778 | 2-10 |
| iPhone 5.5" (required) | `ios/5.5-inch/` | 1242 x 2208 | 2-10 |
| iPad 12.9" (optional) | `ios/12.9-inch/` | 2048 x 2732 | 2-10 |

### Android (Google Play)

| Device | Folder | Size | Count |
|--------|--------|------|-------|
| Phone (required) | `android/phone/` | 1080 x 1920 | 2-8 |
| Tablet 7" (optional) | `android/tablet/` | 1200 x 1920 | 2-8 |

## Screenshot Guidelines

### Content Recommendations

1. **First Screenshot**: Login or Hero screen (first impression)
2. **Second Screenshot**: Main Dashboard (core value)
3. **Third Screenshot**: Key Feature (task management)
4. **Fourth Screenshot**: Secondary Feature (offline/sync)
5. **Fifth Screenshot**: Profile/Settings
6. **Sixth Screenshot**: Unique differentiator

### Design Tips

- Use device frames/mockups
- Add headline text above device (40-60px, bold)
- Background gradient using brand colors
- Consistent style across all screenshots
- Show real (anonymized) data, not placeholders
- Localize text if app supports multiple languages

### Naming Convention

```
screenshot-01-login.png
screenshot-02-dashboard.png
screenshot-03-tasks.png
screenshot-04-offline.png
screenshot-05-profile.png
```

## Automation

Use Playwright to capture screenshots automatically:

```bash
# From app root
npx expo start --web

# In separate terminal
npx playwright test --project=screenshots
```

See `tests/screenshots.spec.js` for screenshot automation template.

## Tools

- **Rotato**: Device mockups (rotato.xyz)
- **Screenshots.pro**: Automated store screenshots
- **Figma**: Custom templates
- **AppLaunchpad**: Preview store listings
