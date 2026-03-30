#!/usr/bin/env node
/**
 * App Store Assets Generator
 * 
 * Generates all required app icons and splash screens from source images.
 * 
 * USAGE:
 *   node scripts/generate-assets.js --icon=assets/icon/source.png --splash=assets/splash/source.png
 * 
 * REQUIREMENTS:
 *   npm install sharp
 * 
 * OUTPUT:
 *   assets/generated/
 *   ├── ios/
 *   │   ├── AppIcon.appiconset/     (all iOS sizes)
 *   │   └── LaunchImage.imageset/
 *   └── android/
 *       ├── mipmap-xxxhdpi/
 *       ├── mipmap-xxhdpi/
 *       └── ...
 */

const fs = require('fs');
const path = require('path');

// Check for sharp
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('⚠️  Sharp not installed. Run: npm install sharp --save-dev');
  console.log('   This script will create placeholder files instead.\n');
  sharp = null;
}

// Icon sizes for different platforms
const ICON_SIZES = {
  ios: [
    { size: 1024, name: 'icon-1024.png', purpose: 'App Store' },
    { size: 180, name: 'icon-180.png', purpose: 'iPhone @3x' },
    { size: 167, name: 'icon-167.png', purpose: 'iPad Pro @2x' },
    { size: 152, name: 'icon-152.png', purpose: 'iPad @2x' },
    { size: 120, name: 'icon-120.png', purpose: 'iPhone @2x' },
    { size: 87, name: 'icon-87.png', purpose: 'Spotlight @3x' },
    { size: 80, name: 'icon-80.png', purpose: 'Spotlight @2x' },
    { size: 76, name: 'icon-76.png', purpose: 'iPad @1x' },
    { size: 60, name: 'icon-60.png', purpose: 'iPhone @1x' },
    { size: 58, name: 'icon-58.png', purpose: 'Settings @2x' },
    { size: 40, name: 'icon-40.png', purpose: 'Spotlight @1x' },
    { size: 29, name: 'icon-29.png', purpose: 'Settings @1x' },
    { size: 20, name: 'icon-20.png', purpose: 'Notification' },
  ],
  android: [
    { size: 192, name: 'mipmap-xxxhdpi/ic_launcher.png', dpi: 'xxxhdpi' },
    { size: 144, name: 'mipmap-xxhdpi/ic_launcher.png', dpi: 'xxhdpi' },
    { size: 96, name: 'mipmap-xhdpi/ic_launcher.png', dpi: 'xhdpi' },
    { size: 72, name: 'mipmap-hdpi/ic_launcher.png', dpi: 'hdpi' },
    { size: 48, name: 'mipmap-mdpi/ic_launcher.png', dpi: 'mdpi' },
  ],
  expo: [
    { size: 1024, name: 'icon.png', purpose: 'Expo Icon' },
    { size: 1024, name: 'adaptive-icon.png', purpose: 'Android Adaptive Foreground' },
  ]
};

// Splash screen sizes
const SPLASH_SIZES = [
  { width: 1284, height: 2778, name: 'splash.png', purpose: 'iPhone Pro Max' },
  { width: 2048, height: 2732, name: 'splash-tablet.png', purpose: 'iPad Pro 12.9"' },
  { width: 1080, height: 1920, name: 'splash-android.png', purpose: 'Android Phone' },
];

// Screenshot sizes for stores
const SCREENSHOT_SIZES = {
  ios: [
    { width: 1284, height: 2778, folder: '6.5-inch', device: 'iPhone 14 Pro Max' },
    { width: 1242, height: 2208, folder: '5.5-inch', device: 'iPhone 8 Plus' },
    { width: 2048, height: 2732, folder: '12.9-inch', device: 'iPad Pro 12.9"' },
  ],
  android: [
    { width: 1080, height: 1920, folder: 'phone', device: 'Android Phone' },
    { width: 1200, height: 1920, folder: 'tablet-7', device: '7" Tablet' },
  ]
};

/**
 * Create directory if not exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Generate all icon sizes from source image
 */
async function generateIcons(sourcePath, outputDir) {
  console.log('\n🎨 Generating Icons...\n');
  
  if (!sharp) {
    console.log('   ⚠️  Sharp not available. Creating placeholder structure.\n');
    // Create placeholder directories
    ensureDir(path.join(outputDir, 'ios'));
    ensureDir(path.join(outputDir, 'android'));
    ensureDir(path.join(outputDir, 'expo'));
    
    fs.writeFileSync(
      path.join(outputDir, 'GENERATE_MANUALLY.md'),
      `# Manual Asset Generation Required\n\nSharp library not installed. Generate icons manually:\n\n1. Install sharp: \`npm install sharp\`\n2. Re-run: \`node scripts/generate-assets.js\`\n\nOr use online tools:\n- makeappicon.com\n- appicon.co\n`
    );
    return;
  }

  const source = sharp(sourcePath);
  
  // iOS Icons
  const iosDir = path.join(outputDir, 'ios');
  ensureDir(iosDir);
  for (const icon of ICON_SIZES.ios) {
    const outPath = path.join(iosDir, icon.name);
    await source
      .clone()
      .resize(icon.size, icon.size)
      .png()
      .toFile(outPath);
    console.log(`   ✅ ${icon.name} (${icon.size}x${icon.size}) - ${icon.purpose}`);
  }

  // Android Icons
  for (const icon of ICON_SIZES.android) {
    const outPath = path.join(outputDir, 'android', icon.name);
    ensureDir(path.dirname(outPath));
    await source
      .clone()
      .resize(icon.size, icon.size)
      .png()
      .toFile(outPath);
    console.log(`   ✅ ${icon.name} (${icon.size}x${icon.size}) - ${icon.dpi}`);
  }

  // Expo Icons
  const expoDir = path.join(outputDir, 'expo');
  ensureDir(expoDir);
  for (const icon of ICON_SIZES.expo) {
    const outPath = path.join(expoDir, icon.name);
    await source
      .clone()
      .resize(icon.size, icon.size)
      .png()
      .toFile(outPath);
    console.log(`   ✅ ${icon.name} (${icon.size}x${icon.size}) - ${icon.purpose}`);
  }

  console.log('\n   🎉 Icon generation complete!\n');
}

