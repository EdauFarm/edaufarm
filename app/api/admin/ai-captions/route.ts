import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface CaptionResult {
  caption: string;
  hashtags: string[];
}

const stylePrompts: Record<string, string> = {
  market: 'Create an inviting market-day caption that makes customers want to buy right now. Focus on freshness and availability.',
  story: 'Tell a compelling story about the product journey from farm to table. Emphasize the care and traditional methods used.',
  seasonal: 'Highlight the seasonal nature of the product. Create urgency around limited availability during this harvest season.',
  benefit: 'Focus on health benefits, nutritional value, and wellness aspects. Appeal to health-conscious buyers.',
  tradition: 'Emphasize heritage farming practices, cultural significance, and traditional methods passed down through generations.',
};

const audiencePrompts: Record<string, string> = {
  families: 'Target health-conscious parents and families who want quality, safe, and nutritious food for their children.',
  chefs: 'Target professional chefs and restaurants looking for premium quality ingredients and unique local products.',
  farmers: 'Target fellow farmers and agricultural enthusiasts interested in breeding stock, farming methods, and quality livestock.',
  wholesale: 'Target bulk buyers, distributors, and businesses looking for reliable supply and competitive pricing.',
};

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { productName, productDescription, style, audience, additionalNotes } = body;

    if (!productName) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    const stylePrompt = stylePrompts[style] || stylePrompts.market;
    const audiencePrompt = audiencePrompts[audience] || audiencePrompts.families;

    const prompt = `You are a marketing expert for Edau Farm, a sustainable farm in West Pokot, Kenya that produces premium honey, fresh fruits, livestock, and poultry. The farm was established in 2015 and practices traditional, sustainable farming methods.

Generate 3 unique marketing captions for the following product. Each caption should be compelling, authentic, and suitable for social media (Facebook, WhatsApp status, or Instagram).

Product: ${productName}
${productDescription ? `Description: ${productDescription}` : ''}
Style: ${stylePrompt}
Target Audience: ${audiencePrompt}
${additionalNotes ? `Additional Notes: ${additionalNotes}` : ''}

Guidelines:
- Keep captions between 100-200 characters for best social media visibility
- Use authentic, warm language that reflects a family farm
- Include relevant emojis where natural (honey, fruits, vegetables, livestock, farm)
- Avoid excessive exclamation marks or hype
- Make it relatable to Kenyan customers
- Include 3-5 relevant hashtags at the end

Return the response as a JSON array with 3 objects, each containing:
{
  "caption": "the marketing caption text",
  "hashtags": ["array", "of", "hashtags"]
}

Only return the JSON array, no other text.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate captions. Please try again.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      return NextResponse.json(
        { error: 'No response from AI. Please try again.' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let captions: CaptionResult[] = [];
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = textResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      captions = JSON.parse(cleanedResponse);
    } catch (parseError) {
      // If parsing fails, try to extract captions manually
      console.error('Failed to parse AI response:', textResponse);
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ captions });
  } catch (error) {
    console.error('AI captions error:', error);
    return NextResponse.json(
      { error: 'Failed to generate captions. Please check your API key and try again.' },
      { status: 500 }
    );
  }
}
