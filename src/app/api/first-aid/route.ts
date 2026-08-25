import { NextResponse } from 'next/server';
import { SarvamAIClient } from 'sarvamai';

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    const apiKey = process.env.SARVAM_API_KEY || process.env.NEXT_PUBLIC_SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Sarvam API key not configured' }, { status: 500 });
    }

    const client = new SarvamAIClient({
      apiSubscriptionKey: apiKey,
    });

    // 1. Get LLM response
    const chatResponse = await client.chat.completions({
      model: "sarvam-105b",
      messages: [
        { 
          role: "system", 
          content: "You are an emergency first-aid AI assistant. Keep your replies EXTREMELY short, direct, and to the point. No conversational filler. Provide only immediate action steps based on the reported condition." 
        },
        { role: "user", content: transcript }
      ],
      temperature: 0.3,
    });

    const llmOutput = chatResponse.choices[0].message.content;

    // 2. Convert LLM output to speech
    const ttsResponse = await client.textToSpeech.convert({
      text: llmOutput || '',
      language_code: 'en-IN',
      speaker: 'shubh',
      model: 'bulbul:v3'
    });

    // ttsResponse has audios array of base64 strings
    return NextResponse.json({
      text: llmOutput,
      audioBase64: ttsResponse.audios[0]
    });
  } catch (error: any) {
    console.error('First aid API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
