# Vietnamese Business License Extractor - Chrome Extension

Extension này giúp trích xuất thông tin tự động từ ảnh hoặc file PDF Giấy chứng nhận đăng ký doanh nghiệp Việt Nam bằng cách sử dụng Google Gemini AI (Model Flash 2.5/3.0).

## 🚀 Tính năng

*   Upload file ảnh (JPG, PNG) hoặc PDF.
*   Trích xuất tự động các trường: Tên DN, Mã số thuế, Địa chỉ, Vốn, Người đại diện, Danh sách thành viên...
*   Hiển thị kết quả dạng Form (dễ đọc) và JSON (dễ sao chép).
*   Giao diện Popup nhỏ gọn tích hợp ngay trên trình duyệt.

## 🛠 Yêu cầu hệ thống

*   **Node.js**: Phiên bản 18 trở lên.
*   **Google Gemini API Key**: Lấy miễn phí tại [Google AI Studio](https://aistudio.google.com/).

## ⚙️ Thiết lập dự án (Build Project)

Vì trình duyệt Chrome không thể chạy trực tiếp file `.tsx`, bạn cần sử dụng một công cụ đóng gói (Bundler). Chúng ta sẽ dùng **Vite**.

### Bước 1: Khởi tạo dự án

Mở Terminal và chạy các lệnh sau để tạo khung dự án Vite:

```bash
# Tạo project mới
npm create vite@latest business-license-extractor -- --template react-ts

# Di chuyển vào thư mục project
cd business-license-extractor

# Cài đặt các thư viện cần thiết
npm install @google/genai tailwindcss postcss autoprefixer
```

### Bước 2: Sao chép mã nguồn

Copy nội dung các file bạn đã có vào các vị trí tương ứng trong thư mục `src`:

1.  `App.tsx` -> `src/App.tsx`
2.  `index.tsx` -> đổi tên thành `src/main.tsx` (Vite dùng main.tsx mặc định)
3.  `types.ts` -> `src/types.ts`
4.  Tạo thư mục `src/components` và copy `FileUpload.tsx`, `ResultDisplay.tsx` vào đó.
5.  Tạo thư mục `src/services` và copy `geminiService.ts` vào đó.
6.  Copy `manifest.json` vào thư mục **`public/manifest.json`**.
7.  Copy `metadata.json` vào thư mục gốc (nếu cần lưu trữ).

### Bước 3: Cấu hình API Key và Vite

Do code sử dụng `process.env.API_KEY`, ta cần cấu hình để Vite hiểu biến này.

1.  Tạo file `.env` ở thư mục gốc (ngang hàng `package.json`):
    ```env
    VITE_GEMINI_API_KEY=AIzaSy... (Điền API Key của bạn vào đây)
    ```

2.  Sửa file `vite.config.ts`:

    ```typescript
    import { defineConfig, loadEnv } from 'vite'
    import react from '@vitejs/plugin-react'

    export default defineConfig(({ mode }) => {
      const env = loadEnv(mode, process.cwd(), '');
      return {
        plugins: [react()],
        define: {
          'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        },
        build: {
          outDir: 'dist',
          rollupOptions: {
            input: {
              main: 'index.html', // Vite sẽ dùng index.html ở gốc làm entry
            },
          },
        },
      }
    })
    ```

3.  Cập nhật file `index.html` (ở thư mục gốc):
    Bạn cần sửa lại đường dẫn script trong `index.html` để trỏ tới `src/main.tsx`:

    ```html
    <!-- Tìm dòng này và sửa lại -->
    <!-- Xóa phần importmap nếu dùng Vite build -->
    <body>
      <div id="root" class="h-full"></div>
      <script type="module" src="/src/main.tsx"></script>
    </body>
    ```

### Bước 4: Build Project

Chạy lệnh sau để đóng gói ứng dụng:

```bash
npm run build
```

Sau khi chạy xong, bạn sẽ thấy một thư mục **`dist`** được tạo ra. Đây chính là thư mục chứa Extension đã sẵn sàng để cài đặt.

---

## 📥 Cài đặt lên Chrome

1.  Mở trình duyệt Google Chrome (hoặc Edge, Brave).
2.  Nhập vào thanh địa chỉ: `chrome://extensions/`
3.  Bật chế độ **Developer mode** (Chế độ dành cho nhà phát triển) ở góc trên bên phải.
4.  Nhấn vào nút **Load unpacked** (Tải tiện ích đã giải nén).
5.  Chọn thư mục **`dist`** vừa được tạo ra ở Bước 4.

Extension sẽ xuất hiện trên thanh công cụ của trình duyệt.

## 📝 Lưu ý quan trọng

*   **Về Tailwind CSS**: Trong code mẫu `index.html` sử dụng CDN. Tuy nhiên, Chrome Extension thường chặn CDN vì lý do bảo mật (CSP).
    *   *Cách tốt nhất:* Cài Tailwind local (đã hướng dẫn ở lệnh `npm install`). Tạo file `src/index.css` và import các directive của Tailwind:
        ```css
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
        ```
    *   Import css này vào `src/main.tsx`: `import './index.css'`.
    *   Xóa thẻ `<script src="https://cdn.tailwindcss.com"></script>` trong `index.html`.

*   **Về API Key**: Key được build cứng vào trong code JS khi chạy lệnh build. Nếu bạn public code này lên Github, hãy cẩn thận đừng commit file `.env`.

## 🤝 Đóng góp

Mọi ý kiến đóng góp xin vui lòng tạo Pull Request hoặc Issue.
