import os
import json
import logging
import google.generativeai as genai

logger = logging.getLogger("GeminiService")

class GeminiService:
    def __init__(self, api_key: str):
        if not api_key or api_key == "YOUR_GEMINI_API_KEY_HERE":
            logger.warning("GEMINI_API_KEY chưa được cấu hình!")
            self.model = None
            return
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-1.5-flash")
        logger.info("GeminiService đã khởi tạo thành công.")

    def _call(self, prompt: str) -> str:
        """Gọi Gemini API và trả về text response."""
        if not self.model:
            raise RuntimeError("Gemini API key chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY vào file .env")
        response = self.model.generate_content(prompt)
        return response.text.strip()

    def analyze_comments(self, comments: list) -> list:
        """
        Phân tích list comment, trả về mảng kết quả với:
        - priority (1-5): 5 = khẩn cấp nhất (hỏi giá, muốn mua)
        - sentiment: positive / neutral / negative
        - category: inquiry/complaint/compliment/spam/other
        - summary: tóm tắt ngắn gọn
        """
        if not comments:
            return []

        comments_text = "\n".join(
            [f"[{i}] ID={c.get('id','?')} | {c.get('from', {}).get('name', 'Ẩn danh')}: {c.get('message', '')}"
             for i, c in enumerate(comments)]
        )

        prompt = f"""Bạn là chuyên gia phân tích comment Facebook cho shop bán hàng online.
Hãy phân tích các comment sau và trả về JSON array (KHÔNG markdown, chỉ JSON thuần).

Mỗi phần tử array gồm:
- "index": số thứ tự comment (bắt đầu từ 0)
- "priority": số từ 1-5 (5 = rất ưu tiên: hỏi giá, muốn đặt hàng, quan tâm mua; 1 = spam/không liên quan)
- "sentiment": "positive" | "neutral" | "negative"  
- "category": "inquiry" (hỏi hàng/giá) | "complaint" (phàn nàn) | "compliment" (khen) | "spam" | "other"
- "summary": tóm tắt 1 câu ngắn bằng tiếng Việt

Ưu tiên cao nhất (priority=5) cho: hỏi giá, hỏi size/màu, muốn đặt hàng, hỏi ship.
Ưu tiên 4: quan tâm sản phẩm, tag bạn bè.
Ưu tiên 3: comment tích cực bình thường.
Ưu tiên 2: tương tác không liên quan hàng.
Ưu tiên 1: spam, comment tiêu cực nặng, bot.

Danh sách comment:
{comments_text}

Trả về JSON array:"""

        try:
            raw = self._call(prompt)
            # Làm sạch output nếu có markdown code block
            raw = raw.replace("```json", "").replace("```", "").strip()
            result = json.loads(raw)
            logger.info(f"Phân tích xong {len(result)} comment")
            return result
        except Exception as e:
            logger.error(f"Lỗi phân tích comments: {e}")
            # Fallback: trả về priority mặc định
            return [{"index": i, "priority": 3, "sentiment": "neutral", 
                     "category": "other", "summary": "Không phân tích được"} 
                    for i in range(len(comments))]

    def suggest_reply(self, comment_text: str, post_context: str = "", tone: str = "friendly") -> list:
        """
        Gợi ý 3 câu trả lời cho 1 comment.
        - tone: 'friendly' (thân thiện) | 'professional' (chuyên nghiệp) | 'urgent' (tạo urgency)
        """
        tone_guide = {
            "friendly": "thân thiện, dùng emoji phù hợp, gần gũi như người bán hàng nhiệt tình",
            "professional": "lịch sự, chuyên nghiệp, không dùng emoji nhiều",
            "urgent": "tạo cảm giác khan hiếm và urgency để thúc đẩy mua hàng"
        }
        tone_desc = tone_guide.get(tone, tone_guide["friendly"])

        prompt = f"""Bạn là nhân viên CSKH của một shop bán hàng trên Facebook. 
Phong cách trả lời: {tone_desc}.

Ngữ cảnh bài đăng: {post_context or 'Bài đăng về sản phẩm của shop'}

Comment của khách: "{comment_text}"

Hãy tạo ra đúng 3 câu trả lời KHÁC NHAU (ngắn gọn, tự nhiên, không quá 3 dòng mỗi câu).
Mục tiêu: giữ chân khách hàng, khuyến khích inbox để tư vấn chi tiết hoặc đặt hàng.

Trả về JSON với format sau (KHÔNG markdown, chỉ JSON):
{{"suggestions": ["câu reply 1", "câu reply 2", "câu reply 3"]}}"""

        try:
            raw = self._call(prompt)
            raw = raw.replace("```json", "").replace("```", "").strip()
            result = json.loads(raw)
            suggestions = result.get("suggestions", [])
            logger.info(f"Đã tạo {len(suggestions)} gợi ý reply")
            return suggestions
        except Exception as e:
            logger.error(f"Lỗi suggest_reply: {e}")
            return [
                "Cảm ơn bạn đã quan tâm! Shop sẽ inbox tư vấn chi tiết cho bạn ngay nhé 😊",
                "Bạn vui lòng nhắn tin inbox để shop hỗ trợ nhanh hơn nhé!",
                "Cảm ơn bạn! Shop đang chuẩn bị thông tin, bạn cho shop xin ít phút nhé ❤️"
            ]
