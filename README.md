# BookManager

Website thư viện chạy cục bộ bằng React, Express và MongoDB.

## Chạy demo trên Windows

Mở PowerShell ở thư mục dự án. Khởi động dịch vụ MongoDB và kiểm tra tệp .env ở thư mục gốc có MONGODB_URI=mongodb://127.0.0.1:27017/book_manager.

```powershell
npm.cmd install
npm.cmd run seed
npm.cmd run build
npm.cmd start
```

Mở http://127.0.0.1:3000. Chạy seed lần nữa giữ nguyên số lượng tồn và giá đã chỉnh.

| Vai trò | Tên đăng nhập | Mật khẩu demo |
| --- | --- | --- |
| Bạn đọc | bandoc | DemoUser123 |
| Thủ thư | thuthu | DemoAdmin123 |

## Thử các luồng chính

- Khách mở một cuốn sách và chọn đăng nhập hoặc đăng ký. Sau khi đăng nhập, ứng dụng quay lại cuốn sách đó.
- Đăng nhập với tài khoản bạn đọc. Chọn sách giá 5.000 đ/ngày, chọn ngày trả cách hôm nay 3 ngày và gửi yêu cầu. Tổng phí là 15.000 đ.
- Đăng nhập với tài khoản thủ thư, mở Quản trị → Mượn và trả sách. Xác nhận giao rồi xác nhận trả. So sánh tồn kho trước và sau mỗi lần thao tác.
- Với tài khoản bạn đọc, gửi đề xuất bán sách hoặc tạo bài diễn đàn. Dùng tài khoản thủ thư duyệt thu mua hoặc duyệt bài tương ứng. Đề xuất cùng tên, tác giả và số tập sẽ tăng tồn kho của đầu sách hiện có.
- Dùng hai cửa sổ trình duyệt riêng hoặc một cửa sổ ẩn danh để dễ chuyển giữa hai vai trò.

## Chỉnh mã và giao diện

- client/src/pages chứa các màn hình. client/src/components chứa phần giao diện dùng chung.
- client/src/styles.css chứa CSS. Đổi các biến trong :root để cập nhật bảng màu.
- server/routes khai báo API, server/controllers xử lý nghiệp vụ, server/models định nghĩa dữ liệu MongoDB.
- server/uploads chứa ảnh tải lên từ máy. MongoDB lưu đường dẫn ảnh.
- Sau khi chỉnh React hoặc CSS, chạy lại npm.cmd run build và tải lại trang. Để xem thay đổi ngay khi lưu, chạy npm.cmd run dev:server và npm.cmd run dev:client ở hai terminal rồi mở địa chỉ Vite in ra.

## Email thông báo đăng ký

Điền SMTP_HOST, SMTP_PORT, SMTP_USER và SMTP_PASS trong .env theo cấu hình của trường, sau đó khởi động lại backend. Cổng 465 dùng TLS trực tiếp, cổng 587 dùng STARTTLS. SMTP_PASS được chừa trống để bạn điền trên máy.

Tài khoản được lưu trước khi gửi thư. Khi SMTP chưa cấu hình hoặc gửi lỗi, bạn đọc vẫn có thể đăng nhập.
