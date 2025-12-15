const fs = require('fs');
const path = require('path');

const universitiesPath = path.join(__dirname, '../src/data/universities.json');
const universities = JSON.parse(fs.readFileSync(universitiesPath, 'utf-8'));

// Map of slugs to local image paths
const localImages = {
  'lboro-ac-uk': '/universities/lboro-ac-uk.jpg',
  'leedsbeckett-ac-uk': '/universities/leedsbeckett-ac-uk.jpg',
  'liverpool-ac-uk': '/universities/liverpool-ac-uk.jpg',
  'ljmu-ac-uk': '/universities/ljmu-ac-uk.jpg',
  'londonmet-ac-uk': '/universities/londonmet-ac-uk.jpg',
  'chi-ac-uk': '/universities/chi-ac-uk.jpg',
  'mmu-ac-uk': '/universities/mmu-ac-uk.jpg',
  'plymouth-ac-uk': '/universities/plymouth-ac-uk.jpg',
  'port-ac-uk': '/universities/port-ac-uk.jpg',
  'qmu-ac-uk': '/universities/qmu-ac-uk.jpg',
  'qub-ac-uk': '/universities/qub-ac-uk.jpg',
  'ravensbourne-ac-uk': '/universities/ravensbourne-ac-uk.jpg',
  'rgu-ac-uk': '/universities/rgu-ac-uk.jpg',
  'roehampton-ac-uk': '/universities/roehampton-ac-uk.jpg',
  'royalholloway-ac-uk': '/universities/royalholloway-ac-uk.jpg',
  'salford-ac-uk': '/universities/salford-ac-uk.jpg',
  'shu-ac-uk': '/universities/shu-ac-uk.jpg',
  'southwales-ac-uk': '/universities/southwales-ac-uk.jpg',
  'st-andrews-ac-uk': '/universities/st-andrews-ac-uk.jpg',
  'staffs-ac-uk': '/universities/staffs-ac-uk.jpg',
  'stir-ac-uk': '/universities/stir-ac-uk.jpg',
  'strath-ac-uk': '/universities/strath-ac-uk.jpg',
  'sunderland-ac-uk': '/universities/sunderland-ac-uk.jpg',
  'surrey-ac-uk': '/universities/surrey-ac-uk.jpg',
  'sussex-ac-uk': '/universities/sussex-ac-uk.jpg',
  'swansea-ac-uk': '/universities/swansea-ac-uk.jpg',
  'tees-ac-uk': '/universities/tees-ac-uk.jpg',
  'uea-ac-uk': '/universities/uea-ac-uk.jpg',
  'ulster-ac-uk': '/universities/ulster-ac-uk.jpg',
  'uos-ac-uk': '/universities/uos-ac-uk.jpg',
  'leedstrinity-ac-uk': '/universities/leedstrinity-ac-uk.jpg',
  'uwl-ac-uk': '/universities/uwl-ac-uk.jpg',
  'uws-ac-uk': '/universities/uws-ac-uk.jpg',
  'westminster-ac-uk': '/universities/westminster-ac-uk.jpg',
  'winchester-ac-uk': '/universities/winchester-ac-uk.jpg',
  'worc-ac-uk': '/universities/worc-ac-uk.jpg',
  'wrexham-ac-uk': '/universities/wrexham-ac-uk.jpg',
  'york-ac-uk': '/universities/york-ac-uk.jpg',
  'yorksj-ac-uk': '/universities/yorksj-ac-uk.jpg',
  'hartpury-ac-uk': '/universities/hartpury-ac-uk.jpg'
};

let updatedCount = 0;

universities.forEach(uni => {
  if (localImages[uni.slug]) {
    console.log('Updating ' + uni.name + ' (' + uni.slug + ')');
    console.log('  Old: ' + uni.imageUrl);
    console.log('  New: ' + localImages[uni.slug]);
    uni.imageUrl = localImages[uni.slug];
    updatedCount++;
  }
});

fs.writeFileSync(universitiesPath, JSON.stringify(universities, null, 2));

console.log('\nUpdated ' + updatedCount + ' universities with local images!');