/**
 * Generate splash screens from source
 */
async function generateSplash(sourcePath, outputDir, backgroundColor = '#2D5A27') {
  console.log('\n🌊 Generating Splash Screens...\n');
  
  if (!sharp) {
    console.log('   ⚠️  Sharp not available. Skipping splash generation.\n');
    return;
  }

  const splashDir = path.join(outputDir, 'splash');
  ensureDir(splashDir);

  for (const size of SPLASH_SIZES) {
    const outPath = path.join(splashDir, size.name);
    
    // Create background with specified color
    const background = sharp({
      create: {
        width: size.width,
        height: size.height,
        channels: 4,
        background: backgroundColor
      }
    });

    // Get source image metadata
    const source = sharp(sourcePath);
    const metadata = await source.metadata();
    
    // Calculate resize to fit center (max 40% of smallest dimension)
    const maxLogoSize = Math.min(size.width, size.height) * 0.4;
    const scale = Math.min(maxLogoSize / metadata.width, maxLogoSize / metadata.height);
    const logoWidth = Math.round(metadata.width * scale);
    const logoHeight = Math.round(metadata.height * scale);
    
    const logoBuffer = await source
      .resize(logoWidth, logoHeight)
      .toBuffer();

    // Composite logo onto background (centered, offset up slightly)
    await background
      .composite([{
        input: logoBuffer,
        left: Math.round((size.width - logoWidth) / 2),
        top: Math.round((size.height - logoHeight) / 2) - 50
      }])
      .png()
      .toFile(outPath);
    
    console.log(`   ✅ ${size.name} (${size.width}x${size.height}) - ${size.purpose}`);
  }

  console.log('\n   🎉 Splash screen generation complete!\n');
}

/**
 * Create screenshot placeholder directories
 */
function createScreenshotStructure(outputDir) {
  console.log('\n📸 Creating Screenshot Directories...\n');
  
  for (const [platform, sizes] of Object.entries(SCREENSHOT_SIZES)) {
    for (const size of sizes) {
      const dir = path.join(outputDir, 'screenshots', platform, size.folder);
      ensureDir(dir);
      
      // Create README with size requirements
      fs.writeFileSync(
        path.join(dir, 'README.md'),
        `# ${size.device} Screenshots\n\nRequired size: **${size.width} x ${size.height}** pixels\n\nPlace 2-8 screenshots here named:\n- screenshot-01.png\n- screenshot-02.png\n- ...\n`
      );
      console.log(`   📁 ${platform}/${size.folder}/ (${size.width}x${size.height})`);
    }
  }

  console.log('\n   🎉 Screenshot structure created!\n');
}

/**
 * Generate Contents.json for Xcode asset catalogs
 */
function generateXcodeContentsJson(outputDir) {
  const iosDir = path.join(outputDir, 'ios');
  
  const contents = {
    images: ICON_SIZES.ios.map(icon => ({
      filename: icon.name,
      idiom: icon.size >= 76 ? 'iphone' : 'universal',
      scale: icon.name.includes('@3x') ? '3x' : icon.name.includes('@2x') ? '2x' : '1x',
      size: `${icon.size}x${icon.size}`
    })),
    info: { author: 'xcode', version: 1 }
  };

  fs.writeFileSync(
    path.join(iosDir, 'Contents.json'),
    JSON.stringify(contents, null, 2)
  );
  console.log('   ✅ Generated iOS Contents.json\n');
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  let iconSource = null;
  let splashSource = null;
  let outputDir = 'assets/generated';
  let bgColor = '#2D5A27';

  for (const arg of args) {
    if (arg.startsWith('--icon=')) iconSource = arg.split('=')[1];
    if (arg.startsWith('--splash=')) splashSource = arg.split('=')[1];
    if (arg.startsWith('--output=')) outputDir = arg.split('=')[1];
    if (arg.startsWith('--bg=')) bgColor = arg.split('=')[1];
  }

  console.log('\n═══════════════════════════════════════');
  console.log('  📱 Feldhub App Store Assets Generator');
  console.log('═══════════════════════════════════════\n');

  // Create output directory
  ensureDir(outputDir);

  // Generate icons if source provided
  if (iconSource && fs.existsSync(iconSource)) {
    await generateIcons(iconSource, outputDir);
    generateXcodeContentsJson(outputDir);
  } else {
    console.log('⚠️  No icon source provided or file not found.');
    console.log('   Usage: --icon=path/to/icon-1024.png\n');
  }

  // Generate splash if source provided
  if (splashSource && fs.existsSync(splashSource)) {
    await generateSplash(splashSource, outputDir, bgColor);
  } else {
    console.log('⚠️  No splash source provided or file not found.');
    console.log('   Usage: --splash=path/to/logo.png --bg=#2D5A27\n');
  }

  // Always create screenshot structure
  createScreenshotStructure(outputDir);

  console.log('═══════════════════════════════════════');
  console.log('  ✅ Asset generation complete!');
  console.log(`  📁 Output: ${outputDir}/`);
  console.log('═══════════════════════════════════════\n');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
