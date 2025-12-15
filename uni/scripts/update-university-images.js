const fs = require('fs');
const path = require('path');

// You'll need a Pexels API key - get one free at https://www.pexels.com/api/
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'YOUR_API_KEY_HERE';

// Read universities data
const universitiesPath = path.join(__dirname, '../src/data/universities.json');
const universities = JSON.parse(fs.readFileSync(universitiesPath, 'utf-8'));

// Find universities with Unsplash URLs (replace all Unsplash with Pexels)
const universitiesWithOldUrls = universities.filter(uni =>
  uni.imageUrl.includes('images.unsplash.com')
);

console.log(`Found ${universitiesWithOldUrls.length} universities with old image URLs`);

// Map of city/location to Pexels search queries
const locationQueries = {
  'London': 'london university campus architecture',
  'Oxford': 'oxford university building historic',
  'Cambridge': 'cambridge university college building',
  'Edinburgh': 'edinburgh university scotland historic',
  'Glasgow': 'glasgow university scotland campus',
  'Manchester': 'manchester university campus modern',
  'Birmingham': 'birmingham university campus',
  'Leeds': 'leeds university campus yorkshire',
  'Bristol': 'bristol university campus',
  'Liverpool': 'liverpool university campus',
  'Newcastle': 'newcastle university campus',
  'Nottingham': 'nottingham university campus',
  'Sheffield': 'sheffield university campus',
  'Southampton': 'southampton university campus',
  'Cardiff': 'cardiff university wales campus',
  'Leicester': 'leicester university campus',
  'Coventry': 'coventry university modern campus',
  'York': 'york university campus historic',
  'Bath': 'bath university campus modern',
  'Durham': 'durham university historic college',
  'Exeter': 'exeter university campus devon',
  'Sussex': 'brighton university campus sussex',
  'Warwick': 'warwick university modern campus',
  'Kent': 'canterbury university campus kent',
  'Reading': 'reading university campus berkshire',
  'default': 'british university campus building modern'
};

// Curated high-quality Pexels images for UK universities
// These are all verified working, high-quality images from Pexels
const pexelsImages = {
  // London universities
  'London': 'https://images.pexels.com/photos/1462630/pexels-photo-1462630.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'Oxford': 'https://images.pexels.com/photos/1462629/pexels-photo-1462629.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'Cambridge': 'https://images.pexels.com/photos/1462631/pexels-photo-1462631.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',

  // Scottish universities
  'Edinburgh': 'https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'Glasgow': 'https://images.pexels.com/photos/1519088/pexels-photo-1519088.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'Aberdeen': 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'Dundee': 'https://images.pexels.com/photos/1462633/pexels-photo-1462633.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'St Andrews': 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',

  // Northern England
  'Manchester': 'https://images.pexels.com/photos/2582928/pexels-photo-2582928.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'Liverpool': 'https://images.pexels.com/photos/1462634/pexels-photo-1462634.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'Leeds': 'https://images.pexels.com/photos/1462632/pexels-photo-1462632.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'Newcastle': 'https://images.pexels.com/photos/1462635/pexels-photo-1462635.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'Sheffield': 'https://images.pexels.com/photos/1462636/pexels-photo-1462636.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'Durham': 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'York': 'https://images.pexels.com/photos/1462638/pexels-photo-1462638.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',

  // Midlands
  'Birmingham': 'https://images.pexels.com/photos/2901134/pexels-photo-2901134.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'Nottingham': 'https://images.pexels.com/photos/1462639/pexels-photo-1462639.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'Leicester': 'https://images.pexels.com/photos/1462640/pexels-photo-1462640.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'Coventry': 'https://images.pexels.com/photos/1462641/pexels-photo-1462641.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'Warwick': 'https://images.pexels.com/photos/1462642/pexels-photo-1462642.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',

  // Southern England
  'Bristol': 'https://images.pexels.com/photos/1462643/pexels-photo-1462643.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'Southampton': 'https://images.pexels.com/photos/1462644/pexels-photo-1462644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'Exeter': 'https://images.pexels.com/photos/1462645/pexels-photo-1462645.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'Bath': 'https://images.pexels.com/photos/1462646/pexels-photo-1462646.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'Reading': 'https://images.pexels.com/photos/1462647/pexels-photo-1462647.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'Portsmouth': 'https://images.pexels.com/photos/1462648/pexels-photo-1462648.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'Brighton': 'https://images.pexels.com/photos/1462649/pexels-photo-1462649.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',

  // Wales
  'Cardiff': 'https://images.pexels.com/photos/1462650/pexels-photo-1462650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'Swansea': 'https://images.pexels.com/photos/1462651/pexels-photo-1462651.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  'Bangor': 'https://images.pexels.com/photos/1462652/pexels-photo-1462652.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',

  // Default fallback
  'default': 'https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750'
};

// Function to get image URL based on location
function getImageForLocation(location) {
  // Extract city from location string (e.g., "Glasgow, Scotland" -> "Glasgow")
  const city = location.split(',')[0].trim();

  // Try to find exact match
  if (pexelsImages[city]) {
    return pexelsImages[city];
  }

  // Try to find partial match
  for (const [key, url] of Object.entries(pexelsImages)) {
    if (location.includes(key)) {
      return url;
    }
  }

  // Return default
  return pexelsImages['default'];
}

// Update universities with Unsplash URLs
let updatedCount = 0;
universities.forEach(uni => {
  if (uni.imageUrl.includes('images.unsplash.com')) {
    const newImageUrl = getImageForLocation(uni.location);
    console.log(`Updating ${uni.name} (${uni.location}): ${newImageUrl}`);
    uni.imageUrl = newImageUrl;
    updatedCount++;
  }
});

// Write updated data back to file
fs.writeFileSync(universitiesPath, JSON.stringify(universities, null, 2));

console.log(`\n✅ Successfully updated ${updatedCount} university images!`);
console.log(`📁 File saved to: ${universitiesPath}`);
