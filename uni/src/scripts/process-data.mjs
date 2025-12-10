import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAW_DATA_DIR = path.join(__dirname, '../data/raw');
const OUTPUT_FILE = path.join(__dirname, '../data/universities.json');
const MAP_FILE = path.join(__dirname, '../data/university_map.json');

// Helper to extract a section based on keywords
function extractSection(text, keywords) {
    const lines = text.split('\n');
    let section = "";

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (keywords.some(k => line.toLowerCase().includes(k.toLowerCase()))) {
            // Capture this line and the next few paragraphs
            let count = 0;
            for (let j = i; j < lines.length && count < 10; j++) {
                if (lines[j].trim().length > 0) {
                    section += lines[j] + "\n\n";
                    count++;
                }
            }
            break;
        }
    }
    return section.trim();
}

async function processFiles() {
    try {
        const files = await fs.readdir(RAW_DATA_DIR);
        const universities = [];

        // Load name mapping
        let nameMap = {};
        try {
            const mapData = await fs.readFile(MAP_FILE, 'utf-8');
            nameMap = JSON.parse(mapData);
        } catch (e) {
            console.warn("Could not load university_map.json, proceeding without mapping.");
        }

        for (const file of files) {
            if (!file.endsWith('.txt')) continue;

            const filePath = path.join(RAW_DATA_DIR, file);
            const content = await fs.readFile(filePath, 'utf-8');

            // Basic extraction logic
            const filenameBase = file.replace('.txt', '');

            // Use mapping if available, otherwise fallback to filename formatting
            let name = nameMap[file] || nameMap[filenameBase] || filenameBase
                .replace('.ac.uk', '')
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            // Extract Rankings
            const guardianRanking = content.match(/Guardian.*?(\d+)/i)?.[1];
            const nssRanking = content.match(/NSS.*?(\d+)/i)?.[1];

            // Extract other sections
            const entryRequirements = extractSection(content, ['entry requirements', 'grades', 'ucas points', 'admission']);
            const accommodation = extractSection(content, ['accommodation', 'halls', 'housing', 'residence']);
            const international = extractSection(content, ['international', 'overseas', 'global']);
            const studentLife = extractSection(content, ['student life', 'societies', 'clubs', 'nightlife', 'union']);
            const admissions = extractSection(content, ['how to apply', 'application', 'ucas']);

            const university = {
                id: filenameBase,
                slug: filenameBase.replace(/\./g, '-'),
                name: name,
                location: "UK", // Placeholder, could be extracted
                description: content.slice(0, 300).replace(/\n/g, ' ') + "...",
                features: [
                    "Research Excellence",
                    "Modern Campus",
                    "Strong Industry Links"
                ],
                imageUrl: `https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1000`, // Placeholder
                rankings: {
                    guardian: guardianRanking ? parseInt(guardianRanking) : undefined,
                    nss: nssRanking ? parseInt(nssRanking) : undefined
                },
                locationStats: {
                    costOfLiving: "Medium",
                    nightlife: 4,
                    transport: "Good"
                },
                campusStats: {
                    sportsRanking: 20,
                    internationalStudents: "15%"
                },
                entryRequirements: entryRequirements || "Contact university for specific entry requirements.",
                accommodation: accommodation || "Various on-campus and off-campus options available.",
                international: international || "Dedicated support for international students.",
                studentLife: studentLife || "Active student union with many societies and clubs.",
                admissions: admissions || "Apply via UCAS."
            };

            universities.push(university);
        }

        await fs.writeFile(OUTPUT_FILE, JSON.stringify(universities, null, 2));
        console.log(`Processed ${universities.length} universities.`);

    } catch (error) {
        console.error('Error processing files:', error);
    }
}

processFiles();
