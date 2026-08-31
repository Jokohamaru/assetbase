# AssetBase - Lộ trình Test Cases Toàn diện

> Phiên bản: 1.0 | Ngày tạo: 2026-08-31

---

## Phần A: Hạ tầng & Xác thực (Infrastructure & Auth)

### A1. Health Check
| # | Mô tả | Phương thức | Kết quả mong đợi |
|---|-------|-------------|------------------|
| A1.1 | GET `/api/health` | API | 200, `status: ok` |

### A2. Đăng nhập (Login)
| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| A2.1 | Đăng nhập đúng username/password | API + UI | 200, trả về token JWT, redirect `/dashboard` |
| A2.2 | Đăng nhập sai password | API + UI | 401, hiển thị thông báo lỗi |
| A2.3 | Đăng nhập username không tồn tại | API + UI | 401 |
| A2.4 | Đăng nhập với trường rỗng | UI | Validation chặn submit |
| A2.5 | Token hết hạn, gọi API protected | API | 401 Unauthorized |

### A3. Đổi mật khẩu
| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| A3.1 | PUT `/auth/password` đúng old/new | API | 200 |
| A3.2 | Sai mật khẩu cũ | API | 400/401 |

### A4. Phân quyền (Authorization)
| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| A4.1 | User (role=USER) gọi API admin | API | 403 Forbidden |
| A4.2 | Admin gọi API admin | API | 200 |
| A4.3 | Request không có token | API | 401 |

---

## Phần B: Danh mục (Master Data) - Chỉ Admin

### B1. Phòng ban (Departments)
| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| B1.1 | GET danh sách phòng ban | API + UI | 200, danh sách hiển thị |
| B1.2 | POST tạo phòng ban mới | API + UI | 201, xuất hiện trong danh sách |
| B1.3 | Tạo phòng ban trùng code | API | 400/409 |

### B2. Vị trí (Locations)
| # | Mô tả | Kết quả mong đợi |
|---|-------|------------------|
| B2.1 | GET danh sách vị trí | 200 |
| B2.2 | POST tạo vị trí mới | 201 |

### B3. Danh mục tài sản (Categories)
| # | Mô tả | Kết quả mong đợi |
|---|-------|------------------|
| B3.1 | GET danh sách danh mục | 200 |
| B3.2 | POST tạo danh mục mới | 201 |

### B4. Hãng sản xuất (Manufacturers) & Model
| # | Mô tả | Kết quả mong đợi |
|---|-------|------------------|
| B4.1 | GET/POST manufacturers | 200/201 |
| B4.2 | GET/POST models | 200/201 |

### B5. Kho (Warehouses)
| # | Mô tả | Kết quả mong đợi |
|---|-------|------------------|
| B5.1 | GET/POST warehouses | 200/201 |

### B6. Quản lý User (Admin)
| # | Mô tả | Kết quả mong đợi |
|---|-------|------------------|
| B6.1 | GET danh sách users | 200 |
| B6.2 | POST tạo user mới | 201 |
| B6.3 | PUT cập nhật trạng thái user | 200 |
| B6.4 | Tạo user trùng username | 400/409 |

---

## Phần C: Quản lý Tài sản (Assets)

### C1. CRUD Tài sản
| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| C1.1 | GET `/assets` - danh sách | API + UI | 200, bảng tài sản hiển thị |
| C1.2 | POST tạo tài sản mới (đủ field) | API | 201, asset có mã tự sinh |
| C1.3 | POST tạo tài sản thiếu field bắt buộc | API | 400 validation error |
| C1.4 | GET `/assets/:id` - chi tiết | API + UI | 200, thông tin đầy đủ |
| C1.5 | GET tài sản không tồn tại | API | 404 |

### C2. Vòng đời tài sản (Lifecycle)
| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| C2.1 | POST `/assets/:id/assign` - Cấp phát | API | 200, status → ASSIGNED |
| C2.2 | POST `/assets/:id/return` - Thu hồi | API | 200, status → AVAILABLE |
| C2.3 | POST `/assets/:id/transfer` - Điều chuyển | API | 200, thay đổi holder |
| C2.4 | Cấp phát tài sản đã cấp phát | API | 400 |
| C2.5 | Thu hồi tài sản chưa cấp phát | API | 400 |

### C3. UI Sổ tài sản
| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| C3.1 | Mở trang `/assets` | UI | Bảng hiển thị, có cột status |
| C3.2 | Lọc theo trạng thái | UI | Bảng cập nhật theo filter |
| C3.3 | Click vào 1 dòng tài sản | UI | Mở chi tiết/modal |

---

## Phần D: Barcode / QR Scanner

