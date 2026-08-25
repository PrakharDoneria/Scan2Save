import { NextResponse } from 'next/server';
import { SarvamAIClient } from 'sarvamai';
import AdmZip from 'adm-zip';

export async function POST(request: Request) {
  try {
    const { job_id } = await request.json();

    if (!job_id) {
      return NextResponse.json({ error: 'job_id is required' }, { status: 400 });
    }

    const apiKey = process.env.SARVAM_API_KEY || process.env.NEXT_PUBLIC_SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Sarvam API key not configured' }, { status: 500 });
    }

    const client = new SarvamAIClient({
      apiSubscriptionKey: apiKey,
    });

    const statusObj = await client.docAi.getStatus(job_id);
    const status = statusObj.status.toLowerCase();

    if (status === 'completed' || status === 'partially_completed') {
      const dl = await client.docAi.getDownloadUrl(job_id);
      
      // Fetch the zip file
      const response = await fetch(dl.url);
      if (!response.ok) {
        throw new Error('Failed to download result zip');
      }
      
      const buffer = Buffer.from(await response.arrayBuffer());
      const zip = new AdmZip(buffer);
      const zipEntries = zip.getEntries();
      
      // Find the markdown file
      const mdEntry = zipEntries.find(entry => entry.entryName.endsWith('.md'));
      if (!mdEntry) {
        throw new Error('No markdown output found in the result');
      }

      const markdownContent = mdEntry.getData().toString('utf8');

      // Now use LLM to extract the data
      const chatResponse = await client.chat.completions({
        model: "sarvam-105b",
        messages: [
          { 
            role: "system", 
            content: `You are a medical data extraction AI. Extract the following information from the provided prescription/medical document text into a raw JSON format (no markdown code blocks, just raw parseable JSON).
Keys required:
- "blood_group": string (e.g., "A+", "O-", or "" if not found)
- "allergies": string (e.g., "Penicillin, Peanuts" or "None known")
- "medical_conditions": string (e.g., "Asthma, Type 1 Diabetes" or "None declared")
- "habits": string (e.g., "Smoking" or "None known")

Analyze the document carefully and combine related findings.`
          },
          { role: "user", content: markdownContent }
        ],
        temperature: 0.1,
        max_tokens: 1500,
      });

      let extractedDataText = chatResponse.choices[0].message.content || '{}';
      
      // Clean up markdown formatting if the model still outputs it
      if (extractedDataText.startsWith('```json')) {
        extractedDataText = extractedDataText.replace(/```json\n?/, '').replace(/```\n?$/, '');
      }

      let parsedData = {};
      try {
        parsedData = JSON.parse(extractedDataText);
      } catch (e) {
        console.error("Failed to parse JSON from LLM", extractedDataText);
        throw new Error("Failed to parse AI response. Please try again.");
      }

      return NextResponse.json({
        status: 'completed',
        data: parsedData
      });
    } else if (status === 'failed' || status === 'rejected') {
      return NextResponse.json({ status: 'failed', error: 'Document processing failed' });
    } else {
      return NextResponse.json({ status: 'processing' });
    }

  } catch (error: any) {
    console.error('Prescription status API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
