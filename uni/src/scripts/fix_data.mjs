import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, '../data/universities.json');
const backupPath = path.join(__dirname, '../data/universities.json.bak');

// Backup
if (fs.existsSync(dataPath)) {
    fs.copyFileSync(dataPath, backupPath);
    console.log('Backup created at', backupPath);
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
let updatedDescCount = 0;
let updatedRankingsCount = 0;
let duplicatesRemoved = 0;

// Deduplication Logic
const uniqueData = [];
const seenIds = new Map();

data.forEach(uni => {
    if (!seenIds.has(uni.id)) {
        seenIds.set(uni.id, uni);
        uniqueData.push(uni);
    } else {
        // Compare with existing
        const existing = seenIds.get(uni.id);

        // Simple scoring: count keys, length of description
        const scoreUni = Object.keys(uni).length + (uni.description ? uni.description.length / 100 : 0);
        const scoreExisting = Object.keys(existing).length + (existing.description ? existing.description.length / 100 : 0);

        if (scoreUni > scoreExisting) {
            // Replace existing in map and array
            const index = uniqueData.indexOf(existing);
            if (index !== -1) {
                uniqueData[index] = uni;
                seenIds.set(uni.id, uni);
            }
        }
        duplicatesRemoved++;
    }
});

console.log(`Removed ${duplicatesRemoved} duplicate entries.`);
// Use uniqueData for further processing
uniqueData.forEach(uni => {
    // 1. Fix Description
    if (uni.description && uni.description.startsWith('# Site:')) {
        // Try to extract content after "New sentences found on <url>:"
        // The regex looks for the pattern and captures everything after
        const match = uni.description.match(/New sentences found on .*?:\s*(.*)/s);

        let cleanDesc = "";
        if (match && match[1]) {
            cleanDesc = match[1].trim();
            // Remove common prefixes if they exist
            cleanDesc = cleanDesc.replace(/^(Close Or Browse:|Browser does not support script\.|You are using an outdated browser\.)\s*/i, '');
        }

        // If extraction failed or result is too short/garbage
        if (!cleanDesc || cleanDesc.length < 50 || cleanDesc.includes("(No sentences captured.)")) {
            cleanDesc = `${uni.name} is a higher education institution located in ${uni.location || 'the UK'}. It offers a variety of undergraduate and postgraduate programs.`;
        }

        uni.description = cleanDesc;
        updatedDescCount++;
    } else if (uni.description && uni.description.startsWith('//')) {
        // Catch patterns like //abdn.ac.uk: ...
        uni.description = `${uni.name} is a higher education institution located in ${uni.location || 'the UK'}. It offers a variety of undergraduate and postgraduate programs.`;
        updatedDescCount++;
    }

    // 2. Fix Rankings
    if (!uni.rankings) {
        uni.rankings = { guardian: null, the: null, nss: null };
        updatedRankingsCount++;
    } else {
        let changed = false;
        if (uni.rankings.guardian === undefined) { uni.rankings.guardian = null; changed = true; }
        if (uni.rankings.the === undefined) { uni.rankings.the = null; changed = true; }
        if (uni.rankings.nss === undefined) { uni.rankings.nss = null; changed = true; }
        if (changed) updatedRankingsCount++;
    }

    // 3. Fix Rich Content Fields
    const fieldsToCheck = ['entryRequirements', 'accommodation', 'international', 'studentLife', 'admissions'];
    fieldsToCheck.forEach(field => {
        if (uni[field]) {
            const content = uni[field];
            // Check for bad patterns
            const isBad =
                content.includes('New sentences found on') ||
                content.includes('# Site:') ||
                content.includes('Pages fetched:') ||
                content.startsWith('//') ||
                (content.includes('Find out about') && content.includes('PhD') && content.length > 500) || // Repetitive PhD lists
                (content.length < 100 && (content.includes('View courses') || content.includes('Open Days') || content.includes('JavaScript')));

            if (isBad) {
                uni[field] = null; // Set to null to let UI defaults take over
                updatedDescCount++; // Reusing counter for simplicity or add new one
            }
        }
    });
});

fs.writeFileSync(dataPath, JSON.stringify(uniqueData, null, 2));
console.log(`Processed university data.`);
console.log(`Updated/Cleaned ${updatedDescCount} text fields.`);
console.log(`Updated ${updatedRankingsCount} ranking structures.`);