### D1. Quét mã
| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| D1.1 | Mở trang `/scanner` | UI | Camera/input hiển thị |
| D1.2 | Quét mã barcode hợp lệ | UI | Tìm thấy tài sản, hiển thị thông tin |
| D1.3 | Quét mã không tồn tại | UI | Thông báo "Không tìm thấy" |

---

## Phần E: Kiểm kê (Inventory)

### E1. Phiên kiểm kê
| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| E1.1 | GET `/inventories` - danh sách | API + UI | 200 |
| E1.2 | POST tạo phiên kiểm kê | API | 201, status = OPEN |
| E1.3 | GET `/inventories/:id` - chi tiết | API + UI | 200, hiển thị tiến độ |
| E1.4 | POST `/inventories/:id/scan` - quét item | API | 200, cập nhật scanned count |
| E1.5 | PUT `/inventories/:id/close` - đóng phiên | API | 200, status = CLOSED |
| E1.6 | Quét trùng item đã quét | API | Xử lý duplicate |
| E1.7 | Đóng phiên đã đóng | API | 400 |

### E2. UI Kiểm kê
| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| E2.1 | Mở `/inventory` | UI | Danh sách phiên |
| E2.2 | Click vào phiên → `/inventory/:id` | UI | Chi tiết + nút quét |
| E2.3 | Mở `/inventory/:id/scan` | UI | Giao diện quét hiển thị |

---

## Phần F: Nhập hàng loạt (Import)

### F1. Upload & Commit
| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| F1.1 | POST `/imports/upload` file Excel hợp lệ | API | 201, batch created |
| F1.2 | Upload file sai format | API | 400 |
| F1.3 | GET `/imports/:id/rows` xem preview | API + UI | 200, hiển thị dữ liệu |
| F1.4 | POST `/imports/:id/commit` | API | 200, tạo assets |
| F1.5 | POST `/imports/:id/rollback` | API | 200, xoá batch |
| F1.6 | Commit batch đã commit | API | 400 |

---

## Phần G: Quản lý Sự cố (Incidents)

### G1. CRUD Sự cố
| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| G1.1 | GET `/incidents` | API + UI | 200, danh sách |
| G1.2 | POST tạo sự cố | API | 201 |
| G1.3 | GET `/incidents/:id` | API + UI | 200, chi tiết |
| G1.4 | PUT `/incidents/:id/status` (OPEN→IN_PROGRESS→RESOLVED→CLOSED) | API | 200, trạng thái thay đổi |
| G1.5 | PUT `/incidents/:id/assign` gán người xử lý | API | 200 |
| G1.6 | Cập nhật status không hợp lệ | API | 400 |

### G2. UI Sự cố
| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| G2.1 | Mở `/incidents` | UI | Bảng sự cố, badge ưu tiên |
| G2.2 | Click sự cố → `/incidents/:id` | UI | Timeline sự kiện |
| G2.3 | Lọc theo priority/status | UI | Bảng cập nhật |

---

## Phần H: Tài sản số (Digital Entitlements)

### H1. CRUD
| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| H1.1 | GET `/entitlements` | API + UI | 200 |
| H1.2 | POST tạo entitlement (LICENSE/DOMAIN/SSL) | API | 201 |
| H1.3 | GET `/entitlements/:id` | API + UI | 200, tabs hiển thị |

### H2. Cấp phát & Thu hồi License
| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| H2.1 | POST `/entitlements/:id/assignments` | API | 200, usedQuantity tăng |
| H2.2 | Cấp phát vượt totalQuantity | API | 400 |
| H2.3 | PATCH revoke assignment | API | 200, usedQuantity giảm |

### H3. Gia hạn (Renewal)
| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| H3.1 | POST `/entitlements/:id/renewals` | API | 200, expiryDate cập nhật |

### H4. UI Tài sản số
| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| H4.1 | Mở `/entitlements` | UI | Bảng license, badge loại |
| H4.2 | Click → chi tiết, 3 tabs | UI | Info, Assignment, Renewal |
| H4.3 | Gán license cho user từ UI | UI | Danh sách assignment cập nhật |

---

## Phần I: Nhà cung cấp (Vendors)

### I1. CRUD
| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| I1.1 | POST `/vendors` tạo mới | API | 201 |
| I1.2 | GET `/vendors` | API + UI | 200 |
| I1.3 | GET `/vendors/:id` | API + UI | 200 |
| I1.4 | PUT `/vendors/:id` cập nhật | API | 200 |

