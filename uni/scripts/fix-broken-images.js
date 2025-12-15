const https = require('https');
const fs = require('fs');
const path = require('path');

// University image mappings - using working Unsplash direct URLs
const universityImages = {
  'oxford-brookes-ac-uk': 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=1200&h=800',
  'canterbury-ac-uk': 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=800',
  'cardiff-ac-uk': 'https://images.unsplash.com/photo-1563976846119-ca89e66c1cb5?w=1200&h=800',
  'cardiffmet-ac-uk': 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&h=800',
  'exeter-ac-uk': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800',
  'manchester-ac-uk': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&h=800',
  'derby-ac-uk': 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=800',
  'ed-ac-uk': 'https://images.unsplash.com/photo-1580548765549-d828d6f50d09?w=1200&h=800',
  'essex-ac-uk': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=800',
  'falmouth-ac-uk': 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=1200&h=800',
  'gcu-ac-uk': 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=1200&h=800',
  'gla-ac-uk': 'https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?w=1200&h=800',
  'chester-ac-uk': 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=800',
  'le-ac-uk': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=800',
  'glos-ac-uk': 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&h=800',
  'hud-ac-uk': 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1200&h=800',
  'hull-ac-uk': 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=800',
  'hw-ac-uk': 'https://images.unsplash.com/photo-1588778686281-e223e4e0e5bc?w=1200&h=800',
  'imperial-ac-uk': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=800',
  'keele-ac-uk': 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=1200&h=800',
  'cam-ac-uk': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800',
  'warwick-ac-uk': 'https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?w=1200&h=800',
  'nottingham-ac-uk': 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=800',
  'leeds-art-ac-uk': 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&h=800'
};

async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        https.get(response.headers.location, (redirectResponse) => {
          const file = fs.createWriteStream(filename);
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`✓ Downloaded: ${filename}`);
            resolve();
          });
        }).on('error', reject);
      } else {
        const file = fs.createWriteStream(filename);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded: ${filename}`);
          resolve();
        });
      }
    }).on('error', reject);
  });
}

async function main() {
  const publicDir = path.join(__dirname, '../public/universities');
  
  // Create universities directory if it doesn't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('Downloading university images...\n');

  for (const [slug, url] of Object.entries(universityImages)) {
    const filename = path.join(publicDir, `${slug}.jpg`);
    try {
      await downloadImage(url, filename);
    } catch (error) {
      console.error(`✗ Failed to download ${slug}: ${error.message}`);
    }
  }

  console.log('\n✅ All downloads complete!');
  console.log(`\nNext step: Update universities.json to use these local images.`);
}

main();
