const https = require('https');
const fs = require('fs');
const path = require('path');

// Comprehensive list of universities needing image fixes
const universityImages = {
  'lboro-ac-uk': 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=800',
  'leedsbeckett-ac-uk': 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1200&h=800',
  'liverpool-ac-uk': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=800',
  'ljmu-ac-uk': 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&h=800',
  'londonmet-ac-uk': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=800',
  'chi-ac-uk': 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=800',
  'mmu-ac-uk': 'https://images.unsplash.com/photo-1524095629906-a24594c93d94?w=1200&h=800',
  'plymouth-ac-uk': 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=1200&h=800',
  'port-ac-uk': 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=800',
  'qmu-ac-uk': 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=1200&h=800',
  'qub-ac-uk': 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=800',
  'ravensbourne-ac-uk': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=800',
  'rgu-ac-uk': 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=1200&h=800',
  'roehampton-ac-uk': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=800',
  'royalholloway-ac-uk': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800',
  'salford-ac-uk': 'https://images.unsplash.com/photo-1524095629906-a24594c93d94?w=1200&h=800',
  'shu-ac-uk': 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1200&h=800',
  'southwales-ac-uk': 'https://images.unsplash.com/photo-1563976846119-ca89e66c1cb5?w=1200&h=800',
  'st-andrews-ac-uk': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800',
  'staffs-ac-uk': 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=800',
  'stir-ac-uk': 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=1200&h=800',
  'strath-ac-uk': 'https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?w=1200&h=800',
  'sunderland-ac-uk': 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&h=800',
  'surrey-ac-uk': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=800',
  'sussex-ac-uk': 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=1200&h=800',
  'swansea-ac-uk': 'https://images.unsplash.com/photo-1563976846119-ca89e66c1cb5?w=1200&h=800',
  'tees-ac-uk': 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=800',
  'uea-ac-uk': 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&h=800',
  'ulster-ac-uk': 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=800',
  'uos-ac-uk': 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&h=800',
  'leedstrinity-ac-uk': 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1200&h=800',
  'uwl-ac-uk': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=800',
  'uws-ac-uk': 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=1200&h=800',
  'westminster-ac-uk': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=800',
  'winchester-ac-uk': 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=800',
  'worc-ac-uk': 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&h=800',
  'wrexham-ac-uk': 'https://images.unsplash.com/photo-1563976846119-ca89e66c1cb5?w=1200&h=800',
  'york-ac-uk': 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=800',
  'yorksj-ac-uk': 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&h=800',
  'hartpury-ac-uk': 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=1200&h=800'
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
            const name = path.basename(filename);
            console.log('Downloaded: ' + name);
            resolve();
          });
        }).on('error', reject);
      } else {
        const file = fs.createWriteStream(filename);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          const name = path.basename(filename);
          console.log('Downloaded: ' + name);
          resolve();
        });
      }
    }).on('error', reject);
  });
}

async function main() {
  const publicDir = path.join(__dirname, '../public/universities');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const total = Object.keys(universityImages).length;
  console.log('Downloading ' + total + ' university images...\n');

  let downloaded = 0;
  for (const [slug, url] of Object.entries(universityImages)) {
    const filename = path.join(publicDir, slug + '.jpg');
    try {
      await downloadImage(url, filename);
      downloaded++;
    } catch (error) {
      console.error('Failed to download ' + slug + ': ' + error.message);
    }
  }

  console.log('\nDownloaded ' + downloaded + '/' + total + ' images!');
}

main();