### I2. Đánh giá Vendor
| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| I2.1 | POST `/vendors/:id/evaluate` với scores hợp lệ | API | 200, score = trung bình |
| I2.2 | Kiểm tra score được lưu chính xác (VD: {a:4, b:5} → score=4) | API | score=4, lastEvaluation cập nhật |
| I2.3 | Đánh giá vendor không tồn tại | API | 404 |

### I3. UI Vendor
| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| I3.1 | Mở `/vendors` | UI | Bảng, cột sao (star ratings) |
| I3.2 | Lọc theo status | UI | Bảng cập nhật |
| I3.3 | Click vendor → 3 tabs | UI | Info, Tài sản, Đánh giá |
| I3.4 | Click sao đánh giá + Lưu | UI | Score cập nhật |

---

## Phần J: Đánh giá Rủi ro (Risk Assessment)

### J1. Phiên đánh giá
| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| J1.1 | POST tạo phiên đánh giá | API | 201, status=DRAFT |
| J1.2 | GET danh sách | API + UI | 200 |
| J1.3 | GET chi tiết (kèm risk items) | API + UI | 200 |
| J1.4 | PUT đổi status → APPROVED | API | 200 |

### J2. Hạng mục rủi ro (Risk Items)
| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| J2.1 | POST tạo risk item (likelihood=4, impact=5) | API | 201, score=20, level=CRITICAL |
| J2.2 | POST tạo risk item (likelihood=1, impact=2) | API | 201, score=2, level=LOW |
| J2.3 | POST tạo risk item (likelihood=3, impact=3) | API | 201, score=9, level=MEDIUM |
| J2.4 | PUT treatment strategy = MITIGATE + residual scores | API | 200, residualScore tính đúng |
| J2.5 | PUT treatment strategy = ACCEPT + rationale | API | 200, acceptanceRationale lưu |
| J2.6 | Tạo risk item cho assessment không tồn tại | API | 404 |

### J3. UI Risk
| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| J3.1 | Mở `/risks` | UI | Bảng + 3 thẻ thống kê |
| J3.2 | Lọc theo status | UI | Bảng cập nhật |
| J3.3 | Click → chi tiết, tab Register | UI | Bảng risk items, cột Level có màu |
| J3.4 | Tab Matrix (Heatmap) | UI | Ma trận 5x5 hiển thị, ô có số |
| J3.5 | Nút Phê duyệt (khi status=SUBMITTED) | UI | Status → APPROVED |

---

## Phần K: Lịch sử & Audit

### K1. Lịch sử giao dịch
| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| K1.1 | GET `/history` | API + UI | 200, danh sách audit logs |
| K1.2 | Tạo tài sản → kiểm tra log mới | API | Log ghi nhận action CREATE |
| K1.3 | Cấp phát tài sản → kiểm tra log | API | Log ghi nhận action ASSIGN |

---

## Phần L: Layout & Navigation (UI chung)

| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| L1 | Sidebar hiển thị đủ 11 menu items | UI | Tổng quan, Sổ tài sản, Tài sản số, Nhà cung cấp, Đánh giá rủi ro, Danh mục, Barcode/QR, Kiểm kê, Nhập hàng loạt, Quản lý sự cố, Lịch sử |
| L2 | Click menu → active state (bg indigo) | UI | NavLink active class |
| L3 | Responsive: mobile sidebar toggle | UI | Menu mở/đóng khi click hamburger |
| L4 | Đăng xuất → quay về Login | UI | State reset, hiển thị LoginScreen |
| L5 | Route `/` redirect → `/dashboard` | UI | Navigate tự động |
| L6 | Truy cập route không tồn tại | UI | Không crash, hiển thị trắng hoặc 404 |

---

## Phần M: Middleware & Bảo mật

| # | Mô tả | Loại | Kết quả mong đợi |
|---|-------|------|------------------|
| M1 | CORS header cho phép origin cấu hình | API | Access-Control-Allow-Origin |
| M2 | Audit middleware ghi log mỗi request | API | AuditLog record được tạo |
| M3 | Recovery middleware khi panic | API | 500 thay vì crash server |
| M4 | Error handler trả JSON format thống nhất | API | `{success: false, error: {code, message}}` |

---

## Thứ tự thực hiện đề xuất

```
Tuần 1: Phần A (Auth) → B (Master Data) → C (Assets + Lifecycle)
Tuần 2: Phần D (Scanner) → E (Inventory) → F (Import)
Tuần 3: Phần G (Incidents) → H (Digital Entitlements)
Tuần 4: Phần I (Vendors) → J (Risk Assessment)
Tuần 5: Phần K (Audit) → L (Layout) → M (Middleware) → Regression
```

---

**Tổng cộng: ~95 test cases** bao phủ 12 module chức năng, từ API backend đến giao diện người dùng.
