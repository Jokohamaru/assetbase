export type AssetStatus = 'Đang sử dụng' | 'Sẵn sàng' | 'Bảo trì' | 'Hỏng'

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  serialNumber?: string;
  barcode?: string;
  categoryId: string;
  modelId?: string;
  manufacturerId?: string;
  statusId: string;
  assignedUserId?: string;
  currentCustodianId?: string;
  departmentId?: string;
  locationId?: string;
  warehouseId?: string;
  purchaseCost?: number;
  purchaseDate?: string;
  
  // Relations (optional for partial updates)
  category?: any;
  status?: any;
  department?: any;
  location?: any;
  currentCustodian?: any;
}

export type TransactionType = 'Nhập kho' | 'Cấp phát' | 'Cho mượn' | 'Thu hồi' | 'Điều chuyển'

export interface AssetTransaction {
  id: number
  assetId: number
  assetCode: string
  assetName: string
  type: TransactionType
  from: string
  to: string
  performedBy: string
  date: string
  note: string
  condition?: string
  dueDate?: string
  recipientEmail?: string
}

export interface Department {
  id: number
  name: string
  code: string
  manager: string
  isIncidentResponseTeam?: boolean
}

export interface Site {
  id: number
  name: string
  code: string
  address: string
}

export interface EmailSettings {
  senderName: string
  replyTo: string
  cc: string
  subjectTemplate: string
}

export interface BrandingSettings {
  appName: string
  companyName: string
  companyAddress: string
  handoverDepartment: string
  handoverFormCode: string
  tagline: string
  primaryColor: string
  logoDataUrl: string
}

export interface RegionalSettings {
  language: string
  timezone: string
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  timeFormat: '24h' | '12h'
  firstDayOfWeek: 'monday' | 'sunday'
}

export type UserRole = 'Admin' | 'IT' | 'HCNS'

export interface AppUser {
  id: number | string
  username: string
  password?: string
  name: string
  email: string
  role: UserRole
  departmentScope: string[]
  mustChangePassword?: boolean
}

export interface InventorySession {
  id: string;
  inventoryNo: string;
  name: string;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  scopeDepartmentId?: string;
  scopeLocationId?: string;
  scopeWarehouseId?: string;
  scopeCategoryId?: string;
  startedAt: string;
  closedAt?: string;
  createdBy: string;
  items?: InventoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  sessionId: string;
  assetId: string;
  asset?: Asset;
  expectedLocationId?: string;
  expectedCustodianId?: string;
  observedLocationId?: string;
  observedCustodianId?: string;
  scannedAt?: string;
  scannedBy?: string;
  result: 'PENDING' | 'MATCHED' | 'MISSING' | 'UNEXPECTED' | 'LOCATION_MISMATCH';
  note?: string;
}

export interface ImportRowError {
  field: string;
  message: string;
}

export interface ImportAssetRow {
  assetTag: string;
  name: string;
  serialNumber?: string;
  barcode?: string;
  categoryCode: string;
  modelName?: string;
  manufacturerName?: string;
  departmentCode?: string;
  locationCode?: string;
  warehouseCode?: string;
  statusCode: string;
  purchaseCost?: number;
  purchaseDate?: string;
  warrantyExpiryDate?: string;
}

export interface AssetImportBatch {
  id: string;
  sourceFileName: string;
  status: 'STAGED' | 'COMMITTED' | 'ROLLED_BACK' | 'ROLLBACK_FAILED';
  totalRows: number;
  validRows: number;
  invalidRows: number;
  committedRows: number;
  createdAt: string;
  createdBy: string;
}

export interface AssetImportRow {
  id: string;
  batchId: string;
  rowNumber: number;
  payload: ImportAssetRow;
  status: 'PENDING' | 'VALID' | 'INVALID' | 'COMMITTED';
  errors: ImportRowError[];
}

export interface IncidentActivity {
  id: string;
  type: string;
  note: string;
  fromStatus?: string;
  toStatus?: string;
  performedBy: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  incidentNo: string;
  title: string;
  category: string;
  status: 'NEW' | 'IN_PROGRESS' | 'ON_HOLD' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  impact: string;
  urgency: string;
  description: string;
  reporterName: string;
  reportedAt: string;
  slaResponseDueAt: string;
  slaResolutionDueAt: string;
  responseStartedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  assignedToId?: string;
  assignedDepartmentId?: string;
  activities?: IncidentActivity[];
}

export type DigitalEntitlementType = 'SOFTWARE' | 'SSL' | 'DOMAIN' | 'OTHER';

export interface DigitalEntitlement {
  id: string;
  code: string;
  name: string;
  type: DigitalEntitlementType;
  productName?: string;
  edition?: string;
  subscriptionIdentifier?: string;
  domainName?: string;
  commonName?: string;
  registrar?: string;
  issuer?: string;
  licenseMetric?: string;
  totalQuantity: number;
  startDate?: string;
  expiryDate?: string;
  autoRenew: boolean;
  renewalPeriodMonths?: number;
  purchaseCost?: number;
  renewalCost?: number;
  currency: string;
  purchaseOrderNo?: string;
  contractNo?: string;
  managementUrl?: string;
  notes?: string;
  vendorId?: string;
  ownerDepartmentId?: string;
  createdAt: string;
  
  assignments?: DigitalAssignment[];
  renewals?: DigitalRenewal[];
}

export interface DigitalAssignment {
  id: string;
  entitlementId: string;
  personId?: string;
  assetId?: string;
  departmentId?: string;
  quantity: number;
  assignedAt: string;
  assignmentNote?: string;
  status: 'ACTIVE' | 'REVOKED';
  revokedAt?: string;
  revokeReason?: string;
}

export interface DigitalRenewal {
  id: string;
  entitlementId: string;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  previousExpiryDate: string;
  newExpiryDate: string;
  renewalDate: string;
  amount?: number;
  currency: string;
  purchaseOrderNo?: string;
  invoiceNo?: string;
  notes?: string;
  createdAt: string;
}
