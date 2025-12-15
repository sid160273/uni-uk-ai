const fs = require('fs');
const path = require('path');

const universitiesPath = path.join(__dirname, '../src/data/universities.json');
const universities = JSON.parse(fs.readFileSync(universitiesPath, 'utf-8'));

// Map of slugs to local image paths
const localImages = {
  'oxford-brookes-ac-uk': '/universities/oxford-brookes-ac-uk.jpg',
  'canterbury-ac-uk': '/universities/canterbury-ac-uk.jpg',
  'cardiff-ac-uk': '/universities/cardiff-ac-uk.jpg',
  'cardiffmet-ac-uk': '/universities/cardiffmet-ac-uk.jpg',
  'exeter-ac-uk': '/universities/exeter-ac-uk.jpg',
  'manchester-ac-uk': '/universities/manchester-ac-uk.jpg',
  'derby-ac-uk': '/universities/derby-ac-uk.jpg',
  'ed-ac-uk': '/universities/ed-ac-uk.jpg',
  'essex-ac-uk': '/universities/essex-ac-uk.jpg',
  'falmouth-ac-uk': '/universities/falmouth-ac-uk.jpg',
  'gcu-ac-uk': '/universities/gcu-ac-uk.jpg',
  'gla-ac-uk': '/universities/gla-ac-uk.jpg',
  'chester-ac-uk': '/universities/chester-ac-uk.jpg',
  'le-ac-uk': '/universities/le-ac-uk.jpg',
  'glos-ac-uk': '/universities/glos-ac-uk.jpg',
  'hud-ac-uk': '/universities/hud-ac-uk.jpg',
  'hull-ac-uk': '/universities/hull-ac-uk.jpg',
  'hw-ac-uk': '/universities/hw-ac-uk.jpg',
  'imperial-ac-uk': '/universities/imperial-ac-uk.jpg',
  'keele-ac-uk': '/universities/keele-ac-uk.jpg',
  'cam-ac-uk': '/universities/cam-ac-uk.jpg',
  'warwick-ac-uk': '/universities/warwick-ac-uk.jpg',
  'nottingham-ac-uk': '/universities/nottingham-ac-uk.jpg',
  'leeds-art-ac-uk': '/universities/leeds-art-ac-uk.jpg'
};

let updatedCount = 0;

universities.forEach(uni => {
  if (localImages[uni.slug]) {
    console.log(`Updating ${uni.name} (${uni.slug})`);
    console.log(`  Old: ${uni.imageUrl}`);
    console.log(`  New: ${localImages[uni.slug]}`);
    uni.imageUrl = localImages[uni.slug];
    updatedCount++;
  }
});

fs.writeFileSync(universitiesPath, JSON.stringify(universities, null, 2));

console.log(`\n✅ Updated ${updatedCount} universities with local images!`);
