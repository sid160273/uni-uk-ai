const https = require('https');
const fs = require('fs');
const path = require('path');

// Failed images that need re-downloading with alternative URLs
const failedImages = {
  'cardiff-ac-uk': 'https://images.unsplash.com/photo-1570829460005-c840387bb1ca?w=1200&h=800',
  'ed-ac-uk': 'https://images.unsplash.com/photo-1589417215359-f8c63f910419?w=1200&h=800', 
  'essex-ac-uk': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800',
  'hw-ac-uk': 'https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?w=1200&h=800'
};

async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    https.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, (redirectResponse) => {
          const file = fs.createWriteStream(filename);
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`✓ Re-downloaded: ${filename}`);
            resolve();
          });
        }).on('error', reject);
      } else {
        const file = fs.createWriteStream(filename);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Re-downloaded: ${filename}`);
          resolve();
        });
      }
    }).on('error', reject);
  });
}

async function main() {
  const publicDir = path.join(__dirname, '../public/universities');

  console.log('Re-downloading failed images...\n');

  for (const [slug, url] of Object.entries(failedImages)) {
    const filename = path.join(publicDir, `${slug}.jpg`);
    try {
      await downloadImage(url, filename);
    } catch (error) {
      console.error(`✗ Failed to download ${slug}: ${error.message}`);
    }
  }

  console.log('\n✅ Re-download complete!');
}

main();
