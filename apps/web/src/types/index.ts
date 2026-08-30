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
