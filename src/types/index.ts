export type UserRole = 'communest_admin' | 'estate_admin' | 'tenant' | 'regular_user'

export interface User {
  id: string
  fullName: string
  email: string
  phone: string
  role: UserRole
  estateId?: string
  profilePicture?: string
  emailVerified: boolean
  phoneVerified: boolean
  createdAt: string
}

export type EstateStatus = 'pending' | 'approved' | 'denied'
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'resolved'
export type PaymentStatus = 'due' | 'pending' | 'confirmed'
export type HouseStatus = 'vacant' | 'occupied'
export type InquiryStatus = 'pending' | 'resolved'

export interface Estate {
  id: string
  name: string
  location: string
  county: string
  units: number
  totalArea: number
  description?: string
  managementName: string
  managementEmail: string
  managementPhone: string
  titleDeedNumber: string
  estatePhoto: string
  amenityPhotos: string[]
  status: EstateStatus
  adminId: string
  createdAt: string
}

export interface House {
  id: string
  estateId: string
  houseNumber: string
  totalArea: number
  rooms: number
  photos: string[]
  amenities: string[]
  rent: number
  managerPhone: string
  status: HouseStatus
  occupiedAt?: string
}

export interface Notification {
  id: string
  estateId: string
  title: string
  eventDate: string
  description: string
  createdAt: string
}

export interface MaintenanceItem {
  id: string
  estateId: string
  title: string
  description: string
  status: MaintenanceStatus
  createdAt: string
}

export interface Payment {
  id: string
  estateId: string
  tenantId: string
  houseId: string
  amount: number
  type: 'rent' | 'water' | 'electricity'
  status: PaymentStatus
  dueDate: string
  paidAt?: string
}

export interface Inquiry {
  id: string
  estateId: string
  tenantId: string
  houseId: string
  message: string
  reply?: string
  status: InquiryStatus
  createdAt: string
  repliedAt?: string
}

export interface RentalProposal {
  id: string
  estateId: string
  houseId: string
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface PaymentOption {
  id: string
  estateId: string
  method: string
  details: string
  createdAt: string
}
