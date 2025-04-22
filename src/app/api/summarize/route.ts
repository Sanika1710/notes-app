// FILE: app/api/summarize/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

interface RequestBody {
  text: string;
}

export async function POST(request: Request) {
  try {
    const { text }: RequestBody = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input. Text is required.' },
        { status: 400 }
      );
    }
    
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    

    if ('error' in response.data) {
      return NextResponse.json({ error: response.data.error }, { status: 503 });
    }

    const summary = response.data[0]?.summary_text || 'No summary generated';

    return NextResponse.json({ summary });
  } catch (error) {
    console.log('API KEY:', process.env.HUGGINGFACE_API_KEY);
    console.error('Summarization error:', error);
    return NextResponse.json(
      { error: 'Failed to summarize text' },
      { status: 500 }
    );
  }
}
