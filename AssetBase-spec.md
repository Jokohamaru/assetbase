# AssetBase — Tài liệu Đặc tả Kỹ thuật v1.0

> Tài liệu này được thiết kế để AI Agent có thể đọc hiểu và triển khai toàn bộ dự án.
> Phiên bản gốc tham khảo: AssetFlow v2.2.0 (`/opt/assetIT`)

---

## 1. Tổng quan dự án

### 1.1 Mục tiêu
AssetBase là hệ thống quản lý tài sản CNTT (IT Asset Management) đơn giản hóa từ dự án AssetFlow. Hệ thống cung cấp khả năng theo dõi toàn bộ vòng đời tài sản từ lúc nhập kho đến thanh lý, quản lý sự cố, license/SSL/domain, kiểm kê, import hàng loạt, quản lý nhà cung cấp và đánh giá rủi ro.

### 1.2 Phạm vi chức năng

| # | Module | Mô tả |
|---|--------|-------|
| 1 | **Quản lý tài sản** | CRUD tài sản, danh mục, model, nhà sản xuất, trạng thái |
| 2 | **Vòng đời tài sản** | Cấp phát, Thu hồi, Điều chuyển, Bảo trì |
| 3 | **Kiểm kê** | Phiên kiểm kê theo scope (phòng ban/vị trí/kho/danh mục), quét barcode |
| 4 | **Import hàng loạt** | Upload CSV/Excel → staged → validate → commit/rollback |
| 5 | **Sự cố CNTT** | Tiếp nhận, phân công, xử lý, đóng sự cố theo SLA |
| 6 | **License/SSL/Domain** | Quản lý quyền kỹ thuật số, cấp phát, gia hạn, cảnh báo hết hạn |
| 7 | **Nhà cung cấp** | Quản lý vendor, đánh giá, chấm điểm |
| 8 | **Đánh giá rủi ro** | Assessment → Risk Items → Controls → Treatment → Review |

### 1.3 Các tính năng ĐÃ LOẠI BỎ so với AssetFlow gốc
- ❌ Endpoint Agent & Discovery (thu thập tự động từ máy trạm)
- ❌ Directory Sync (LDAP, Microsoft 365/Entra ID)
- ❌ Microsoft License Assignment tự động
- ❌ Email Notification (SMTP gửi cảnh báo)
- ❌ Docker / Docker Compose / Caddy reverse proxy
- ❌ Prometheus / Monitoring stack
- ❌ Self-hosted infrastructure scripts

---

## 2. Tech Stack

| Layer | Công nghệ | Phiên bản khuyến nghị |
|-------|-----------|----------------------|
| **Backend** | Go + Gin | Go 1.22+, Gin v1.10+ |
| **Frontend** | React + TypeScript + Vite | React 19+, Vite 6+ |
| **Database** | PostgreSQL | 16+ |
| **ORM** | Prisma Client Go | v0.32.0+ (github.com/steebchen/prisma-client-go) |
| **Auth** | JWT (access token) + HttpOnly Cookie (refresh) | — |
| **Password Hash** | bcrypt hoặc argon2id | — |
| **API Style** | RESTful JSON | — |
| **UI Library** | shadcn/ui + Tailwind CSS (khuyến nghị) | — |

---

## 3. Cấu trúc Monorepo

```
assetbase/
├── apps/
│   ├── api/                          # Go Backend (Gin)
│   │   ├── cmd/
│   │   │   └── server/
│   │   │       └── main.go           # Entrypoint
│   │   ├── internal/
│   │   │   ├── config/
│   │   │   │   └── config.go         # Load .env, validate
│   │   │   ├── database/
│   │   │   │   ├── database.go       # GORM connection & auto-migrate
│   │   │   │   └── seed.go           # Demo seed data
│   │   │   ├── middleware/
│   │   │   │   ├── auth.go           # JWT validation, extract user
│   │   │   │   ├── cors.go           # CORS config
│   │   │   │   ├── audit.go          # Audit log middleware
│   │   │   │   └── error_handler.go  # Global error handler
│   │   │   ├── model/                # GORM models (1 file per entity group)
│   │   │   │   ├── enums.go
│   │   │   │   ├── user.go
│   │   │   │   ├── organization.go   # Department, Location, Warehouse
│   │   │   │   ├── asset.go          # AssetCategory, Manufacturer, AssetModel, AssetStatus, Asset
│   │   │   │   ├── lifecycle.go      # Assignment, Return, Transfer, Maintenance, History
│   │   │   │   ├── inventory.go      # InventorySession, InventoryItem
│   │   │   │   ├── importbatch.go    # AssetImportBatch, AssetImportRow
│   │   │   │   ├── incident.go       # Incident, IncidentAssignment, IncidentActivity
│   │   │   │   ├── digital.go        # Vendor, DigitalEntitlement, DigitalAssignment, DigitalRenewal
│   │   │   │   ├── renewal_alert.go  # RenewalAlertPolicy, RenewalAlert
│   │   │   │   ├── risk.go           # RiskAssessment, RiskItem, RiskAsset, RiskIncident, RiskControl, RiskTreatmentAction, RiskReview
│   │   │   │   └── system.go         # AuditLog, Attachment, ApplicationSetting
│   │   │   ├── dto/                  # Request/Response DTOs
│   │   │   │   ├── auth_dto.go
│   │   │   │   ├── asset_dto.go
│   │   │   │   ├── lifecycle_dto.go
│   │   │   │   ├── incident_dto.go
│   │   │   │   ├── digital_dto.go
│   │   │   │   ├── risk_dto.go
│   │   │   │   └── common_dto.go     # Pagination, filter, sort
│   │   │   ├── repository/           # Data access layer
│   │   │   │   ├── user_repo.go
│   │   │   │   ├── asset_repo.go
│   │   │   │   ├── lifecycle_repo.go
│   │   │   │   └── ...
│   │   │   ├── service/              # Business logic
│   │   │   │   ├── auth_service.go
│   │   │   │   ├── asset_service.go
│   │   │   │   ├── lifecycle_service.go
│   │   │   │   ├── inventory_service.go
│   │   │   │   ├── import_service.go
│   │   │   │   ├── incident_service.go
│   │   │   │   ├── digital_service.go
│   │   │   │   ├── vendor_service.go
│   │   │   │   ├── risk_service.go
│   │   │   │   └── dashboard_service.go
│   │   │   └── handler/              # HTTP handlers (controllers)
│   │   │       ├── auth_handler.go
│   │   │       ├── asset_handler.go
│   │   │       ├── lifecycle_handler.go
│   │   │       ├── inventory_handler.go
│   │   │       ├── import_handler.go
│   │   │       ├── incident_handler.go
│   │   │       ├── digital_handler.go
│   │   │       ├── vendor_handler.go
│   │   │       ├── risk_handler.go
│   │   │       ├── master_data_handler.go
│   │   │       └── dashboard_handler.go
│   │   ├── pkg/                      # Shared utilities
│   │   │   ├── password/
│   │   │   │   └── password.go       # Hash & verify (bcrypt)
│   │   │   ├── jwt/
│   │   │   │   └── jwt.go            # Generate & validate JWT
│   │   │   ├── response/
│   │   │   │   └── response.go       # Standardized JSON response
│   │   │   ├── pagination/
│   │   │   │   └── pagination.go     # Offset-based pagination helper
│   │   │   └── validator/
│   │   │       └── validator.go      # Custom validators
│   │   ├── go.mod
│   │   ├── go.sum
│   │   ├── .env.example
│   │   └── Makefile
│   └── web/                          # React Frontend
│       ├── src/
│       │   ├── api/                  # API client (axios/fetch wrapper)
│       │   ├── components/           # Shared UI components
│       │   ├── features/             # Feature-based modules
│       │   │   ├── auth/
│       │   │   ├── dashboard/
│       │   │   ├── assets/
│       │   │   ├── lifecycle/
│       │   │   ├── inventory/
│       │   │   ├── import/
│       │   │   ├── incidents/
│       │   │   ├── digital/
│       │   │   ├── vendors/
│       │   │   ├── risk/
│       │   │   └── settings/
│       │   ├── hooks/
│       │   ├── lib/
│       │   ├── types/
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── tailwind.config.ts
├── README.md
└── Makefile                          # Root-level commands: make dev, make build, etc.
```

---

## 4. Cấu hình môi trường

### 4.1 File `.env.example` (Backend)

```env
# Server
PORT=8080
GIN_MODE=debug                    # debug | release

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=assetbase
DB_SSLMODE=disable
DB_TIMEZONE=Asia/Ho_Chi_Minh

# Auth
JWT_SECRET=change-me-to-a-random-secret-at-least-32-chars
JWT_EXPIRY_HOURS=12
BCRYPT_COST=12

# CORS
CORS_ORIGIN=http://localhost:5173

# Initial Admin (chỉ dùng lần đầu khi DB trống)
INITIAL_ADMIN_PASSWORD=Admin@12345

# Seed
ASSETBASE_DEMO_SEED=false
```

---

## 5. Database Schema (Prisma Schema)

Dự án sử dụng **Prisma Client Go** để quản lý database schema, migrations và truy vấn dữ liệu. Dưới đây là nội dung chi tiết của file `apps/api/prisma/schema.prisma` gồm **35 models** đã đơn giản hóa.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator db {
  provider = "go run github.com/steebchen/prisma-client-go"
}

