import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { parse } from 'papaparse';

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Validate file
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // convert to json
    const parsedData = parse(buffer.toString(), {
      header: true,
      skipEmptyLines: true,
    });

    // Return success response with file details
    return NextResponse.json(
      {
        success: true,
        file: {
          name: file.name,
          type: file.type,
          size: file.size,
          json: parsedData.data,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      {
        error: 'File upload failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
