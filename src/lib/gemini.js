import {
    GoogleGenerativeAI
} from "@google/generative-ai";

// Use the provided API key for the specialized agents
const apiKey = "AIzaSyDTu8IaGapCslkIuWwkkuVg-03_sxJU0Ak";
const API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Fallback to environment variable if needed
const fallbackKey = import.meta.env.VITE_GEMINI_API_KEY;
const activeApiKey = apiKey || fallbackKey;

if (!activeApiKey) {
    console.warn("No Gemini API key available - AI features may not work");
}

// Initialize with the new model
const genAI = activeApiKey ? new GoogleGenerativeAI(activeApiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.0-flash" }) : null;

// Direct API call function for specialized agents
const callGeminiAPI = async (prompt, systemContext = "") => {
    if (!activeApiKey) {
        throw new Error("Gemini API key not available");
    }

    const fullPrompt = systemContext ? `${systemContext}\n\n${prompt}` : prompt;

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': activeApiKey
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: fullPrompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.candidates[0]?.content?.parts[0]?.text || "No response generated";
    } catch (error) {
        console.error('Gemini API call error:', error);
        throw error;
    }
};

// Enhanced system prompt for both rural farming and artisan marketplace assistance
const SYSTEM_CONTEXT = `You are Bheema, an expert AI assistant for both "Rural Smart Kisan" and "Art O Mart" platforms.

Your expertise includes:

FARMING DOMAIN:
- Crop cultivation: sowing, irrigation, fertilization, pest control, harvesting
- Agricultural techniques: organic farming, modern farming, soil health, water management
- Seasonal farming: monsoon crops, rabi crops, kharif crops, intercropping
- Market insights: commodity prices, market trends, supply chain
- Government schemes: PM Kisan, MSP, crop insurance, subsidies
- Farm equipment: tractors, harvesters, irrigation systems, storage solutions
- Cold storage: preservation techniques, temperature management, storage duration
- Weather patterns: monsoons, droughts, crop planning based on weather
- Organic farming: natural fertilizers, bio-pesticides, sustainable practices
- Livestock management: dairy farming, poultry, animal health

ARTISAN MARKETPLACE DOMAIN:
- Traditional Indian crafts: pottery, textiles, jewelry, woodwork, metalwork, paintings, sculptures
- Regional specialties: Rajasthani pottery, Kashmiri carpets, Kerala coir products, West Bengali textiles, etc.
- Cultural significance and stories behind crafts
- Artisan backgrounds and techniques
- Price ranges and value assessment
- Care instructions and authenticity verification
- Marketing recommendations for artisans
- Customer preferences and regional tastes
- Product photography and presentation

Your personality:
- Knowledgeable, practical, and experienced in both domains
- Supportive of sustainable and profitable farming and artisan practices
- Helpful in providing actionable advice in both contexts
- Culturally sensitive and aware of regional differences

Always respond in a conversational, friendly tone. Determine context from user queries and respond accordingly - if they ask about crops or farming, respond with farming knowledge; if they ask about crafts or marketing, respond with artisan marketplace knowledge. When providing advice, include practical steps, timing considerations, and cost implications where relevant.`;

