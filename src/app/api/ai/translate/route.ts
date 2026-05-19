import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const geminiKey = process.env.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!geminiKey || geminiKey === 'your-gemini-api-key') {
      // Mock fallback if no API key
      await new Promise(resolve => setTimeout(resolve, 800));
      return NextResponse.json({ 
        success: true, 
        translation: `(Bản dịch Demo) Khách hàng nói: "${text}"`
      });
    }

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `Dịch đoạn văn bản đánh giá khách sạn/nhà hàng sau sang Tiếng Việt một cách tự nhiên nhất. Nếu nó đã là Tiếng Việt, hãy giữ nguyên và chỉ sửa các lỗi chính tả nếu có. 
    Đánh giá: "${text}"
    Chỉ trả về trực tiếp nội dung đã dịch, không giải thích gì thêm.`;
    
    const result = await model.generateContent(prompt);
    const translation = result.response.text().trim();

    return NextResponse.json({ success: true, translation });
  } catch (error: any) {
    console.error('Translate API error:', error);
    return NextResponse.json({ error: error.message || 'Translation failed' }, { status: 500 });
  }
}
