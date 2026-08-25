import { NextResponse } from 'next/server';
import { SarvamAIClient } from 'sarvamai';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const apiKey = process.env.SARVAM_API_KEY || process.env.NEXT_PUBLIC_SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Sarvam API key not configured' }, { status: 500 });
    }

    // Write file to a temporary location to create a ReadStream
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tempFilePath = path.join(os.tmpdir(), file.name);
    fs.writeFileSync(tempFilePath, buffer);

    const client = new SarvamAIClient({
      apiSubscriptionKey: apiKey,
    });

    const job = await client.docAi.digitise({
      file: [fs.createReadStream(tempFilePath)],
      language: "en-IN",
      output_format: "md",
    });

    // Cleanup temp file
    try {
      fs.unlinkSync(tempFilePath);
    } catch (e) {
      console.error('Failed to cleanup temp file', e);
    }

    return NextResponse.json({
      job_id: job.job_id,
      status: job.status
    });

  } catch (error: any) {
    console.error('Prescription upload API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