enum RecordStatus {
  ACTIVE
  INACTIVE
}

enum UserRole {
  ADMIN
  USER
}

enum AssetHistoryAction {
  CREATED
  UPDATED
  ASSIGNED
  RETURNED
  TRANSFERRED
  MAINTENANCE
  INVENTORIED
  DISPOSED
}

enum AssetAssignmentType {
  ASSIGNMENT
  LOAN
}

enum AssetAssignmentStatus {
  OPEN
  CLOSED
  CANCELLED
}

enum AssetReturnOutcome {
  READY
  MAINTENANCE
  BROKEN
}

enum MaintenanceStatus {
  OPEN
  COMPLETED
  CANCELLED
}

enum MaintenanceOutcome {
  READY
  BROKEN
  DISPOSED
}

enum IncidentCategory {
  POWER
  NETWORK
  MALWARE
  HARDWARE
  SOFTWARE
  SECURITY
  ACCESS
  CLOUD
  TELEPHONY
  OTHER
}

enum IncidentStatus {
  NEW
  ACKNOWLEDGED
  IN_PROGRESS
  MONITORING
  RESOLVED
  CLOSED
  CANCELLED
}

enum IncidentPriority {
  P1
  P2
  P3
  P4
}

enum IncidentImpact {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

enum IncidentUrgency {
  HIGH
  MEDIUM
  LOW
}

enum IncidentAssignmentRole {
  PRIMARY
  SUPPORT
}

enum DigitalEntitlementType {
  LICENSE
  SSL_CERTIFICATE
  DOMAIN
}

enum DigitalEntitlementStatus {
  ACTIVE
  EXPIRING
  EXPIRED
  SUSPENDED
  RETIRED
}

enum DigitalAssignmentStatus {
  ACTIVE
  REVOKED
}

enum DigitalRenewalStatus {
  PLANNED
  APPROVED
  COMPLETED
  CANCELLED
}

enum RenewalAlertStatus {
  OPEN
  ACKNOWLEDGED
  RESOLVED
  DISMISSED
}

enum InventoryStatus {
  OPEN
  CLOSED
  CANCELLED
}

enum InventoryResult {
  PENDING
  MATCHED
  MISSING
  UNEXPECTED
  LOCATION_MISMATCH
  CUSTODIAN_MISMATCH
}

enum AssetImportStatus {
  STAGED
  COMMITTED
  ROLLED_BACK
  FAILED
}

enum AssetImportRowStatus {
  VALID
  INVALID
  COMMITTED
  ROLLED_BACK
}

enum RiskAssessmentStatus {
  DRAFT
  IN_REVIEW
  APPROVED
  TREATMENT
  MONITORING
  CLOSED
  CANCELLED
}

enum RiskItemStatus {
  IDENTIFIED
  ASSESSED
  TREATMENT_PLANNED
  TREATING
  MONITORING
  ACCEPTED
  CLOSED
}

enum RiskLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum RiskTreatmentStrategy {
  AVOID
  MITIGATE
  TRANSFER
  ACCEPT
}

enum RiskTreatmentStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum RiskControlStatus {
  PLANNED
  PARTIAL
  IMPLEMENTED
  INEFFECTIVE
  NOT_APPLICABLE
}

enum RiskReviewDecision {
  SUBMIT
  RETURN_FOR_CHANGES
  APPROVE
  ACCEPT_RESIDUAL
  CLOSE
}

enum RiskSource {
  MANUAL
  INCIDENT
  AUDIT
  VENDOR
}

model Department {
  id                     String               @id @default(uuid()) @db.Uuid
  code                   String               @unique @db.VarChar(50)
  name                   String               @db.VarChar(150)
  parentId               String?              @db.Uuid
  parent                 Department?          @relation("DepartmentTree", fields: [parentId], references: [id], onDelete: Restrict)
  children               Department[]         @relation("DepartmentTree")
  status                 RecordStatus         @default(ACTIVE)
  isIncidentResponseTeam Boolean              @default(false)
  users                  User[]
  people                 Person[]
  assets                 Asset[]
  assignments            AssetAssignment[]
  inventorySessions      InventorySession[]
  incidents              Incident[]           @relation("IncidentAffectedDepartment")
  assignedIncidents      Incident[]           @relation("IncidentAssignedDepartment")
  incidentAssignments    IncidentAssignment[]
  digitalEntitlements    DigitalEntitlement[]
  digitalAssignments     DigitalAssignment[]
  riskAssessments        RiskAssessment[]     @relation("RiskAssessmentDepartment")
  riskItems              RiskItem[]           @relation("RiskAffectedDepartment")
  createdAt              DateTime             @default(now())
  updatedAt              DateTime             @updatedAt

  @@map("departments")
}

model User {
  id                 String             @id @default(uuid()) @db.Uuid
  employeeCode       String             @unique @db.VarChar(50)
  username           string             @unique @db.VarChar(100)
  fullName           String             @db.VarChar(150)
  email              String             @unique @db.VarChar(255)
  phone              String?            @db.VarChar(30)
  passwordHash       String?            @db.VarChar(255)
  role               UserRole           @default(USER)
  mustChangePassword Boolean            @default(false)
  passwordChangedAt  DateTime?
  lastLoginAt        DateTime?
  departmentId       String?            @db.Uuid
  department         Department?        @relation(fields: [departmentId], references: [id], onDelete: Restrict)
  status             RecordStatus       @default(ACTIVE)
  assignedAssets     Asset[]
  histories          AssetHistory[]     @relation("HistoryActor")
  assignments        AssetAssignment[]  @relation("AssignmentActor")
  returns            AssetReturn[]      @relation("ReturnActor")
  transfers          AssetTransfer[]    @relation("TransferActor")
  maintenances       MaintenanceRecord[] @relation("MaintenanceActor")
  incidentsReported  Incident[]         @relation("IncidentReporter")
  incidentsAssigned  Incident[]         @relation("IncidentAssignee")
  incidentsCreated   Incident[]         @relation("IncidentCreator")
  incidentActivities IncidentActivity[] @relation("IncidentActivityActor")
  incidentsAssignmentsReceived IncidentAssignment[] @relation("IncidentAssignmentAssignee")
  incidentsAssignmentsMade     IncidentAssignment[] @relation("IncidentAssignmentActor")
  digitalEntitlementsOwned     DigitalEntitlement[] @relation("DigitalEntitlementOwner")
  digitalEntitlementsCreated   DigitalEntitlement[] @relation("DigitalEntitlementCreator")
  digitalAssignmentsMade       DigitalAssignment[]  @relation("DigitalAssignmentActor")
  digitalAssignmentsRevoked    DigitalAssignment[]  @relation("DigitalAssignmentRevoker")
  digitalRenewalsApproved      DigitalRenewal[]     @relation("DigitalRenewalApprover")
  digitalRenewalsCompleted     DigitalRenewal[]     @relation("DigitalRenewalActor")
  renewalAlertsAcknowledged    RenewalAlert[]       @relation("RenewalAlertAcknowledger")
  renewalPoliciesUpdated       RenewalAlertPolicy[] @relation("RenewalPolicyUpdater")
  inventorySessions            InventorySession[]   @relation("InventoryCreator")
  inventoryScans               InventoryItem[]      @relation("InventoryScanner")
  importBatches                AssetImportBatch[]   @relation("ImportCreator")
  riskAssessmentsOwned         RiskAssessment[]     @relation("RiskAssessmentOwner")
  riskAssessmentsApproved      RiskAssessment[]     @relation("RiskAssessmentApprover")
  riskAssessmentsCreated       RiskAssessment[]     @relation("RiskAssessmentCreator")
  riskItemsOwned               RiskItem[]           @relation("RiskItemOwner")
  riskItemsCreated             RiskItem[]           @relation("RiskItemCreator")
  riskTreatmentsAssigned       RiskTreatmentAction[] @relation("RiskTreatmentAssignee")
  riskTreatmentsCreated        RiskTreatmentAction[] @relation("RiskTreatmentCreator")
  riskReviews                  RiskReview[]         @relation("RiskReviewer")
  authSessions                 AuthSession[]
  person                       Person?
  createdAt                    DateTime             @default(now())
  updatedAt                    DateTime             @updatedAt

  @@map("users")
}

model AuthSession {
  id        String    @id @default(uuid()) @db.Uuid
  tokenHash String    @unique @db.VarChar(64)
  userId    String    @db.Uuid
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime  @default(now())

  @@index([userId, expiresAt])
  @@map("auth_sessions")
}

model Person {
  id                     String              @id @default(uuid()) @db.Uuid
  employeeCode           String              @unique @db.VarChar(50)
  fullName               String              @db.VarChar(150)
  email                  String?             @unique @db.VarChar(255)
  phone                  String?             @db.VarChar(30)
  jobTitle               String?             @db.VarChar(150)
  departmentId           String              @db.Uuid
  locationId             String?             @db.Uuid
  linkedUserId           String?             @unique @db.Uuid
  status                 RecordStatus        @default(ACTIVE)
  department             Department          @relation(fields: [departmentId], references: [id], onDelete: Restrict)
  location               Location?           @relation(fields: [locationId], references: [id], onDelete: Restrict)
  linkedUser             User?               @relation(fields: [linkedUserId], references: [id], onDelete: SetNull)
  currentAssets          Asset[]             @relation("CurrentCustodian")
  assignments            AssetAssignment[]
  inventoryExpectedItems InventoryItem[]     @relation("InventoryExpectedCustodian")
  inventoryObservedItems InventoryItem[]     @relation("InventoryObservedCustodian")
  digitalAssignments     DigitalAssignment[]
  createdAt              DateTime            @default(now())
  updatedAt              DateTime            @updatedAt

  @@index([departmentId, status])
  @@map("people")
}

model Location {
  id                     String             @id @default(uuid()) @db.Uuid
  code                   String             @unique @db.VarChar(50)
  name                   String             @db.VarChar(150)
  parentId               String?            @db.Uuid
  parent                 Location?          @relation("LocationTree", fields: [parentId], references: [id], onDelete: Restrict)
  children               Location[]         @relation("LocationTree")
  type                   String             @db.VarChar(30)
  address                String?
  status                 RecordStatus       @default(ACTIVE)
  warehouses             Warehouse[]
  assets                 Asset[]
  people                 Person[]
  historyFrom            AssetHistory[]     @relation("HistoryFromLocation")
  historyTo              AssetHistory[]     @relation("HistoryToLocation")
  assignments            AssetAssignment[]
  returns                AssetReturn[]
  transfersFrom          AssetTransfer[]    @relation("TransferFromLocation")
  transfersTo            AssetTransfer[]    @relation("TransferToLocation")
  inventorySessions      InventorySession[]
  incidents              Incident[]
  inventoryExpectedItems InventoryItem[]    @relation("InventoryExpectedLocation")
  inventoryObservedItems InventoryItem[]    @relation("InventoryObservedLocation")
  createdAt              DateTime           @default(now())
  updatedAt              DateTime           @updatedAt

  @@map("locations")
}

model Warehouse {
  id            String              @id @default(uuid()) @db.Uuid
  code          String              @unique @db.VarChar(50)
  name          String              @db.VarChar(150)
  locationId    String              @db.Uuid
  location      Location            @relation(fields: [locationId], references: [id], onDelete: Restrict)
  description   String?
  status        RecordStatus        @default(ACTIVE)
  assets        Asset[]
  returns       AssetReturn[]
  transfersFrom AssetTransfer[]     @relation("TransferFromWarehouse")
  transfersTo   AssetTransfer[]     @relation("TransferToWarehouse")
  maintenances  MaintenanceRecord[]
  inventorySessions InventorySession[]
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  @@map("warehouses")
}

model AssetCategory {
  id                String             @id @default(uuid()) @db.Uuid
  code              String             @unique @db.VarChar(50)
  name              String             @db.VarChar(150)
  parentId          String?            @db.Uuid
  parent            AssetCategory?     @relation("CategoryTree", fields: [parentId], references: [id], onDelete: Restrict)
  children          AssetCategory[]    @relation("CategoryTree")
  description       String?
  status            RecordStatus       @default(ACTIVE)
  models            AssetModel[]
  assets            Asset[]
  inventorySessions InventorySession[]
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  @@map("asset_categories")
}

model Manufacturer {
  id           String       @id @default(uuid()) @db.Uuid
  name         String       @unique @db.VarChar(150)
  website      String?
  supportUrl   String?
  supportPhone String?      @db.VarChar(30)
  status       RecordStatus @default(ACTIVE)
  models       AssetModel[]
  assets       Asset[]
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@map("manufacturers")
}

model AssetModel {
  id             String        @id @default(uuid()) @db.Uuid
  categoryId     String        @db.Uuid
  manufacturerId String        @db.Uuid
  category       AssetCategory @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  manufacturer   Manufacturer  @relation(fields: [manufacturerId], references: [id], onDelete: Restrict)
  name           String        @db.VarChar(150)
  modelNumber    String?       @db.VarChar(100)
  description    String?
  status         RecordStatus  @default(ACTIVE)
  assets         Asset[]
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@unique([manufacturerId, name])
  @@map("asset_models")
}

model AssetStatus {
  id           String  @id @default(uuid()) @db.Uuid
  code         String  @unique @db.VarChar(30)
  name         String  @db.VarChar(100)
  color        String  @db.VarChar(20)
  isAssignable Boolean @default(false)
  isDeployable Boolean @default(false)
  isArchived   Boolean @default(false)
  sortOrder    Int
  assets       Asset[]

  @@map("asset_statuses")
}

model Asset {
  id                 String              @id @default(uuid()) @db.Uuid
  assetTag           String              @unique @db.VarChar(100)
  name               String              @db.VarChar(200)
  serialNumber       String?             @unique @db.VarChar(150)
  barcode            String              @unique @db.VarChar(150)
  categoryId         String              @db.Uuid
  modelId            String?             @db.Uuid
  manufacturerId     String?             @db.Uuid
  statusId           String              @db.Uuid
  assignedUserId     String?             @db.Uuid
  currentCustodianId String?             @db.Uuid
  departmentId       String?             @db.Uuid
  locationId         String?             @db.Uuid
  warehouseId        String?             @db.Uuid
  category           AssetCategory       @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  model              AssetModel?         @relation(fields: [modelId], references: [id], onDelete: Restrict)
  manufacturer       Manufacturer?       @relation(fields: [manufacturerId], references: [id], onDelete: Restrict)
  status             AssetStatus         @relation(fields: [statusId], references: [id], onDelete: Restrict)
  assignedUser       User?               @relation(fields: [assignedUserId], references: [id], onDelete: SetNull)
  currentCustodian   Person?             @relation("CurrentCustodian", fields: [currentCustodianId], references: [id], onDelete: SetNull)
  department         Department?         @relation(fields: [departmentId], references: [id], onDelete: SetNull)
  location           Location?           @relation(fields: [locationId], references: [id], onDelete: SetNull)
  warehouse          Warehouse?          @relation(fields: [warehouseId], references: [id], onDelete: SetNull)
  purchaseDate       DateTime?           @db.Date
  purchaseCost       Decimal?            @db.Decimal(18, 2)
  warrantyMonths     Int?
  warrantyExpiry     DateTime?           @db.Date
  cpu                String?             @db.VarChar(200)
  ram                String?             @db.VarChar(200)
  storage            String?             @db.VarChar(200)
  operatingSystem    String?             @db.VarChar(200)
  ipAddress          String?             @db.VarChar(64)
  macAddress         String?             @db.VarChar(64)
  notes              String?
  deletedAt          DateTime?
  histories          AssetHistory[]
  assignments        AssetAssignment[]
  returns            AssetReturn[]
  transfers          AssetTransfer[]
  maintenances       MaintenanceRecord[]
  incidents          Incident[]
  inventoryItems     InventoryItem[]
  importRows         AssetImportRow[]
  digitalAssignments DigitalAssignment[]
  riskLinks          RiskAsset[]
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt

  @@index([serialNumber])
  @@index([categoryId, statusId, departmentId, locationId])
  @@map("assets")
}

model AssetAssignment {
  id                 String                @id @default(uuid()) @db.Uuid
  assignmentNo       String                @unique @db.VarChar(50)
  assetId            String                @db.Uuid
  type               AssetAssignmentType
  assignedToId       String                @db.Uuid
  departmentId       String                @db.Uuid
  locationId         String                @db.Uuid
  assignedDate       DateTime              @default(now())
  expectedReturnDate DateTime?             @db.Date
  conditionOut       String                @db.VarChar(100)
  note               String?
  assignedBy         String                @db.Uuid
  status             AssetAssignmentStatus @default(OPEN)
  closedAt           DateTime?
  asset              Asset                 @relation(fields: [assetId], references: [id], onDelete: Restrict)
  assignedTo         Person                @relation(fields: [assignedToId], references: [id], onDelete: Restrict)
  department         Department            @relation(fields: [departmentId], references: [id], onDelete: Restrict)
  location           Location              @relation(fields: [locationId], references: [id], onDelete: Restrict)
  actor              User                  @relation("AssignmentActor", fields: [assignedBy], references: [id], onDelete: Restrict)
  returnRecord       AssetReturn?
  createdAt          DateTime              @default(now())
  updatedAt          DateTime              @updatedAt

  @@index([assetId, status])
  @@index([assignedToId, status])
  @@index([expectedReturnDate, status])
  @@map("asset_assignments")
}

model AssetReturn {
  id           String             @id @default(uuid()) @db.Uuid
  returnNo     String             @unique @db.VarChar(50)
  assignmentId String             @unique @db.Uuid
  assetId      String             @db.Uuid
  warehouseId  String?            @db.Uuid
  locationId   String             @db.Uuid
  returnedDate DateTime           @default(now())
  conditionIn  String             @db.VarChar(100)
  outcome      AssetReturnOutcome
  note         String?
  returnedBy   String             @db.Uuid
  assignment   AssetAssignment    @relation(fields: [assignmentId], references: [id], onDelete: Restrict)
  asset        Asset              @relation(fields: [assetId], references: [id], onDelete: Restrict)
  warehouse    Warehouse?         @relation(fields: [warehouseId], references: [id], onDelete: Restrict)
  location     Location           @relation(fields: [locationId], references: [id], onDelete: Restrict)
  actor        User               @relation("ReturnActor", fields: [returnedBy], references: [id], onDelete: Restrict)
  createdAt    DateTime           @default(now())

  @@index([assetId, returnedDate])
  @@map("asset_returns")
}

model AssetTransfer {
  id              String     @id @default(uuid()) @db.Uuid
  transferNo      String     @unique @db.VarChar(50)
  assetId         String     @db.Uuid
  fromLocationId  String?    @db.Uuid
  toLocationId    String     @db.Uuid
  fromWarehouseId String?    @db.Uuid
  toWarehouseId   String?    @db.Uuid
  transferredDate DateTime   @default(now())
  condition       String?    @db.VarChar(100)
  reason          String     @db.VarChar(1000)
  transferredBy   String     @db.Uuid
  asset           Asset      @relation(fields: [assetId], references: [id], onDelete: Restrict)
  fromLocation    Location?  @relation("TransferFromLocation", fields: [fromLocationId], references: [id], onDelete: Restrict)
  toLocation      Location   @relation("TransferToLocation", fields: [toLocationId], references: [id], onDelete: Restrict)
  fromWarehouse   Warehouse? @relation("TransferFromWarehouse", fields: [fromWarehouseId], references: [id], onDelete: Restrict)
  toWarehouse     Warehouse? @relation("TransferToWarehouse", fields: [toWarehouseId], references: [id], onDelete: Restrict)
  actor           User       @relation("TransferActor", fields: [transferredBy], references: [id], onDelete: Restrict)
  createdAt       DateTime   @default(now())

  @@index([assetId, transferredDate])
  @@map("asset_transfers")
}

model MaintenanceRecord {
  id            String              @id @default(uuid()) @db.Uuid
  maintenanceNo String              @unique @db.VarChar(50)
  assetId       String              @db.Uuid
  warehouseId   String?             @db.Uuid
  status        MaintenanceStatus   @default(OPEN)
  openedAt      DateTime            @default(now())
  completedAt   DateTime?
  issue         String              @db.VarChar(2000)
  resolution    String?
  outcome       MaintenanceOutcome?
  cost          Decimal?            @db.Decimal(18, 2)
  performedBy   String              @db.Uuid
  asset         Asset               @relation(fields: [assetId], references: [id], onDelete: Restrict)
  warehouse     Warehouse?          @relation(fields: [warehouseId], references: [id], onDelete: Restrict)
  actor         User                @relation("MaintenanceActor", fields: [performedBy], references: [id], onDelete: Restrict)
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  @@index([assetId, status])
  @@map("maintenance_records")
}

model AssetHistory {
  id             String             @id @default(uuid()) @db.Uuid
  assetId        String             @db.Uuid
  action         AssetHistoryAction
  fromLocationId String?            @db.Uuid
  toLocationId   String?            @db.Uuid
  referenceType  String?
  referenceId    String?            @db.Uuid
  description    String
  performedBy    String             @db.Uuid
  asset          Asset              @relation(fields: [assetId], references: [id], onDelete: Cascade)
  actor          User               @relation("HistoryActor", fields: [performedBy], references: [id], onDelete: Restrict)
  fromLocation   Location?          @relation("HistoryFromLocation", fields: [fromLocationId], references: [id], onDelete: SetNull)
  toLocation     Location?          @relation("HistoryToLocation", fields: [toLocationId], references: [id], onDelete: SetNull)
  createdAt      DateTime           @default(now())

  @@index([assetId, createdAt])
  @@map("asset_history")
}

model InventorySession {
  id                String          @id @default(uuid()) @db.Uuid
  inventoryNo       String          @unique @db.VarChar(50)
  name              String          @db.VarChar(200)
  status            InventoryStatus @default(OPEN)
  scopeDepartmentId String?         @db.Uuid
  scopeLocationId   String?         @db.Uuid
  scopeWarehouseId  String?         @db.Uuid
  scopeCategoryId   String?         @db.Uuid
  startedAt         DateTime        @default(now())
  closedAt          DateTime?
  cancelledAt       DateTime?
  createdBy         String          @db.Uuid
  scopeDepartment   Department?     @relation(fields: [scopeDepartmentId], references: [id], onDelete: Restrict)
  scopeLocation     Location?       @relation(fields: [scopeLocationId], references: [id], onDelete: Restrict)
  scopeWarehouse    Warehouse?      @relation(fields: [scopeWarehouseId], references: [id], onDelete: Restrict)
  scopeCategory     AssetCategory?  @relation(fields: [scopeCategoryId], references: [id], onDelete: Restrict)
  creator           User            @relation("InventoryCreator", fields: [createdBy], references: [id], onDelete: Restrict)
  items             InventoryItem[]
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@index([status, startedAt])
  @@map("inventory_sessions")
}

model InventoryItem {
  id                  String           @id @default(uuid()) @db.Uuid
  sessionId           String           @db.Uuid
  assetId             String           @db.Uuid
  expectedLocationId  String?          @db.Uuid
  expectedCustodianId String?          @db.Uuid
  observedLocationId  String?          @db.Uuid
  observedCustodianId String?          @db.Uuid
  scannedAt           DateTime?
  scannedBy           String?          @db.Uuid
  result              InventoryResult  @default(PENDING)
  note                String?
  session             InventorySession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  asset               Asset            @relation(fields: [assetId], references: [id], onDelete: Restrict)
  expectedLocation    Location?        @relation("InventoryExpectedLocation", fields: [expectedLocationId], references: [id], onDelete: Restrict)
  observedLocation    Location?        @relation("InventoryObservedLocation", fields: [observedLocationId], references: [id], onDelete: Restrict)
  expectedCustodian   Person?          @relation("InventoryExpectedCustodian", fields: [expectedCustodianId], references: [id], onDelete: Restrict)
  observedCustodian   Person?          @relation("InventoryObservedCustodian", fields: [observedCustodianId], references: [id], onDelete: Restrict)
  scanner             User?            @relation("InventoryScanner", fields: [scannedBy], references: [id], onDelete: Restrict)
  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt

  @@unique([sessionId, assetId])
  @@index([sessionId, result])
  @@map("inventory_items")
}

model AssetImportBatch {
  id             String            @id @default(uuid()) @db.Uuid
  sourceFileName String            @db.VarChar(255)
  status         AssetImportStatus @default(STAGED)
  totalRows      Int
  validRows      Int               @default(0)
  invalidRows    Int               @default(0)
  committedRows  Int               @default(0)
  createdBy      String            @db.Uuid
  committedAt    DateTime?
  rolledBackAt   DateTime?
  creator        User              @relation("ImportCreator", fields: [createdBy], references: [id], onDelete: Restrict)
  rows           AssetImportRow[]
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt

  @@index([status, createdAt])
  @@map("asset_import_batches")
}

model AssetImportRow {
  id        String               @id @default(uuid()) @db.Uuid
  batchId   String               @db.Uuid
  rowNumber Int
  payload   Json
  status    AssetImportRowStatus
  errors    Json                 @default("[]")
  assetId   String?              @db.Uuid
  batch     AssetImportBatch     @relation(fields: [batchId], references: [id], onDelete: Cascade)
  asset     Asset?               @relation(fields: [assetId], references: [id], onDelete: Restrict)
  createdAt DateTime             @default(now())
  updatedAt DateTime             @updatedAt

  @@unique([batchId, rowNumber])
  @@index([batchId, status])
  @@map("asset_import_rows")
}

model Incident {
  id                   String             @id @default(uuid()) @db.Uuid
  incidentNo           String             @unique @db.VarChar(50)
  title                String             @db.VarChar(250)
  category             IncidentCategory
  status               IncidentStatus     @default(NEW)
  priority             IncidentPriority
  impact               IncidentImpact
  urgency              IncidentUrgency
  description          String
  businessImpact       String?
  resolution           String?
  rootCause            String?
  correctiveAction     String?
  preventiveAction     String?
  lessonsLearned       String?
  reporterName         String             @db.VarChar(150)
  reporterContact      String?            @db.VarChar(255)
  reportedById         String?            @db.Uuid
  assignedToId         String?            @db.Uuid
  assignedDepartmentId String?            @db.Uuid
  createdById          String             @db.Uuid
  departmentId         String?            @db.Uuid
  locationId           String?            @db.Uuid
  assetId              String?            @db.Uuid
  affectedUsers        Int                @default(0)
  downtimeMinutes      Int                @default(0)
  isSecurityIncident   Boolean            @default(false)
  detectedAt           DateTime
  reportedAt           DateTime           @default(now())
  acknowledgedAt       DateTime?
  responseStartedAt    DateTime?
  resolvedAt           DateTime?
  closedAt             DateTime?
  slaResponseDueAt     DateTime
  slaResolutionDueAt   DateTime
  reporter             User?              @relation("IncidentReporter", fields: [reportedById], references: [id], onDelete: SetNull)
  assignee             User?              @relation("IncidentAssignee", fields: [assignedToId], references: [id], onDelete: SetNull)
  creator              User               @relation("IncidentCreator", fields: [createdById], references: [id], onDelete: Restrict)
  department           Department?        @relation("IncidentAffectedDepartment", fields: [departmentId], references: [id], onDelete: Restrict)
  assignedDepartment   Department?        @relation("IncidentAssignedDepartment", fields: [assignedDepartmentId], references: [id], onDelete: Restrict)
  location             Location?          @relation(fields: [locationId], references: [id], onDelete: Restrict)
  asset                Asset?             @relation(fields: [assetId], references: [id], onDelete: Restrict)
  activities           IncidentActivity[]
  assignments          IncidentAssignment[]
  riskLinks            RiskIncident[]
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt

  @@index([status, priority, reportedAt])
  @@index([category, reportedAt])
  @@index([assetId, reportedAt])
  @@map("incidents")
}

model IncidentAssignment {
  id           String                 @id @default(uuid()) @db.Uuid
  incidentId   String                 @db.Uuid
  assignedToId String                 @db.Uuid
  departmentId String                 @db.Uuid
  assignedBy   String                 @db.Uuid
  role         IncidentAssignmentRole @default(PRIMARY)
  note         String?
  assignedAt   DateTime               @default(now())
  acceptedAt   DateTime?
  releasedAt   DateTime?
  incident     Incident               @relation(fields: [incidentId], references: [id], onDelete: Cascade)
  assignee     User                   @relation("IncidentAssignmentAssignee", fields: [assignedToId], references: [id], onDelete: Restrict)
  department   Department             @relation(fields: [departmentId], references: [id], onDelete: Restrict)
  actor        User                   @relation("IncidentAssignmentActor", fields: [assignedBy], references: [id], onDelete: Restrict)
  createdAt    DateTime               @default(now())

  @@index([incidentId, assignedAt])
  @@map("incident_assignments")
}

model IncidentActivity {
  id          String          @id @default(uuid()) @db.Uuid
  incidentId  String          @db.Uuid
  type        String          @db.VarChar(40)
  note        String
  fromStatus  IncidentStatus?
  toStatus    IncidentStatus?
  performedBy String          @db.Uuid
  incident    Incident        @relation(fields: [incidentId], references: [id], onDelete: Cascade)
  actor       User            @relation("IncidentActivityActor", fields: [performedBy], references: [id], onDelete: Restrict)
  createdAt   DateTime        @default(now())

  @@index([incidentId, createdAt])
  @@map("incident_activities")
}

model Vendor {
  id             String               @id @default(uuid()) @db.Uuid
  code           String               @unique @db.VarChar(50)
  name           String               @db.VarChar(200)
  taxCode        String?              @db.VarChar(50)
  category       String               @db.VarChar(150)
  contact        String               @db.VarChar(150)
  email          String?              @db.VarChar(255)
  phone          String?              @db.VarChar(30)
  address        String?
  certifications String?
  status         String               @db.VarChar(30)
  lastEvaluation DateTime?            @db.Date
  score          Int                  @default(0)
  scores         Json                 @default("{}")
  notes          String?
  entitlements   DigitalEntitlement[]
  createdAt      DateTime             @default(now())
  updatedAt      DateTime             @updatedAt

  @@map("vendors")
}

model DigitalEntitlement {
  id                    String                   @id @default(uuid()) @db.Uuid
  code                  String                   @unique @db.VarChar(60)
  name                  String                   @db.VarChar(250)
  type                  DigitalEntitlementType
  status                DigitalEntitlementStatus @default(ACTIVE)
  productName           String?                  @db.VarChar(200)
  edition               String?                  @db.VarChar(120)
  subscriptionIdentifier String?                 @db.VarChar(255)
  domainName            String?                  @db.VarChar(253)
  commonName            String?                  @db.VarChar(253)
  registrar             String?                  @db.VarChar(200)
  issuer                String?                  @db.VarChar(200)
  licenseMetric         String?                  @db.VarChar(80)
  totalQuantity         Int                      @default(1)
  startDate             DateTime?                @db.Date
  expiryDate            DateTime?                @db.Date
  autoRenew             Boolean                  @default(false)
  renewalPeriodMonths   Int                      @default(12)
  cancellationDeadline  DateTime?                @db.Date
  purchaseCost          Decimal?                 @db.Decimal(18, 2)
  renewalCost           Decimal?                 @db.Decimal(18, 2)
  currency              String                   @default("VND") @db.VarChar(3)
  purchaseOrderNo       String?                  @db.VarChar(100)
  contractNo            String?                  @db.VarChar(100)
  managementUrl         String?                  @db.VarChar(1000)
  notes                 String?
  vendorId              String?                  @db.Uuid
  ownerDepartmentId     String?                  @db.Uuid
  ownerUserId           String?                  @db.Uuid
  createdBy             String                   @db.Uuid
  vendor                Vendor?                  @relation(fields: [vendorId], references: [id], onDelete: Restrict)
  ownerDepartment       Department?              @relation(fields: [ownerDepartmentId], references: [id], onDelete: Restrict)
  owner                 User?                    @relation("DigitalEntitlementOwner", fields: [ownerUserId], references: [id], onDelete: Restrict)
  creator               User                     @relation("DigitalEntitlementCreator", fields: [createdBy], references: [id], onDelete: Restrict)
  assignments           DigitalAssignment[]
  renewals              DigitalRenewal[]
  alerts                RenewalAlert[]
  createdAt             DateTime                 @default(now())
  updatedAt             DateTime                 @updatedAt

  @@index([type, status, expiryDate])
  @@index([ownerDepartmentId, expiryDate])
  @@index([vendorId])
  @@map("digital_entitlements")
}

model DigitalAssignment {
  id             String                  @id @default(uuid()) @db.Uuid
  entitlementId  String                  @db.Uuid
  personId       String?                 @db.Uuid
  assetId        String?                 @db.Uuid
  departmentId   String?                 @db.Uuid
  quantity       Int                     @default(1)
  status         DigitalAssignmentStatus @default(ACTIVE)
  assignedAt     DateTime                @default(now())
  expectedEndAt  DateTime?               @db.Date
  revokedAt      DateTime?
  assignedBy     String                  @db.Uuid
  revokedBy      String?                 @db.Uuid
  assignmentNote String?
  revokeReason   String?
  entitlement    DigitalEntitlement      @relation(fields: [entitlementId], references: [id], onDelete: Restrict)
  person         Person?                 @relation(fields: [personId], references: [id], onDelete: Restrict)
  asset          Asset?                  @relation(fields: [assetId], references: [id], onDelete: Restrict)
  department     Department?             @relation(fields: [departmentId], references: [id], onDelete: Restrict)
  actor          User                    @relation("DigitalAssignmentActor", fields: [assignedBy], references: [id], onDelete: Restrict)
  revoker        User?                   @relation("DigitalAssignmentRevoker", fields: [revokedBy], references: [id], onDelete: Restrict)
  createdAt      DateTime                @default(now())
  updatedAt      DateTime                @updatedAt

  @@index([entitlementId, status])
  @@index([personId, status])
  @@index([assetId, status])
  @@map("digital_assignments")
}

model DigitalRenewal {
  id                 String               @id @default(uuid()) @db.Uuid
  entitlementId      String               @db.Uuid
  status             DigitalRenewalStatus @default(COMPLETED)
  previousExpiryDate DateTime             @db.Date
  newExpiryDate      DateTime             @db.Date
  renewalDate        DateTime             @default(now()) @db.Date
  amount             Decimal?             @db.Decimal(18, 2)
  currency           String               @default("VND") @db.VarChar(3)
  purchaseOrderNo    String?              @db.VarChar(100)
  invoiceNo          String?              @db.VarChar(100)
  approvedBy         String?              @db.Uuid
  renewedBy          String               @db.Uuid
  notes              String?
  entitlement        DigitalEntitlement   @relation(fields: [entitlementId], references: [id], onDelete: Restrict)
  approver           User?                @relation("DigitalRenewalApprover", fields: [approvedBy], references: [id], onDelete: Restrict)
  actor              User                 @relation("DigitalRenewalActor", fields: [renewedBy], references: [id], onDelete: Restrict)
  createdAt          DateTime             @default(now())

  @@index([entitlementId, renewalDate])
  @@map("digital_renewals")
}

model RenewalAlertPolicy {
  id                    String                 @id @default(uuid()) @db.Uuid
  type                  DigitalEntitlementType @unique
  enabled               Boolean                @default(true)
  warningDays           Json                   @default("[90, 60, 30, 14, 7, 1, 0]")
  overdueEscalationDays Json                   @default("[1, 3, 7]")
  notifyOwner           Boolean                @default(true)
  updatedBy             String?                @db.Uuid
  updater               User?                  @relation("RenewalPolicyUpdater", fields: [updatedBy], references: [id], onDelete: Restrict)
  alerts                RenewalAlert[]
  createdAt             DateTime               @default(now())
  updatedAt             DateTime               @updatedAt

  @@map("renewal_alert_policies")
}

model RenewalAlert {
  id               String             @id @default(uuid()) @db.Uuid
  entitlementId    String             @db.Uuid
  policyId         String             @db.Uuid
  thresholdDays    Int
  dueDate          DateTime           @db.Date
  status           RenewalAlertStatus @default(OPEN)
  firstTriggeredAt DateTime           @default(now())
  lastTriggeredAt  DateTime           @default(now())
  acknowledgedAt   DateTime?
  acknowledgedBy   String?            @db.Uuid
  resolvedAt       DateTime?
  note             String?
  entitlement      DigitalEntitlement @relation(fields: [entitlementId], references: [id], onDelete: Cascade)
  policy           RenewalAlertPolicy @relation(fields: [policyId], references: [id], onDelete: Restrict)
  acknowledger     User?              @relation("RenewalAlertAcknowledger", fields: [acknowledgedBy], references: [id], onDelete: Restrict)
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt

  @@unique([entitlementId, dueDate, thresholdDays])
  @@index([status, dueDate])
  @@map("renewal_alerts")
}

model RiskAssessment {
  id             String               @id @default(uuid()) @db.Uuid
  assessmentNo   String               @unique @db.VarChar(50)
  title          String               @db.VarChar(250)
  description    String?
  scope          String
  methodology    String               @default("ISO_27005_NIST_800_30") @db.VarChar(80)
  status         RiskAssessmentStatus @default(DRAFT)
  ownerId        String               @db.Uuid
  approverId     String?              @db.Uuid
  departmentId   String?              @db.Uuid
  startDate      DateTime             @db.Date
  targetDate     DateTime?            @db.Date
  nextReviewAt   DateTime?            @db.Date
  submittedAt    DateTime?
  approvedAt     DateTime?
  closedAt       DateTime?
  createdBy      String               @db.Uuid
  owner          User                 @relation("RiskAssessmentOwner", fields: [ownerId], references: [id], onDelete: Restrict)
  approver       User?                @relation("RiskAssessmentApprover", fields: [approverId], references: [id], onDelete: Restrict)
  creator        User                 @relation("RiskAssessmentCreator", fields: [createdBy], references: [id], onDelete: Restrict)
  department     Department?          @relation("RiskAssessmentDepartment", fields: [departmentId], references: [id], onDelete: Restrict)
  risks          RiskItem[]
  reviews        RiskReview[]
  createdAt      DateTime             @default(now())
  updatedAt      DateTime             @updatedAt

  @@index([status, targetDate])
  @@index([ownerId, status])
  @@index([departmentId, status])
  @@map("risk_assessments")
}

model RiskItem {
  id                  String                @id @default(uuid()) @db.Uuid
  riskNo              String                @unique @db.VarChar(50)
  assessmentId        String                @db.Uuid
  title               String                @db.VarChar(250)
  category            String                @db.VarChar(100)
  scenario            String
  threat              String
  vulnerability       String
  existingControls    String?
  source              RiskSource            @default(MANUAL)
  status              RiskItemStatus        @default(IDENTIFIED)
  likelihood          Int
  impact              Int
  inherentScore       Int
  inherentLevel       RiskLevel
  residualLikelihood  Int?
  residualImpact      Int?
  residualScore       Int?
  residualLevel       RiskLevel?
  treatmentStrategy   RiskTreatmentStrategy @default(MITIGATE)
  acceptanceRationale String?
  ownerId             String                @db.Uuid
  departmentId        String?               @db.Uuid
  dueDate             DateTime?             @db.Date
  createdBy           String                @db.Uuid
  assessment          RiskAssessment        @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  owner               User                  @relation("RiskItemOwner", fields: [ownerId], references: [id], onDelete: Restrict)
  creator             User                  @relation("RiskItemCreator", fields: [createdBy], references: [id], onDelete: Restrict)
  department          Department?           @relation("RiskAffectedDepartment", fields: [departmentId], references: [id], onDelete: Restrict)
  assets              RiskAsset[]
  incidents           RiskIncident[]
  controls            RiskControl[]
  treatments          RiskTreatmentAction[]
  reviews             RiskReview[]
  createdAt           DateTime              @default(now())
  updatedAt           DateTime              @updatedAt

  @@index([assessmentId, status])
  @@index([inherentLevel, residualLevel])
  @@index([ownerId, dueDate])
  @@index([departmentId, status])
  @@map("risk_items")
}

model RiskAsset {
  riskId    String   @db.Uuid
  assetId   String   @db.Uuid
  note      String?
  risk      RiskItem @relation(fields: [riskId], references: [id], onDelete: Cascade)
  asset     Asset    @relation(fields: [assetId], references: [id], onDelete: Restrict)
  createdAt DateTime @default(now())

  @@id([riskId, assetId])
  @@index([assetId])
  @@map("risk_assets")
}

model RiskIncident {
  riskId     String   @db.Uuid
  incidentId String   @db.Uuid
  note       String?
  risk       RiskItem @relation(fields: [riskId], references: [id], onDelete: Cascade)
  incident   Incident @relation(fields: [incidentId], references: [id], onDelete: Restrict)
  createdAt  DateTime @default(now())

  @@id([riskId, incidentId])
  @@index([incidentId])
  @@map("risk_incidents")
}

model RiskControl {
  id            String            @id @default(uuid()) @db.Uuid
  riskId        String            @db.Uuid
  controlCode   String?           @db.VarChar(80)
  title         String            @db.VarChar(250)
  description   String?
  framework     String?           @db.VarChar(100)
  status        RiskControlStatus @default(PLANNED)
  effectiveness Int?
  evidence      String?
  risk          RiskItem          @relation(fields: [riskId], references: [id], onDelete: Cascade)
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  @@index([riskId, status])
  @@map("risk_controls")
}

model RiskTreatmentAction {
  id          String              @id @default(uuid()) @db.Uuid
  riskId      String              @db.Uuid
  title       String              @db.VarChar(250)
  description String?
  status      RiskTreatmentStatus @default(PLANNED)
  assigneeId  String              @db.Uuid
  dueDate     DateTime            @db.Date
  completedAt DateTime?
  progress    Int                 @default(0)
  outcome     String?
  createdBy   String              @db.Uuid
  risk        RiskItem            @relation(fields: [riskId], references: [id], onDelete: Cascade)
  assignee    User                @relation("RiskTreatmentAssignee", fields: [assigneeId], references: [id], onDelete: Restrict)
  creator     User                @relation("RiskTreatmentCreator", fields: [createdBy], references: [id], onDelete: Restrict)
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  @@index([riskId, status])
  @@index([assigneeId, dueDate, status])
  @@map("risk_treatment_actions")
}

model RiskReview {
  id           String             @id @default(uuid()) @db.Uuid
  assessmentId String?            @db.Uuid
  riskId       String?            @db.Uuid
  decision     RiskReviewDecision
  note         String
  reviewedBy   String             @db.Uuid
  assessment   RiskAssessment?    @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  risk         RiskItem?          @relation(fields: [riskId], references: [id], onDelete: Cascade)
  reviewer     User               @relation("RiskReviewer", fields: [reviewedBy], references: [id], onDelete: Restrict)
  createdAt    DateTime           @default(now())

  @@index([assessmentId, createdAt])
  @@index([riskId, createdAt])
  @@map("risk_reviews")
}

model ApplicationSetting {
  key       String   @id @db.VarChar(50)
  value     Json
  updatedBy String?  @db.Uuid
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("application_settings")
}

model AuditLog {
  id         BigInt   @id @default(autoincrement())
  userId     String?  @db.Uuid
  action     String
  entityType String
  entityId   String?  @db.Uuid
  oldValues  Json?
  newValues  Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  @@index([entityType, entityId, createdAt])
  @@map("audit_logs")
}

model Attachment {
  id           String   @id @default(uuid()) @db.Uuid
  entityType   String   @db.VarChar(30)
  entityId     String   @db.Uuid
  fileName     String
  originalName String
  mimeType     String
  fileSize     BigInt
  storagePath  String
  description  String?
  uploadedBy   String   @db.Uuid
  createdAt    DateTime @default(now())

  @@index([entityType, entityId])
  @@map("attachments")
}
```

## 5.4 Hướng dẫn Sử dụng Prisma Client Go trong Backend

Để làm việc với cơ sở dữ liệu trên Go bằng Prisma:

### 5.4.1 Cài đặt
Thêm Prisma Client Go generator vào dự án Go:
```bash
go get github.com/steebchen/prisma-client-go
```

### 5.4.2 Khởi chạy Code Generation
Prisma Client Go sẽ đọc file `schema.prisma` và tự động sinh mã nguồn API Go cực kỳ an toàn về mặt kiểu dữ liệu (strongly-typed):
```bash
go run github.com/steebchen/prisma-client-go generate
```

### 5.4.3 Kết nối Database & Thực thi query trong Go
Ví dụ khởi tạo và tìm kiếm Tài sản bằng Go:
```go
package main

import (
	"context"
	"fmt"
	"log"

	"github.com/steebchen/prisma-client-go/db"
)

func main() {
	client := db.NewClient()
	if err := client.Connect(); err != nil {
		log.Fatalf("Kết nối DB lỗi: %v", err)
	}
	defer func() {
		if err := client.Disconnect(); err != nil {
			panic(err)
		}
	}()

	ctx := context.Background()

	// Tìm kiếm tất cả tài sản có tag bắt đầu bằng 'TS'
	assets, err := client.Asset.FindMany(
		db.Asset.AssetTag.StartsWith("TS"),
	).With(
		db.Asset.Category.Fetch(),
		db.Asset.Status.Fetch(),
	).Exec(ctx)

	if err != nil {
		log.Fatalf("Query lỗi: %v", err)
	}

	for _, asset := range assets {
		fmt.Printf("Tài sản: %s, Danh mục: %s\n", asset.Name, asset.Category().Name)
	}
}
```
## 6. Xác thực & Phân quyền

### 6.1 Luồng xác thực

```
POST /api/v1/auth/login    → { username, password } → Set HttpOnly cookie + return user info
POST /api/v1/auth/logout   → Revoke session → Clear cookie
GET  /api/v1/auth/me       → Return current user info (from cookie/JWT)
PUT  /api/v1/auth/password → { oldPassword, newPassword } → Change password
```

### 6.2 Cơ chế Session
- Khi login thành công: tạo token ngẫu nhiên (32 bytes, base64url) → lưu SHA-256 hash vào bảng `auth_sessions` → trả token qua HttpOnly cookie `assetbase_session`.
- Mọi request tiếp theo: middleware đọc cookie → hash token → tìm session trong DB → kiểm tra `expiresAt` và `revokedAt` → inject user vào Gin context.
- Khi logout: đặt `revokedAt` cho session.

### 6.3 Chính sách mật khẩu
- Tối thiểu 8 ký tự
- Phải có: chữ thường, chữ hoa, số, ký tự đặc biệt
- Hash: bcrypt (cost = 12)

### 6.4 Phân quyền (RBAC đơn giản)

| Tài nguyên / Hành động | ADMIN | USER |
|-------------------------|-------|------|
| Quản lý danh mục (Department, Location, Category, ...) | ✅ CRUD | ❌ |
| Quản lý người dùng & nhân sự | ✅ CRUD | ❌ |
| Quản lý tài sản (CRUD) | ✅ | ❌ (chỉ xem tài sản được giao) |
| Cấp phát / Thu hồi / Điều chuyển / Bảo trì | ✅ | ❌ |
| Kiểm kê | ✅ Tạo/Quản lý | ❌ |
| Import hàng loạt | ✅ | ❌ |
| Sự cố - Tạo mới | ✅ | ✅ |
| Sự cố - Phân công / Xử lý / Đóng | ✅ | ❌ |
| Sự cố - Xem sự cố của mình | ✅ | ✅ |
| License/SSL/Domain | ✅ CRUD | ❌ (chỉ xem được giao) |
| Nhà cung cấp | ✅ CRUD | ❌ |
| Đánh giá rủi ro | ✅ CRUD | ❌ |
| Audit Log | ✅ Xem | ❌ |
| Dashboard | ✅ Toàn bộ | ✅ (giới hạn scope cá nhân) |

### 6.5 Tài khoản Admin khởi tạo
Khi API khởi động lần đầu và bảng `users` trống, tự động tạo:
- `employeeCode`: `ADMIN-001`
- `username`: `admin`
- `fullName`: `Quản trị viên`
- `email`: `admin@localhost`
- `role`: `ADMIN`
- `mustChangePassword`: `true`
- Password đọc từ biến `INITIAL_ADMIN_PASSWORD`

---

## 7. API Endpoints

### 7.1 Quy ước chung
- Base path: `/api/v1`
- Content-Type: `application/json`
- Pagination: query params `page` (default 1), `pageSize` (default 20, max 100)
- Sort: query param `sort` (e.g., `sort=createdAt:desc`)
- Filter: query params tùy endpoint (e.g., `status=ACTIVE`, `categoryId=xxx`)
- Response format:

```json
// Success (single)
{ "data": { ... } }

// Success (list)
{ "data": [...], "meta": { "page": 1, "pageSize": 20, "total": 150, "totalPages": 8 } }

// Error
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }
```

### 7.2 Catalog đầy đủ

#### Auth
```
POST   /api/v1/auth/login                     # Public
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
PUT    /api/v1/auth/password
```

#### Dashboard
```
GET    /api/v1/dashboard/summary               # Tổng quan: số tài sản, sự cố, license sắp hết hạn
GET    /api/v1/dashboard/assets-by-status       # Phân bổ tài sản theo trạng thái
GET    /api/v1/dashboard/assets-by-category     # Phân bổ tài sản theo danh mục
GET    /api/v1/dashboard/assets-by-department   # Phân bổ tài sản theo phòng ban
GET    /api/v1/dashboard/incidents-overview      # Sự cố theo trạng thái, SLA breach
GET    /api/v1/dashboard/expiring-entitlements   # License/SSL/Domain sắp hết hạn
```

#### Master Data (ADMIN only)
```
# Departments
GET    /api/v1/admin/departments
POST   /api/v1/admin/departments
PUT    /api/v1/admin/departments/:id
DELETE /api/v1/admin/departments/:id           # Soft deactivate

