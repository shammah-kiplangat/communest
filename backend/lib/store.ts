import crypto from "node:crypto";

export type UserRole =
  | "communest_admin"
  | "estate_admin"
  | "tenant"
  | "regular_user";
export type EstateStatus = "pending" | "approved" | "denied";
export type MaintenanceStatus = "scheduled" | "in_progress" | "resolved";
export type PaymentStatus = "due" | "pending" | "confirmed";
export type HouseStatus = "vacant" | "occupied";
export type InquiryStatus = "pending" | "resolved";
export type ProposalStatus = "pending" | "approved" | "rejected";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  estateId?: string;
  profilePicture?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
}

export interface Estate {
  id: string;
  name: string;
  location: string;
  county: string;
  units: number;
  totalArea: number;
  description?: string;
  managementName: string;
  managementEmail: string;
  managementPhone: string;
  titleDeedNumber: string;
  estatePhoto: string;
  amenityPhotos: string[];
  status: EstateStatus;
  adminId: string;
  createdAt: string;
}

export interface House {
  id: string;
  estateId: string;
  houseNumber: string;
  totalArea: number;
  rooms: number;
  photos: string[];
  amenities: string[];
  rent: number;
  managerPhone: string;
  status: HouseStatus;
  occupiedAt?: string;
}

export interface Notification {
  id: string;
  estateId: string;
  title: string;
  eventDate: string;
  description: string;
  createdAt: string;
}

export interface MaintenanceItem {
  id: string;
  estateId: string;
  title: string;
  description: string;
  status: MaintenanceStatus;
  createdAt: string;
}

export interface Payment {
  id: string;
  estateId: string;
  tenantId: string;
  houseId: string;
  amount: number;
  type: "rent" | "water" | "electricity";
  status: PaymentStatus;
  dueDate: string;
  paidAt?: string;
}

export interface Inquiry {
  id: string;
  estateId: string;
  tenantId: string;
  houseId: string;
  message: string;
  reply?: string;
  status: InquiryStatus;
  createdAt: string;
  repliedAt?: string;
}

export interface RentalProposal {
  id: string;
  estateId: string;
  houseId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  status: ProposalStatus;
  createdAt: string;
}

export interface PaymentOption {
  id: string;
  estateId: string;
  method: string;
  details: string;
  createdAt: string;
}

const nowDate = () => new Date().toISOString().split("T")[0];

function generateId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

const users: User[] = [
  {
    id: "admin-1",
    fullName: "James Kariuki",
    email: "admin@communest.co.ke",
    phone: "+254712345678",
    password: "Admin@123456",
    role: "communest_admin",
    emailVerified: true,
    phoneVerified: true,
    createdAt: "2024-01-01",
  },
  {
    id: "estate-admin-1",
    fullName: "Grace Wanjiku",
    email: "grace@greenvalley.co.ke",
    phone: "+254723456789",
    password: "Estate@123456",
    role: "estate_admin",
    estateId: "estate-1",
    emailVerified: true,
    phoneVerified: true,
    createdAt: "2024-02-01",
  },
  {
    id: "tenant-1",
    fullName: "David Ochieng",
    email: "david@gmail.com",
    phone: "+254734567890",
    password: "Tenant@123456",
    role: "tenant",
    estateId: "estate-1",
    emailVerified: true,
    phoneVerified: false,
    createdAt: "2024-03-01",
  },
  {
    id: "user-1",
    fullName: "Mary Achieng",
    email: "mary@gmail.com",
    phone: "+254745678901",
    password: "User@1234567",
    role: "regular_user",
    emailVerified: false,
    phoneVerified: false,
    createdAt: "2024-04-01",
  },
];

const estates: Estate[] = [
  {
    id: "estate-1",
    name: "Green Valley",
    location: "Westlands",
    county: "Nairobi",
    units: 48,
    totalArea: 3200,
    description:
      "A modern gated community in the heart of Westlands, offering premium apartments with world-class amenities.",
    managementName: "Green Valley Mgmt",
    managementEmail: "grace@greenvalley.co.ke",
    managementPhone: "+254723456789",
    titleDeedNumber: "TNRD/NAIROBI/2018/12345",
    estatePhoto: "https://picsum.photos/seed/estate1/800/500",
    amenityPhotos: [
      "https://picsum.photos/seed/estate1a/400/300",
      "https://picsum.photos/seed/estate1b/400/300",
    ],
    status: "approved",
    adminId: "estate-admin-1",
    createdAt: "2024-02-15",
  },
  {
    id: "estate-2",
    name: "Sunset Gardens",
    location: "Karen",
    county: "Nairobi",
    units: 32,
    totalArea: 2800,
    description:
      "Serene estate set against the backdrop of the Ngong Hills, perfect for families seeking tranquility.",
    managementName: "Sunset Properties Ltd",
    managementEmail: "info@sunsetgardens.co.ke",
    managementPhone: "+254756789012",
    titleDeedNumber: "TNRD/NAIROBI/2019/67890",
    estatePhoto: "https://picsum.photos/seed/estate2/800/500",
    amenityPhotos: [],
    status: "approved",
    adminId: "estate-admin-1",
    createdAt: "2024-03-10",
  },
];

