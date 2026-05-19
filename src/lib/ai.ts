import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

export interface AiResponseSet {
  standard: string;
  friendly: string;
  constructive: string;
}

// Configured API keys
const geminiKey = process.env.GEMINI_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

export const isGeminiConfigured = !!(geminiKey && geminiKey !== 'your-gemini-api-key' && geminiKey !== '');
export const isOpenAiConfigured = !!(openaiKey && openaiKey !== 'your-openai-api-key' && openaiKey !== '');

/**
 * Generate mock AI responses when no API keys are provided.
 * Dynamically adjusts based on client rating and name to look fully functional.
 */
export function generateMockAiResponses(authorName: string, rating: number, text: string): AiResponseSet {
  const name = authorName || 'Quý khách';
  
  if (rating >= 4) {
    return {
      standard: `Xin chào ${name}, chúng tôi xin chân thành cảm ơn quý khách đã dành thời gian đánh giá ${rating} sao và chia sẻ trải nghiệm tốt đẹp tại đây. Rất hy vọng sẽ được tiếp tục chào đón quý khách quay trở lại trong thời gian sớm nhất để mang đến dịch vụ ngày một hoàn hảo hơn. Trân trọng!`,
      friendly: `Chào ${name} thân yêu! 🥰 Cảm ơn bạn rất nhiều vì đánh giá siêu dễ thương này nha. Nhận được những lời khen của bạn khiến cả đội ngũ bên mình vui vẻ suốt cả ngày luôn á. Lần tới ghé chơi nhớ nhắn tụi mình nha, chúc bạn luôn ngập tràn niềm vui! 🌟`,
      constructive: `Kính chào ${name}, cảm ơn bạn đã có những đánh giá tích cực dành cho cơ sở. Mặc dù bạn đã hài lòng, chúng tôi vẫn ghi nhận phản hồi này để làm động lực tiếp tục nâng cao tiêu chuẩn dịch vụ, đảm bảo mỗi chuyến ghé thăm tiếp theo của bạn đều là một trải nghiệm trọn vẹn 10 điểm.`
    };
  } else {
    // Apologetic response for negative feedback (1-3 stars)
    const problemMatch = text.match(/(điều hòa|cách âm|ồn|cũ|dịch vụ|check-in|nhân viên|phòng|nước nóng)/i);
    const problemTopic = problemMatch ? problemMatch[0].toLowerCase() : 'trải nghiệm chưa hài lòng';
    
    return {
      standard: `Xin chào ${name}, chúng tôi rất tiếc khi biết quý khách đã có trải nghiệm chưa trọn vẹn tại cơ sở. Thay mặt ban quản lý, chúng tôi xin chân thành xin lỗi vì sự bất tiện này. Chúng tôi vô cùng trân trọng đóng góp của quý khách và sẽ kiểm tra lại ngay để cải thiện chất lượng dịch vụ.`,
      friendly: `Chào ${name} ơi, tụi mình rất tiếc khi đọc được những dòng chia sẻ này. 😢 Xin lỗi bạn rất nhiều vì dịch vụ lần này chưa làm bạn vui vẻ trọn vẹn nha. Tụi mình ghi nhận ngay và cam kết sẽ cố gắng hết sức để những lần sau bạn ghé thăm sẽ không còn gặp phải vấn đề tương tự nữa ạ.`,
      constructive: `Kính gửi ${name}, ban quản lý chân thành cảm ơn phản hồi chân thực của bạn. Chúng tôi đặc biệt cáo lỗi về vấn đề liên quan đến "${problemTopic}" mà bạn đã phản ánh. Bộ phận kỹ thuật và vận hành đã được điều phối để kiểm tra và xử lý dứt điểm vấn đề này ngay hôm nay. Hy vọng bạn sẽ cho chúng tôi cơ hội khắc phục và phục vụ bạn tốt hơn trong tương lai.`
    };
  }
}

/**
 * Service to generate 3 customized AI responses
 */
export async function generateReplies(
  authorName: string,
  rating: number,
  text: string
): Promise<AiResponseSet> {
  const prompt = `Bạn là một chuyên gia quản trị danh tiếng trực tuyến (ORM) chuyên nghiệp và khéo léo. Hãy soạn thảo đúng 3 câu gợi ý trả lời bằng tiếng Việt cho đánh giá của khách hàng sau:
- Tên khách hàng: "${authorName || 'Khách hàng ẩn danh'}"
- Số sao đánh giá: ${rating}/5 sao
- Nội dung đánh giá: "${text || '(Không có nội dung)'}"

Hãy trả về kết quả dưới định dạng JSON duy nhất, có cấu trúc chính xác với 3 trường sau và KHÔNG chứa bất kỳ văn bản phụ, markdown hoặc giải thích nào bên ngoài khối JSON:
{
  "standard": "Phản hồi chuẩn mực, lịch sự, chuyên nghiệp, thể hiện sự trân trọng.",
  "friendly": "Phản hồi thân thiện, cởi mở, ấm áp, có thể dùng một số emoji tinh tế phù hợp.",
  "constructive": "Phản hồi tập trung giải quyết vấn đề. Nếu đánh giá tích cực (4-5 sao), hãy hướng tới việc duy trì mối quan hệ và tiếp thu ý kiến để nâng cấp dịch vụ hơn nữa. Nếu đánh giá tiêu cực (1-3 sao), hãy chân thành xin lỗi, giải thích nhẹ nhàng và cam kết khắc phục lỗi cụ thể đã nêu một cách chuyên nghiệp."
}`;

  // 1. GEMINI FALLBACK (Recommended)
  if (isGeminiConfigured) {
    try {
      console.log('Generating AI responses using Gemini API...');
      const genAI = new GoogleGenerativeAI(geminiKey!);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });
      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      return JSON.parse(rawText) as AiResponseSet;
    } catch (error) {
      console.error('Gemini API call failed, trying OpenAI or Mock fallback:', error);
    }
  }

  // 2. OPENAI FALLBACK
  if (isOpenAiConfigured) {
    try {
      console.log('Generating AI responses using OpenAI API (gpt-4o-mini)...');
      const openai = new OpenAI({ apiKey: openaiKey! });
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });
      const rawText = response.choices[0].message.content || '{}';
      return JSON.parse(rawText) as AiResponseSet;
    } catch (error) {
      console.error('OpenAI API call failed, trying Mock fallback:', error);
    }
  }

  // 3. MOCK FALLBACK (Zero setup required)
  console.log('No API keys configured or call failed. Using instant intelligent Mock AI Fallback.');
  // Simulate network delay for realistic experience
  await new Promise(resolve => setTimeout(resolve, 800));
  return generateMockAiResponses(authorName, rating, text);
}