# Locations
GET    /api/v1/admin/locations
POST   /api/v1/admin/locations
PUT    /api/v1/admin/locations/:id
DELETE /api/v1/admin/locations/:id

# Warehouses
GET    /api/v1/admin/warehouses
POST   /api/v1/admin/warehouses
PUT    /api/v1/admin/warehouses/:id
DELETE /api/v1/admin/warehouses/:id

# Asset Categories
GET    /api/v1/admin/categories
POST   /api/v1/admin/categories
PUT    /api/v1/admin/categories/:id
DELETE /api/v1/admin/categories/:id

# Manufacturers
GET    /api/v1/admin/manufacturers
POST   /api/v1/admin/manufacturers
PUT    /api/v1/admin/manufacturers/:id
DELETE /api/v1/admin/manufacturers/:id

# Asset Models
GET    /api/v1/admin/models
POST   /api/v1/admin/models
PUT    /api/v1/admin/models/:id
DELETE /api/v1/admin/models/:id
```

#### Users & People (ADMIN only)
```
GET    /api/v1/admin/users
POST   /api/v1/admin/users
PUT    /api/v1/admin/users/:id
DELETE /api/v1/admin/users/:id
PUT    /api/v1/admin/users/:id/reset-password

GET    /api/v1/admin/people
POST   /api/v1/admin/people
PUT    /api/v1/admin/people/:id
DELETE /api/v1/admin/people/:id
```

#### Assets (ADMIN: full, USER: read own)
```
GET    /api/v1/assets                           # List with filters
GET    /api/v1/assets/:id                       # Detail
POST   /api/v1/assets                           # Create
PUT    /api/v1/assets/:id                       # Update
DELETE /api/v1/assets/:id                       # Soft delete
GET    /api/v1/assets/:id/history               # Lịch sử tài sản
GET    /api/v1/assets/:id/attachments           # File đính kèm
POST   /api/v1/assets/:id/attachments           # Upload file
```

#### Asset Lifecycle (ADMIN only)
```
# Assignments
GET    /api/v1/assignments
POST   /api/v1/assignments                      # Cấp phát / Cho mượn
GET    /api/v1/assignments/:id