const houses: House[] = [
  {
    id: "house-1",
    estateId: "estate-1",
    houseNumber: "A101",
    totalArea: 85,
    rooms: 2,
    photos: ["https://picsum.photos/seed/house1/600/400"],
    amenities: ["WiFi", "Parking", "Swimming Pool"],
    rent: 45000,
    managerPhone: "+254723456789",
    status: "vacant",
  },
  {
    id: "house-2",
    estateId: "estate-1",
    houseNumber: "B201",
    totalArea: 120,
    rooms: 3,
    photos: ["https://picsum.photos/seed/house2/600/400"],
    amenities: ["WiFi", "Parking", "Gym"],
    rent: 75000,
    managerPhone: "+254723456789",
    status: "occupied",
    occupiedAt: "2024-06-01",
  },
  {
    id: "house-3",
    estateId: "estate-2",
    houseNumber: "C101",
    totalArea: 90,
    rooms: 2,
    photos: ["https://picsum.photos/seed/house3/600/400"],
    amenities: ["WiFi", "Garden", "Security"],
    rent: 55000,
    managerPhone: "+254756789012",
    status: "vacant",
  },
];

const notifications: Notification[] = [
  {
    id: "n1",
    estateId: "estate-1",
    title: "Annual Residents Meeting",
    eventDate: "2024-07-25T14:00",
    description:
      "All residents are invited to the annual meeting at the clubhouse.",
    createdAt: "2024-07-10",
  },
];

const maintenanceItems: MaintenanceItem[] = [
  {
    id: "m1",
    estateId: "estate-1",
    title: "Elevator Servicing",
    description: "Routine maintenance of all three elevators in Block A and B.",
    status: "in_progress",
    createdAt: "2024-07-10",
  },
];

const payments: Payment[] = [
  {
    id: "p1",
    estateId: "estate-1",
    tenantId: "tenant-1",
    houseId: "B201",
    amount: 75000,
    type: "rent",
    status: "due",
    dueDate: "2024-07-31",
  },
];

const inquiries: Inquiry[] = [
  {
    id: "inq-1",
    estateId: "estate-1",
    tenantId: "tenant-1",
    houseId: "B201",
    message: "The air conditioning unit is not working.",
    status: "pending",
    createdAt: "2024-07-13T08:22:00.000Z",
  },
];

const proposals: RentalProposal[] = [
  {
    id: "prop-1",
    estateId: "estate-1",
    houseId: "A101",
    applicantName: "Test Applicant",
    applicantEmail: "test@example.com",
    applicantPhone: "+254700000000",
    status: "pending",
    createdAt: "2024-07-14",
  },
];

const paymentOptions: PaymentOption[] = [
  {
    id: "po1",
    estateId: "estate-1",
    method: "M-Pesa Till",
    details: "Till No: 123456 | Green Valley Management",
    createdAt: "2024-01-01",
  },
];

