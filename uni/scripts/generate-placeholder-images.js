const fs = require('fs');
const path = require('path');

// Read universities data
const universitiesPath = path.join(__dirname, '../src/data/universities.json');
const universities = JSON.parse(fs.readFileSync(universitiesPath, 'utf-8'));

// Update each university to use a placeholder service
// Using placehold.co which generates nice gradient images with text
const updatedUniversities = universities.map(uni => {
  // Create a clean URL-encoded name for the image
  const encodedName = encodeURIComponent(uni.name);

  // Use placehold.co with gradient background and university name
  // Format: https://placehold.co/1200x600/gradient/white?text=University+Name
  const placeholderUrl = `https://placehold.co/1200x600/2563eb/ffffff?text=${encodedName}&font=roboto`;

  return {
    ...uni,
    imageUrl: placeholderUrl
  };
});

// Write updated data back
fs.writeFileSync(universitiesPath, JSON.stringify(updatedUniversities, null, 2));

console.log(`Updated ${updatedUniversities.length} universities with placeholder images!`);
console.log('\nExample URLs:');
console.log(updatedUniversities.slice(0, 3).map(u => `${u.name}: ${u.imageUrl}`).join('\n'));