# Returns
POST   /api/v1/assignments/:id/return           # Thu hồi (tạo AssetReturn, đóng Assignment)

# Transfers
GET    /api/v1/transfers
POST   /api/v1/transfers                        # Điều chuyển

# Maintenance
GET    /api/v1/maintenance
POST   /api/v1/maintenance                      # Mở phiếu bảo trì
PATCH  /api/v1/maintenance/:id                  # Cập nhật / Hoàn tất bảo trì
```

#### Inventory (ADMIN only)
```
GET    /api/v1/inventory
POST   /api/v1/inventory                        # Tạo phiên kiểm kê
GET    /api/v1/inventory/:id
GET    /api/v1/inventory/:id/items
PATCH  /api/v1/inventory/:id/items/:itemId       # Cập nhật kết quả scan
POST   /api/v1/inventory/:id/close               # Đóng phiên
POST   /api/v1/inventory/:id/cancel              # Hủy phiên
```

#### Import (ADMIN only)
```
POST   /api/v1/imports/upload                    # Upload CSV/Excel → staged
GET    /api/v1/imports
GET    /api/v1/imports/:id
GET    /api/v1/imports/:id/rows
POST   /api/v1/imports/:id/commit                # Commit batch
POST   /api/v1/imports/:id/rollback              # Rollback batch
```

#### Incidents (ADMIN: full, USER: create + view own)
```
GET    /api/v1/incidents
POST   /api/v1/incidents
GET    /api/v1/incidents/:id
PATCH  /api/v1/incidents/:id                     # Cập nhật trạng thái, thông tin
GET    /api/v1/incidents/:id/activities
POST   /api/v1/incidents/:id/activities           # Thêm ghi chú / log hoạt động
POST   /api/v1/incidents/:id/assignments          # Phân công nhân sự
```

#### Digital Entitlements (ADMIN only, USER: view assigned)
```
GET    /api/v1/entitlements
POST   /api/v1/entitlements
GET    /api/v1/entitlements/:id
PUT    /api/v1/entitlements/:id
DELETE /api/v1/entitlements/:id

