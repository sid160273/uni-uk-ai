import { University, getAllUniversities } from "./data";
import Fuse from "fuse.js";

export interface ChatState {
    location?: string;
    course?: string;
    vibe?: string;
    sports?: boolean;
    nightlife?: boolean;
}

export interface ChatResponse {
    message: string;
    recommendations: University[];
    newState: ChatState;
}

export async function chatWithAI(message: string, currentState: ChatState = {}): Promise<ChatResponse> {
    // Simulate API delay
    // TODO: Replace this simulation with a real call to an AI backend (e.g., OpenAI, Gemini, Anthropic)
    // once the backend is available. The `universities.json` data is now fully enriched and ready to be used as context.
    await new Promise((resolve) => setTimeout(resolve, 800));

    const universities = getAllUniversities();
    const lowerMsg = message.toLowerCase();

    // 1. Update State based on message content (Simple Heuristics)
    const newState = { ...currentState };

    // Detect Location
    if (lowerMsg.includes("london")) newState.location = "London";
    else if (lowerMsg.includes("scotland")) newState.location = "Scotland";
    else if (lowerMsg.includes("wales")) newState.location = "Wales";
    else if (lowerMsg.includes("north")) newState.location = "North";
    else if (lowerMsg.includes("south")) newState.location = "South";

    // Detect Course (very basic)
    if (lowerMsg.includes("nursing")) newState.course = "Nursing";
    else if (lowerMsg.includes("medicine")) newState.course = "Medicine";
    else if (lowerMsg.includes("art")) newState.course = "Art";
    else if (lowerMsg.includes("engineering")) newState.course = "Engineering";
    else if (lowerMsg.includes("business")) newState.course = "Business";

    // Detect Vibe
    if (lowerMsg.includes("friendly")) newState.vibe = "Friendly";
    else if (lowerMsg.includes("bustling")) newState.vibe = "Bustling";
    else if (lowerMsg.includes("creative")) newState.vibe = "Creative";
    else if (lowerMsg.includes("historic")) newState.vibe = "Historic";

    // Detect Interests
    if (lowerMsg.includes("sport") || lowerMsg.includes("gym")) newState.sports = true;
    if (lowerMsg.includes("nightlife") || lowerMsg.includes("party") || lowerMsg.includes("club")) newState.nightlife = true;

    // 2. Search based on accumulated state
    let searchTerms = [];
    if (newState.location) searchTerms.push(newState.location);
    if (newState.course) searchTerms.push(newState.course);
    if (newState.vibe) searchTerms.push(newState.vibe);

    // If no specific state, use the raw message for fuzzy search
    if (searchTerms.length === 0) {
        searchTerms.push(message);
    }

    const query = searchTerms.join(" ");

    // Configure Fuse.js
    const fuse = new Fuse(universities, {
        keys: [
            { name: "name", weight: 0.5 },
            { name: "location", weight: 0.3 },
            { name: "description", weight: 0.1 },
            { name: "features", weight: 0.1 },
            { name: "locationStats.vibe", weight: 0.2 }
        ],
        includeScore: true,
        threshold: 0.4,
        ignoreLocation: true,
    });

    const results = fuse.search(query);
    let recommendations = results.map(result => result.item);

    // Filter by specific constraints if set
    if (newState.sports) {
        recommendations = recommendations.filter(u => (u.campusStats.sportsRanking || 100) < 50); // Top 50 sports
    }
    if (newState.nightlife) {
        recommendations = recommendations.filter(u => u.locationStats.nightlife >= 4); // Good nightlife
    }

    recommendations = recommendations.slice(0, 5);

    // 3. Generate Response & Refining Question
    let responseMsg = "Based on our conversation so far, here are some suggestions.";

    // Determine what to ask next
    if (!newState.location) {
        responseMsg = `I've found some great universities for you. To narrow it down, **where in the UK would you prefer to study?** (e.g., London, Scotland, near the coast?)`;
    } else if (!newState.course) {
        responseMsg = `Great choice looking in ${newState.location}. **What subject are you planning to study?**`;
    } else if (!newState.vibe && !newState.sports && !newState.nightlife) {
        responseMsg = `I've found some ${newState.course} courses in ${newState.location}. **What's more important to you: Sports facilities, Nightlife, or a Creative vibe?**`;
    } else {
        responseMsg = `Here are the best matches for ${newState.course} in ${newState.location} with a focus on ${newState.sports ? "Sports" : ""}${newState.nightlife ? "Nightlife" : ""}${newState.vibe ? newState.vibe + " vibe" : ""}. **Is there anything else specific you're looking for?**`;
    }

    return {
        message: responseMsg,
        recommendations,
        newState
    };
}
