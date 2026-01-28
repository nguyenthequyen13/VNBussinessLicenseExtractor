# Vietnamese Business License Extractor - Chrome Extension

Extension này giúp trích xuất thông tin tự động từ ảnh hoặc file PDF Giấy chứng nhận đăng ký doanh nghiệp Việt Nam bằng cách sử dụng Google Gemini AI (Model Flash 2.5/3.0).

## 🚀 Tính năng

*   **Trích xuất thông minh**: Tự động đọc Tên DN, MST, Địa chỉ, Vốn, Người đại diện, Danh sách thành viên... từ ảnh/PDF.
*   **Auto-fill Đa Năng**: Tự động điền dữ liệu vào **bất kỳ website nào** (CRM, phần mềm kế toán, form đăng ký...) dựa trên tên trường (Label).
*   **Quản lý API Key**: Nhập và lưu Google API Key trực tiếp trên giao diện (không cần hard-code).
*   **Lịch sử**: Lưu lại lịch sử các lần trích xuất gần đây.
*   **Giao diện**: Popup hiện đại, dễ sử dụng tích hợp ngay trên trình duyệt.

## 🛠 Yêu cầu hệ thống

*   **Node.js**: Phiên bản 18 trở lên (để build).
*   **Google Gemini API Key**: Lấy miễn phí tại [Google AI Studio](https://aistudio.google.com/).

## ⚙️ Hướng dẫn Build & Cài đặt

Vì trình duyệt Chrome không thể chạy trực tiếp file `.tsx`, bạn cần sử dụng **Vite** để đóng gói dự án.

### Bước 1: Khởi tạo dự án

Mở Terminal và chạy các lệnh sau:

```bash
# Tạo project mới
npm create vite@latest business-license-extractor -- --template react-ts

# Di chuyển vào thư mục project
cd business-license-extractor

# Cài đặt các thư viện cần thiết
npm install @google/genai tailwindcss postcss autoprefixer
```

### Bước 2: Sao chép mã nguồn

Copy toàn bộ mã nguồn bạn đã tạo vào thư mục dự án tương ứng:

1.  `src/` : Chứa các file `App.tsx`, `main.tsx` (đổi tên từ `index.tsx`), `types.ts`, `components/`, `services/`.
2.  `public/manifest.json` : File cấu hình Extension.
3.  `content.js` : File script chạy ngầm (được inject động khi điền form).
4.  Các file cấu hình ở gốc: `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`.

### Bước 3: Build Project

Chạy lệnh sau để đóng gói ứng dụng:

```bash
npm run build
```

Sau khi chạy xong, thư mục **`dist`** sẽ được tạo ra. Đây chính là bản Extension hoàn chỉnh.

### Bước 4: Cài đặt lên Chrome

1.  Mở Chrome, nhập địa chỉ: `chrome://extensions/`
2.  Bật **Developer mode** (Góc phải trên cùng).
3.  Nhấn **Load unpacked**.
4.  Chọn thư mục **`dist`** vừa tạo ở Bước 3.

---

## 📖 Hướng dẫn sử dụng

1.  **Cấu hình lần đầu**:
    *   Mở Extension.
    *   Nhấn vào biểu tượng **Cài đặt (Bánh răng)** hoặc làm theo hướng dẫn trên màn hình.
    *   Nhập **Google API Key** của bạn và nhấn Lưu.

2.  **Trích xuất**:
    *   Nhấn "Tải lên giấy phép" hoặc kéo thả file ảnh/PDF vào vùng chọn.
    *   Chờ AI xử lý (vài giây).

3.  **Điền vào Phần mềm/Web App**:
    *   Mở tab trình duyệt chứa form nhập liệu (ví dụ: CRM, phần mềm kế toán, Google Form...).
    *   Trên Extension, chuyển sang tab **Auto Fill**.
    *   Nhấn nút **"Điền ngay"**. Extension sẽ tự động tìm các ô nhập liệu có nhãn trùng khớp và điền dữ liệu.

---

## 🔒 Chính sách bảo mật & Dữ liệu

*   **API Key**: Key của bạn được lưu trữ an toàn trong `localStorage` của trình duyệt người dùng. Nó **không** bao giờ được gửi đi đâu ngoại trừ đến máy chủ Google để thực hiện trích xuất.
*   **Dữ liệu file**: File bạn upload được gửi trực tiếp từ trình duyệt đến Google Gemini API để xử lý. Chúng tôi không có server trung gian lưu trữ file của bạn.
*   **Quyền riêng tư**: Extension chỉ tương tác với trang web đích khi bạn bấm nút "Điền ngay" (thông qua quyền `activeTab`). Không chạy ngầm thu thập dữ liệu.

## 🤝 Đóng góp

Mọi ý kiến đóng góp xin vui lòng tạo Pull Request hoặc Issue trên GitHub.