# Assignments
POST   /api/v1/entitlements/:id/assignments       # Cấp phát license
PATCH  /api/v1/entitlements/:id/assignments/:aId  # Revoke

# Renewals
POST   /api/v1/entitlements/:id/renewals          # Ghi nhận gia hạn
GET    /api/v1/entitlements/:id/renewals

# Alerts
GET    /api/v1/renewal-alerts
PATCH  /api/v1/renewal-alerts/:id                  # Acknowledge / Dismiss

# Alert Policies
GET    /api/v1/renewal-policies
PUT    /api/v1/renewal-policies/:type              # Cập nhật chính sách cảnh báo
```

#### Vendors (ADMIN only)
```
GET    /api/v1/vendors
POST   /api/v1/vendors
GET    /api/v1/vendors/:id
PUT    /api/v1/vendors/:id
DELETE /api/v1/vendors/:id
```

#### Risk Assessment (ADMIN only)
```
GET    /api/v1/risk-assessments
POST   /api/v1/risk-assessments
GET    /api/v1/risk-assessments/:id

# Risk Items
POST   /api/v1/risk-assessments/:id/risks
GET    /api/v1/risk-assessments/:id/risks
PATCH  /api/v1/risk-assessments/risks/:riskId

# Controls
POST   /api/v1/risk-assessments/risks/:riskId/controls
PATCH  /api/v1/risk-assessments/controls/:controlId

