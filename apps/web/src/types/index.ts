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
