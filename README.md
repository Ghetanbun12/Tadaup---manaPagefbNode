# 🚀 Facebook Fanpage Manager & AI Assistant

Hệ thống quản lý Fanpage tập trung tích hợp **Trí tuệ nhân tạo (Google Gemini AI)** giúp tối ưu hóa quy trình chăm sóc khách hàng, quản lý bài viết và hội thoại Messenger chuyên nghiệp.

---

## 🏗️ Kiến trúc Hệ thống

Dự án được xây dựng theo mô hình Full-stack hiện đại:
- **Frontend**: React.js (Vite) + Vanilla CSS (UI/UX cao cấp).
- **Backend**: Python (Flask) + SQLAlchemy (ORM).
- **AI Engine**: Google Gemini 1.5 Flash API.
- **Database**: SQLite (phát triển) hoặc MySQL (triển khai).

---

## ✨ Các Tính năng Nổi bật

### 1. Quản lý Fanpage & Bảng tin
- **Dashboard tập trung**: Xem danh sách bài viết (Feed), lượt tương tác (Like/Comment).
- **Đăng bài đa phương tiện**: Hỗ trợ đăng vản bản và hình ảnh trực tiếp qua API.
- **Quản lý bình luận thông minh**: Phân cấp bình luận (Threaded replies), Ẩn/Hiện bình luận xấu, Trả lời nhanh khách hàng.

### 2. Messenger Chat Hub (Giao diện chuẩn Meta)
- **Real-time Chat**: Giao tiếp trực tiếp với khách qua Messenger.
- **UI Fallback**: Tự động tạo Avatar nghệ thuật khi API Facebook không trả về ảnh profile khách.
- **Auto-scroll**: Trải nghiệm nhắn tin mượt mà với cơ chế tự động cuộn đến tin nhắn mới nhất.

### 3. CRM Mini - Gắn thẻ Khách hàng
- **Hệ thống nhãn (Tags)**: Phân loại khách hàng ngay trong khung chat (Ví dụ: "VIP", "Tiềm năng", "Chốt đơn").
- **Lưu trữ hiệu quả**: Dữ liệu Tag được đồng bộ với Database riêng, không bị phụ thuộc hoàn toàn vào Facebook.

### 4. Google Gemini AI Assistant (Trí tuệ nhân tạo)
- **AI Priority Sorting**: Tự động đọc và phân loại bình luận theo độ ưu tiên (1-5). Gắn nhãn "KẾT ĐƠN KHẨN" cho các bình luận hỏi giá/mua hàng.
- **Phân tích Cảm xúc**: Nhận diện thái độ khách hàng (Tích cực, Tiêu cực, Bình thường).
- **AI Smart Reply**: Tự động đề xuất 3 mẫu câu trả lời chuẩn kịch bản Sale dựa trên ngữ cảnh và văn phong tùy chỉnh (Chuyên nghiệp/Thân thiện).

---

## 🛠️ Hướng dẫn Cài đặt & Chạy ứng dụng
### 1. Thiết lập Facebook App (Meta for Developers)

**Bước 1: Tạo App ID**
- Truy cập [Meta for Developers](https://developers.facebook.com/) và đăng nhập.
- Nhấn **My Apps (Ứng dụng của tôi)** -> **Create App (Tạo ứng dụng)**.
- Chọn loại ứng dụng: **Other** -> **Next** -> **Business** (Loại này cho phép truy cập đầy đủ các API về Page).
- Điền thông tin:
  - **App Name**: Tên bất kỳ (ví dụ: `MyPageManager`).
  - **App Contact Email**: Email liên hệ của bạn.

**Bước 2: Thiết lập Facebook Login**
- Tại cột bên trái, nhấn **Add Product** -> Tìm **Facebook Login for Business** -> Nhấn **Set up**.
- Chọn **Settings** dưới mục Facebook Login:
  - **Valid OAuth Redirect URIs**: Nhập `http://localhost:5173/` (Địa chỉ mặc định của Vite React).
- Nhấn **Save Changes**.

**Bước 3: Cấu hình App Secret**
- Vào mục **App Settings** -> **Basic**.
- Copy **App ID** và **App Secret** vào file `.env` ở cả Backend và Frontend:
  - `FB_APP_ID`
  - `FB_APP_SECRET`

**Bước 4: Quyền truy cập (Permissions)**
Vào mục **App Review** -> **Permissions and Features**. Đảm bảo các quyền sau đã ở trạng thái **Advanced Access**:
- `pages_read_engagement`
- `pages_manage_posts`
- `pages_messaging`
- `pages_show_list`
- `business_management` (nếu có)

**Bước 5: Graph API Explorer (Tùy chọn)**
- Sử dụng [Graph API Explorer](https://developers.facebook.com/tools/explorer/) để test nhanh.
- Chọn App, chọn **Get Page Access Token**, tích các quyền và nhấn **Generate**.

### 2. Cài đặt Backend (Flask)
```bash
cd python_backend
# Tạo môi trường ảo
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Cài đặt thư viện
pip install -r requirements.txt

# Cấu hình .env
cp .env.example .env 
# Điền các giá trị: FB_APP_ID, FB_APP_SECRET, GEMINI_API_KEY, JWT_SECRET_KEY

# Chạy server
python run.py
```

### 3. Cài đặt Frontend (React)
```bash
cd frontend
npm install

# Cấu hình .env
# VITE_FB_APP_ID=your_id

# Chạy ứng dụng
npm run dev
```


---

## 🛡️ Bảo mật
- **JWT (JSON Web Token)**: Mọi giao tiếp giữa Frontend và Backend đều được bảo mật qua token mã hóa.
- **Proxy Token**: Token dài hạn của Facebook (Long-lived Token) chỉ được lưu tại Backend, tuyệt đối không lộ ra trình duyệt người dùng.

## 📦 Cấu trúc Thư mục
```text
├── frontend/             # Giao diện React (Vite)
│   └── src/components/   # Component UI (Inbox, Feed, AI Modal...)
├── python_backend/       # Server Flask
│   ├── app/
│   │   ├── services/     # Xử lý logic FB, AI, CRM
│   │   └── middleware/   # API Routes & Security
│   └── run.py            # File chạy chính
└── README.md             # Hướng dẫn này
```

---

*Phát triển bởi Đội ngũ kỹ thuật F2F Arena.* 