# Treatment Actions
POST   /api/v1/risk-assessments/risks/:riskId/treatments
PATCH  /api/v1/risk-assessments/treatments/:treatmentId

# Reviews
POST   /api/v1/risk-assessments/:id/reviews           # Assessment-level review
POST   /api/v1/risk-assessments/risks/:riskId/reviews  # Risk-level review
```

#### System
```
GET    /api/v1/health/ready                     # Public - health check
GET    /api/v1/audit-logs                       # ADMIN only
GET    /api/v1/settings                         # ADMIN only
PUT    /api/v1/settings/:key                    # ADMIN only
```

---

## 8. Quy tắc Nghiệp vụ (Business Rules / Invariants)

### 8.1 Tài sản
1. `assetTag`, `serialNumber`, `barcode` phải duy nhất toàn hệ thống.
2. Chỉ tài sản có trạng thái `isAssignable = true` mới được phép cấp phát.
3. Một tài sản chỉ có **tối đa 1 assignment OPEN** tại mọi thời điểm.
4. Khi cấp phát: cập nhật `currentCustodianID`, `statusID` (→ IN_USE/ON_LOAN), `departmentID`, `locationID` trên bảng `assets` trong cùng 1 transaction.
5. Khi thu hồi: đóng assignment (CLOSED), tạo return record, xóa `currentCustodianID`, cập nhật status dựa trên `outcome` (READY/MAINTENANCE/BROKEN).
6. Khi điều chuyển: cập nhật `locationID`, `warehouseID` trên bảng `assets`.
7. Mọi thay đổi trạng thái phải ghi vào `asset_history`.
8. Soft delete (`deleted_at`): tài sản đã xóa không xuất hiện trong danh sách, nhưng vẫn giữ trong DB để truy vết.

### 8.2 Bảo trì
9. Khi mở phiếu bảo trì → status tài sản chuyển sang MAINTENANCE.
10. Khi hoàn tất bảo trì với outcome READY → status tài sản chuyển về READY.
11. Khi hoàn tất bảo trì với outcome DISPOSED → status tài sản chuyển sang DISPOSED.

### 8.3 Kiểm kê
12. Khi tạo phiên kiểm kê, hệ thống tự động populate `inventory_items` từ tài sản thuộc scope.
13. Phiên kiểm kê chỉ có thể CLOSE khi tất cả items đã được scan (result != PENDING).

### 8.4 Import
14. Upload → STAGED (validate từng row) → COMMIT (tạo assets trong transaction) hoặc ROLLBACK.
15. Nếu bất kỳ row nào lỗi khi commit, rollback toàn bộ batch.

### 8.5 Sự cố
16. SLA tự động tính toán dựa trên Priority: P1 = response 15 phút / resolve 4 giờ; P2 = 30 phút / 8 giờ; P3 = 4 giờ / 24 giờ; P4 = 8 giờ / 72 giờ.
17. Trạng thái chỉ đi theo luồng hợp lệ: NEW → ACKNOWLEDGED → IN_PROGRESS → MONITORING → RESOLVED → CLOSED. Có thể CANCELLED từ bất kỳ trạng thái nào trước CLOSED.

### 8.6 Digital Entitlements
18. `totalQuantity` >= tổng `quantity` của tất cả active assignments.
19. Khi gia hạn: cập nhật `expiryDate` trên entitlement và ghi renewal record.
20. Cảnh báo được sinh tự động bởi cron job (hoặc khi gọi API) dựa trên `warningDays` trong policy.

### 8.7 Risk Assessment
21. Lifecycle: DRAFT → IN_REVIEW → APPROVED → TREATMENT → MONITORING → CLOSED.
22. `inherentScore = likelihood × impact`. Tương tự cho `residualScore`.
23. `inherentLevel` / `residualLevel` tính từ score: 1-4 = LOW, 5-9 = MEDIUM, 10-16 = HIGH, 17-25 = CRITICAL.

---

## 9. Frontend Architecture

### 9.1 Routing (React Router v7)

```
/login                              # Trang đăng nhập
/                                   # Dashboard
/assets                             # Danh sách tài sản
/assets/:id                         # Chi tiết tài sản
/assets/new                         # Tạo tài sản mới (ADMIN)
/assignments                        # Danh sách cấp phát
/assignments/new                    # Tạo cấp phát (ADMIN)
/transfers                          # Danh sách điều chuyển
/maintenance                        # Danh sách bảo trì
/inventory                          # Danh sách phiên kiểm kê
/inventory/:id                      # Chi tiết phiên kiểm kê
/imports                            # Danh sách import
/imports/upload                     # Upload file import
/incidents                          # Danh sách sự cố
/incidents/:id                      # Chi tiết sự cố
/incidents/new                      # Tạo sự cố
/entitlements                       # Danh sách License/SSL/Domain
/entitlements/:id                   # Chi tiết entitlement
/vendors                            # Danh sách nhà cung cấp
/risk-assessments                   # Danh sách đánh giá rủi ro
/risk-assessments/:id               # Chi tiết assessment
/settings                           # Cài đặt hệ thống (ADMIN)
/settings/departments               # Quản lý phòng ban
/settings/locations                 # Quản lý vị trí
/settings/categories                # Quản lý danh mục
/settings/users                     # Quản lý người dùng
/settings/people                    # Quản lý nhân sự
/settings/renewal-policies          # Chính sách cảnh báo gia hạn
/audit-logs                         # Nhật ký hệ thống (ADMIN)
```

### 9.2 Layout
- **Sidebar**: Navigation chính, hiển thị menu tùy theo role
- **Header**: User avatar, tên, nút logout
- **Content area**: Route content
- **Breadcrumb**: Điều hướng theo cấu trúc trang

### 9.3 State Management
- **Server state**: TanStack Query (React Query) v5 — cache, refetch, optimistic updates
- **Client state**: Zustand hoặc React Context (chỉ cho auth state, theme)

---

## 10. Hướng dẫn Development

### 10.1 Khởi tạo dự án

```bash
# Backend
mkdir -p assetbase/apps/api
cd assetbase/apps/api
go mod init github.com/<org>/assetbase/apps/api