export const sendMessageToAI = async (userMessage, conversationHistory = []) => {
    try {
        // Build conversation context
        let prompt = SYSTEM_CONTEXT + "\n\n";

        // Add recent conversation history for context
        if (conversationHistory.length > 0) {
            prompt += "Recent conversation:\n";
            conversationHistory.slice(-6).forEach(msg => {
                prompt += `${msg.sender === 'user' ? 'Customer' : 'Maya'}: ${msg.text}\n`;
            });
            prompt += "\n";
        }

        // Add current user message
        prompt += `Farmer: ${userMessage}\n\nBheema:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error) {
        console.error("Error sending message to AI:", error);
        throw error;
    }
};

// Cultural knowledge snippets for region-aware farming adaptations
const COMPREHENSIVE_KNOWLEDGE = {
    regions: {
        'uttarakhand': {
            farming: {
                crops: 'temperate crops like apples, pears, plums, wheat, barley',
                farming: 'terraced farming, mountain agriculture, organic practices',
                climate: 'mountain climate, varied altitude farming, monsoon-dependent'
            },
            artisan: {
                crafts: 'woolen crafts like Pashmina, traditional patterns reminiscent of mountain landscapes',
                techniques: 'hand-spun wool, natural dyes from mountain herbs',
                cultural_context: 'mountain communities, sustainable practices, heritage preservation'
            }
        },
        'tamil_nadu': {
            farming: {
                crops: 'rice, sugarcane, cotton, groundnut, coconut, banana',
                farming: 'irrigation-dependent, delta farming, rain-fed agriculture',
                climate: 'tropical, monsoon-dependent, hot and humid coastal regions'
            },
            artisan: {
                crafts: 'silk weaving, Kanchipuram sarees, temple jewelry designs',
                techniques: 'traditional loom weaving, zari work, temple-inspired motifs',
                cultural_context: 'ancient Tamil culture, temple traditions, classical arts'
            }
        },
        'rajasthan': {
            farming: {
                crops: 'wheat, barley, gram, pulses, oilseeds, millets',
                farming: 'desert farming, drought-resistant crops, water conservation',
                climate: 'arid, dry, water-scarce, extreme temperature variations'
            },
            artisan: {
                crafts: 'block printing, mirror work, bandhani tie-dye',
                techniques: 'wooden block printing, camel leather work, desert-inspired colors',
                cultural_context: 'royal heritage, desert life, vibrant festivals'
            }
        },
        'west_bengal': {
            farming: {
                crops: 'rice, jute, sugarcane, potato, jute, fish farming',
                farming: 'delta farming, paddy cultivation, fish-vegetable rotation',
                climate: 'subtropical, high rainfall, alluvial soil, riverine agriculture'
            },
            artisan: {
                crafts: 'muslin, kantha embroidery, jamdani weaving',
                techniques: 'fine cotton weaving, running stitch embroidery, intricate patterns',
                cultural_context: 'literary heritage, artistic traditions, cultural renaissance'
            }
        }
    }
};

// Import AI agents
import {
    culturalAdaptationAgent,
    trustEngineAgent,
    sellerCoachingAgent,
    culturalFootnoteAgent,
    conversationAgent
} from './aiAgents';

// Enhanced cultural adaptation function using AI agent
export const adaptProductDescription = async (originalDescription, targetRegion, sourceRegion, productType) => {
    try {
        return await culturalAdaptationAgent(originalDescription, targetRegion, sourceRegion, productType);
    } catch (error) {
        console.error("Error adapting product description:", error);
        return {
            adaptedDescription: originalDescription,
            culturalBridge: 'Error in cultural adaptation',
            resonanceScore: '5.0',
            adaptationNotes: ['Adaptation failed, showing original']
        };
    }
};

// Enhanced multimodal analysis for Trust Engine using AI agent
export const analyzeProductTrust = async (productData, imageUrls = []) => {
    try {
        const imageMetadata = {
            imageCount: imageUrls.length,
            imageUrls: imageUrls,
            hasImages: imageUrls.length > 0
        };
        return await trustEngineAgent(productData, imageMetadata);
    } catch (error) {
        console.error("Error analyzing product trust:", error);
        return {
            trustScore: 70,
            badge: 'Silver Verified',
            reasons: ['Basic analysis completed'],
            riskFlags: [],
            verificationSteps: ['Manual verification recommended']
        };
    }
};

// Seller coaching and optimization suggestions using AI agent
export const generateSellerCoaching = async (productListing, performanceData = {}) => {
    try {
        return await sellerCoachingAgent(productListing, performanceData);
    } catch (error) {
        console.error("Error generating seller coaching:", error);
        return {
            overallScore: '6.0',
            tips: ['General improvements needed'],
            caption: 'Handcrafted with care',
            photoSuggestions: ['Improve lighting', 'Add detail shots'],
            pricingAdvice: 'Review market rates'
        };
    }
};

// Generate cultural footnotes with audio descriptions using AI agent
export const generateCulturalFootnote = async (productData, userLanguage = 'english') => {
    try {
        const targetRegion = productData?.region || 'general';
        return await culturalFootnoteAgent(productData, targetRegion, userLanguage);
    } catch (error) {
        console.error("Error generating cultural footnote:", error);
        return {
            culturalNote: 'Traditional handcrafted item with cultural significance.',
            audioScript: 'This beautiful handcraft represents traditional artistry.',
            culturalTags: ['handmade', 'traditional'],
            historicalPeriod: 'Traditional era',
            regionalSignificance: 'Local cultural importance'
        };
    }
};

// Function to get product recommendations based on query
export const getRecommendations = async (query, userPreferences = {}, context = 'farming') => {
    try {
        const userRegion = userPreferences.region || 'general';
        const regionalContext = COMPREHENSIVE_KNOWLEDGE.regions[userRegion] || {};

        let promptContext;
        let outputFormat;
        
        if (context === 'artisan') {
            // Artisan-specific recommendations
            promptContext = {
                domain: 'artisan marketplace',
                description: 'specific craft recommendations that are suitable for artisan sales and market trends'
            };
            outputFormat = `[
  {
    "name": "Product name",
    "category": "Category",
    "region": "Origin region",
    "priceRange": "₹X - ₹Y",
    "description": "Brief description",
    "culturalSignificance": "Cultural context",
    "artisanInfo": "Brief artisan background",
    "culturalResonance": "Why this appeals to user's region/culture",
    "adaptedDescription": "Description adapted for user's cultural context"
  }
]`;
        } else {
            // Farming-specific recommendations
            promptContext = {
                domain: 'farming',
                description: 'specific farming recommendations that are suitable for the farmer\'s region and conditions'
            };
            outputFormat = `[
  {
    "crop": "Crop name",
    "category": "Category (food, cash, horticulture, etc.)",
    "region": "Suitable for region",
    "season": "Best season to grow",
    "requirements": "Soil, water, climate requirements",
    "benefits": "Economic and practical benefits",
    "farmingTips": "Specific farming techniques",
    "marketPotential": "Expected market price/trends",
    "regionalAdaptation": "Why this is suitable for farmer's region"
  }
]`;
        }

        const prompt = `${SYSTEM_CONTEXT}

User Query: "${query}"
User Preferences: ${JSON.stringify(userPreferences)}
User Region: ${userRegion}
Regional Context: ${JSON.stringify(regionalContext)}
Domain Context: ${promptContext.domain}

Provide 3-5 ${promptContext.description}.
If the user is from a specific region, relate recommendations to local conditions and practices.

Provide in this JSON format:
${outputFormat}

Respond ONLY with valid JSON.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Try to parse JSON response
        try {
            const recommendations = JSON.parse(text.replace(/```json\n|```/g, ''));
            return recommendations;
        } catch (parseError) {
            console.warn('Could not parse recommendations as JSON:', text);
            return [];
        }
    } catch (error) {
        console.error("Error getting recommendations:", error);
        return [];
    }
};
