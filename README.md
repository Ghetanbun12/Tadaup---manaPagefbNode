# Facebook Fanpage Manager (Full-stack Demo)

Dự án mẫu này minh họa quy trình quản lý Fanpage qua Facebook Graph API.

## Cấu trúc thư mục
- `backend/`: Node.js Express server xử lý Token Exchange và API calls.
- `frontend/`: React (Vite) xử lý Login OAuth 2.0.

## Hướng dẫn Setup

### 1. Facebook App Setup
1. Truy cập [Meta for Developers](https://developers.facebook.com/).
2. Tạo App mới (Loại: Business hoặc Other -> Consumer).
3. Thêm sản phẩm **Facebook Login for Business**.
4. Thiết lập **Valid OAuth Redirect URIs**: `http://localhost:5173/`.
5. Lấy **App ID** và **App Secret** từ mục Settings -> Basic.

### 2. Backend Setup
1. `cd backend`
2. `npm install`
3. Copy `.env.example` thành `.env` và điền `FB_APP_ID`, `FB_APP_SECRET`.
4. `npm start` (Chạy tại port 5000).

### 3. Frontend Setup
1. `cd frontend`
2. `npm install`
3. Mở `index.html` và thay thế `YOUR_APP_ID_VITE_REPLACE` bằng App ID của bạn.
4. `npm run dev` (Chạy tại port 5173).

## Cách sử dụng
1. Mở trình duyệt vào `http://localhost:5173`.
2. Nhấn **Login with Facebook**.
3. Cấp quyền truy cập cho App (quan trọng: chọn Fanpage bạn muốn quản lý).
4. Sau khi login thành công, bạn có thể:
   - Đăng bài mới lên Page.
   - Xem danh sách bài viết và comment.
   - Xem Insights (Impressions) của Page.

## Lưu ý bảo mật
- Token dài hạn (Long-lived Token) được lưu trữ và xử lý hoàn toàn tại Back-end.
- Front-end chỉ nhận được tên Fanpage và kết quả từ server của mình, không trực tiếp giữ Token dài hạn.