# Frontend
cd ../..
npm create vite@latest apps/web -- --template react-ts
cd apps/web && npm install
```

### 10.2 Chạy Development

```bash
# Terminal 1: Backend
cd apps/api
cp .env.example .env  # Chỉnh sửa DB credentials
go run cmd/server/main.go

# Terminal 2: Frontend
cd apps/web
npm run dev
```

### 10.3 Root Makefile

```makefile
.PHONY: dev dev-api dev-web build

dev:
	@make -j2 dev-api dev-web

dev-api:
	cd apps/api && go run cmd/server/main.go

dev-web:
	cd apps/web && npm run dev

build-api:
	cd apps/api && go build -o ../../bin/assetbase-api cmd/server/main.go

build-web:
	cd apps/web && npm run build

build: build-api build-web
```

---

## 11. Tổng hợp Database Schema (ERD tóm tắt)

Tổng cộng **35 bảng** (giảm từ 42 bảng của AssetFlow gốc):

| Nhóm | Bảng | Ghi chú |
|------|------|---------|
| Tổ chức | `departments`, `locations`, `warehouses` | Cây phân cấp (self-ref) |
| Người dùng | `users`, `auth_sessions`, `people` | Local auth only, 2 roles |
| Danh mục | `asset_categories`, `manufacturers`, `asset_models`, `asset_statuses` | Lookup tables |
| Tài sản | `assets` | Bảng trung tâm, soft delete |
| Vòng đời | `asset_assignments`, `asset_returns`, `asset_transfers`, `maintenance_records`, `asset_history` | Transaction-based |
| Kiểm kê | `inventory_sessions`, `inventory_items` | Scope-based |
| Import | `asset_import_batches`, `asset_import_rows` | Staged commit |
| Sự cố | `incidents`, `incident_assignments`, `incident_activities` | SLA tracking |
| Digital | `vendors`, `digital_entitlements`, `digital_assignments`, `digital_renewals` | License/SSL/Domain |
| Cảnh báo | `renewal_alert_policies`, `renewal_alerts` | Threshold-based |
| Rủi ro | `risk_assessments`, `risk_items`, `risk_assets`, `risk_incidents`, `risk_controls`, `risk_treatment_actions`, `risk_reviews` | ISO 27005 |
| Hệ thống | `audit_logs`, `attachments`, `application_settings` | Cross-cutting |

---

*Kết thúc tài liệu đặc tả. Phiên bản 1.0 — Ngày tạo: 2026-08-29*