export const store = {
  users,
  estates,
  houses,
  notifications,
  maintenanceItems,
  payments,
  inquiries,
  proposals,
  paymentOptions,

  getUserByEmail(email: string) {
    return clone(
      users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null,
    );
  },

  getUserById(id: string) {
    return clone(users.find((u) => u.id === id) ?? null);
  },

  addUser(user: Omit<User, "id" | "createdAt">) {
    const newUser: User = {
      ...user,
      id: generateId("user"),
      createdAt: nowDate(),
    };
    users.push(newUser);
    return clone(newUser);
  },

  updateUser(id: string, updates: Partial<Omit<User, "id" | "createdAt">>) {
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    return clone(users[idx]);
  },

  getEstates() {
    return clone(estates);
  },

  getEstateById(id: string) {
    return clone(estates.find((e) => e.id === id) ?? null);
  },

  addEstate(data: Omit<Estate, "id" | "createdAt" | "status">) {
    const estate: Estate = {
      ...data,
      id: generateId("estate"),
      createdAt: nowDate(),
      status: "pending",
    };
    estates.push(estate);
    return clone(estate);
  },

  updateEstate(id: string, updates: Partial<Omit<Estate, "id" | "createdAt">>) {
    const idx = estates.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    estates[idx] = { ...estates[idx], ...updates };
    return clone(estates[idx]);
  },

  getHouses() {
    return clone(houses);
  },

  getHouseById(id: string) {
    return clone(houses.find((h) => h.id === id) ?? null);
  },

  addHouse(data: Omit<House, "id">) {
    const house: House = { ...data, id: generateId("house") };
    houses.push(house);
    return clone(house);
  },

  updateHouse(id: string, updates: Partial<Omit<House, "id">>) {
    const idx = houses.findIndex((h) => h.id === id);
    if (idx === -1) return null;
    houses[idx] = { ...houses[idx], ...updates };
    return clone(houses[idx]);
  },

  deleteHouse(id: string) {
    const idx = houses.findIndex((h) => h.id === id);
    if (idx === -1) return false;
    houses.splice(idx, 1);
    return true;
  },

  getNotifications() {
    return clone(notifications);
  },

  addNotification(data: Omit<Notification, "id" | "createdAt">) {
    const notification: Notification = {
      ...data,
      id: generateId("n"),
      createdAt: nowDate(),
    };
    notifications.push(notification);
    return clone(notification);
  },

  deleteNotification(id: string) {
    const idx = notifications.findIndex((n) => n.id === id);
    if (idx === -1) return false;
    notifications.splice(idx, 1);
    return true;
  },

  getMaintenance() {
    return clone(maintenanceItems);
  },

  addMaintenance(data: Omit<MaintenanceItem, "id" | "createdAt">) {
    const item: MaintenanceItem = {
      ...data,
      id: generateId("m"),
      createdAt: nowDate(),
    };
    maintenanceItems.push(item);
    return clone(item);
  },

  updateMaintenance(id: string, updates: Partial<Omit<MaintenanceItem, "id">>) {
    const idx = maintenanceItems.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    maintenanceItems[idx] = { ...maintenanceItems[idx], ...updates };
    return clone(maintenanceItems[idx]);
  },

  deleteMaintenance(id: string) {
    const idx = maintenanceItems.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    maintenanceItems.splice(idx, 1);
    return true;
  },

  getPayments() {
    return clone(payments);
  },

  addPayment(data: Omit<Payment, "id">) {
    const payment: Payment = { ...data, id: generateId("pay") };
    payments.push(payment);
    return clone(payment);
  },

  updatePayment(id: string, updates: Partial<Omit<Payment, "id">>) {
    const idx = payments.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    payments[idx] = { ...payments[idx], ...updates };
    return clone(payments[idx]);
  },

  getInquiries() {
    return clone(inquiries);
  },

  addInquiry(data: Omit<Inquiry, "id" | "createdAt" | "status">) {
    const inquiry: Inquiry = {
      ...data,
      id: generateId("inq"),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    inquiries.push(inquiry);
    return clone(inquiry);
  },

  updateInquiry(id: string, updates: Partial<Omit<Inquiry, "id">>) {
    const idx = inquiries.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    inquiries[idx] = { ...inquiries[idx], ...updates };
    return clone(inquiries[idx]);
  },

  getProposals() {
    return clone(proposals);
  },

  addProposal(data: Omit<RentalProposal, "id" | "createdAt" | "status">) {
    const proposal: RentalProposal = {
      ...data,
      id: generateId("prop"),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    proposals.push(proposal);
    return clone(proposal);
  },

  updateProposal(id: string, updates: Partial<Omit<RentalProposal, "id">>) {
    const idx = proposals.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    proposals[idx] = { ...proposals[idx], ...updates };
    return clone(proposals[idx]);
  },

  getPaymentOptions() {
    return clone(paymentOptions);
  },

  addPaymentOption(data: Omit<PaymentOption, "id" | "createdAt">) {
    const option: PaymentOption = {
      ...data,
      id: generateId("po"),
      createdAt: nowDate(),
    };
    paymentOptions.push(option);
    return clone(option);
  },

  deletePaymentOption(id: string) {
    const idx = paymentOptions.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    paymentOptions.splice(idx, 1);
    return true;
  },
};
