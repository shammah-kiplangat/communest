import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { apiRequest } from "../utils/api";
import type {
  Estate,
  House,
  Notification,
  MaintenanceItem,
  Payment,
  Inquiry,
  RentalProposal,
  PaymentOption,
  EstateStatus,
  MaintenanceStatus,
  HouseStatus,
  User,
} from "../types";

interface DataContextType {
  estates: Estate[];
  houses: House[];
  notifications: Notification[];
  maintenanceItems: MaintenanceItem[];
  payments: Payment[];
  inquiries: Inquiry[];
  proposals: RentalProposal[];
  paymentOptions: PaymentOption[];
  addEstate: (estate: Omit<Estate, "id" | "createdAt" | "status">) => string;
  updateEstateStatus: (id: string, status: EstateStatus) => void;
  updateEstatePhoto: (id: string, photo: string) => void;
  addHouse: (house: Omit<House, "id">) => void;
  updateHouseStatus: (id: string, status: HouseStatus) => void;
  addNotification: (n: Omit<Notification, "id" | "createdAt">) => void;
  deleteNotification: (id: string) => void;
  addMaintenance: (m: Omit<MaintenanceItem, "id" | "createdAt">) => void;
  updateMaintenanceStatus: (id: string, status: MaintenanceStatus) => void;
  deleteMaintenance: (id: string) => void;
  addPaymentOption: (opt: Omit<PaymentOption, "id" | "createdAt">) => void;
  removePaymentOption: (id: string) => void;
  updatePaymentStatus: (id: string, status: "confirmed") => void;
  addInquiry: (inq: Omit<Inquiry, "id" | "createdAt" | "status">) => void;
  replyInquiry: (id: string, reply: string) => void;
  addProposal: (p: Omit<RentalProposal, "id" | "createdAt" | "status">) => void;
  approveProposal: (id: string) => void;
  rejectProposal: (id: string) => void;
  promoteToAdmin: (userId: string, estateId: string) => void;
}

const DATA_VERSION = "v5";
const VERSION_KEY = "communest_data_version";

// Wipe stale localStorage if the data version has changed
if (
  typeof window !== "undefined" &&
  localStorage.getItem(VERSION_KEY) !== DATA_VERSION
) {
  const keysToClear = [
    "communest_estates",
    "communest_houses",
    "communest_notifications",
    "communest_maintenance",
    "communest_payments",
    "communest_inquiries",
    "communest_proposals",
    "communest_payment_options",
    "communest_users",
    "communest_current_user",
  ];
  keysToClear.forEach((k) => localStorage.removeItem(k));
  localStorage.setItem(VERSION_KEY, DATA_VERSION);
}

const STORAGE_KEY = "communest_current_user";

const KEYS = {
  estates: "communest_estates",
  houses: "communest_houses",
  notifications: "communest_notifications",
  maintenance: "communest_maintenance",
  payments: "communest_payments",
  inquiries: "communest_inquiries",
  proposals: "communest_proposals",
  paymentOptions: "communest_payment_options",
};

// ── Kilimani Court seed (estate-5) ─────────────────────────────────────────

const KILIMANI_HOUSES: House[] = [
  {
    id: "kh-1",
    estateId: "estate-5",
    houseNumber: "K101",
    totalArea: 85,
    rooms: 2,
    photos: ["https://picsum.photos/seed/kh1/600/400"],
    amenities: ["WiFi", "Parking", "Balcony"],
    rent: 55000,
    managerPhone: "+254756789012",
    status: "occupied",
    occupiedAt: "2024-04-01",
  },
  {
    id: "kh-2",
    estateId: "estate-5",
    houseNumber: "K102",
    totalArea: 60,
    rooms: 1,
    photos: ["https://picsum.photos/seed/kh2/600/400"],
    amenities: ["WiFi", "Security"],
    rent: 32000,
    managerPhone: "+254756789012",
    status: "occupied",
    occupiedAt: "2024-04-10",
  },
  {
    id: "kh-3",
    estateId: "estate-5",
    houseNumber: "K103",
    totalArea: 120,
    rooms: 3,
    photos: ["https://picsum.photos/seed/kh3/600/400"],
    amenities: ["WiFi", "Parking", "Gym", "Balcony", "Swimming Pool"],
    rent: 85000,
    managerPhone: "+254756789012",
    status: "occupied",
    occupiedAt: "2024-04-18",
  },
  {
    id: "kh-4",
    estateId: "estate-5",
    houseNumber: "K201",
    totalArea: 85,
    rooms: 2,
    photos: ["https://picsum.photos/seed/kh4/600/400"],
    amenities: ["WiFi", "Parking"],
    rent: 55000,
    managerPhone: "+254756789012",
    status: "occupied",
    occupiedAt: "2024-05-01",
  },
  {
    id: "kh-5",
    estateId: "estate-5",
    houseNumber: "K202",
    totalArea: 65,
    rooms: 1,
    photos: ["https://picsum.photos/seed/kh5/600/400"],
    amenities: ["WiFi", "Security"],
    rent: 32000,
    managerPhone: "+254756789012",
    status: "occupied",
    occupiedAt: "2024-05-03",
  },
  {
    id: "kh-6",
    estateId: "estate-5",
    houseNumber: "K203",
    totalArea: 110,
    rooms: 3,
    photos: ["https://picsum.photos/seed/kh6/600/400"],
    amenities: ["WiFi", "Parking", "Balcony", "Gym"],
    rent: 78000,
    managerPhone: "+254756789012",
    status: "occupied",
    occupiedAt: "2024-05-10",
  },
  {
    id: "kh-7",
    estateId: "estate-5",
    houseNumber: "K301",
    totalArea: 75,
    rooms: 2,
    photos: ["https://picsum.photos/seed/kh7/600/400"],
    amenities: ["WiFi", "Parking", "Security"],
    rent: 48000,
    managerPhone: "+254756789012",
    status: "occupied",
    occupiedAt: "2024-05-15",
  },
  {
    id: "kh-8",
    estateId: "estate-5",
    houseNumber: "K302",
    totalArea: 60,
    rooms: 1,
    photos: ["https://picsum.photos/seed/kh8/600/400"],
    amenities: ["WiFi"],
    rent: 30000,
    managerPhone: "+254756789012",
    status: "occupied",
    occupiedAt: "2024-05-20",
  },
  {
    id: "kh-9",
    estateId: "estate-5",
    houseNumber: "K303",
    totalArea: 95,
    rooms: 2,
    photos: ["https://picsum.photos/seed/kh9/600/400"],
    amenities: ["WiFi", "Parking", "Balcony"],
    rent: 62000,
    managerPhone: "+254756789012",
    status: "occupied",
    occupiedAt: "2024-06-01",
  },
  {
    id: "kh-10",
    estateId: "estate-5",
    houseNumber: "K401",
    totalArea: 140,
    rooms: 4,
    photos: ["https://picsum.photos/seed/kh10/600/400"],
    amenities: ["WiFi", "Parking", "Gym", "Balcony", "Swimming Pool", "Garden"],
    rent: 110000,
    managerPhone: "+254756789012",
    status: "occupied",
    occupiedAt: "2024-06-05",
  },
  {
    id: "kh-11",
    estateId: "estate-5",
    houseNumber: "K402",
    totalArea: 85,
    rooms: 2,
    photos: ["https://picsum.photos/seed/kh11/600/400"],
    amenities: ["WiFi", "Parking"],
    rent: 55000,
    managerPhone: "+254756789012",
    status: "occupied",
    occupiedAt: "2024-06-10",
  },
  {
    id: "kh-12",
    estateId: "estate-5",
    houseNumber: "K403",
    totalArea: 70,
    rooms: 1,
    photos: ["https://picsum.photos/seed/kh12/600/400"],
    amenities: ["WiFi", "Security"],
    rent: 35000,
    managerPhone: "+254756789012",
    status: "occupied",
    occupiedAt: "2024-06-15",
  },
];

const KILIMANI_NOTIFICATIONS: Notification[] = [
  {
    id: "kn-1",
    estateId: "estate-5",
    title: "Monthly Rent Due — July 2026",
    eventDate: "2026-07-31T23:59",
    description:
      "Friendly reminder that July rent is due by 31st July 2026. Please use the M-Pesa Till or bank transfer details provided. Avoid late payment penalties.",
    createdAt: "2026-07-01",
  },
  {
    id: "kn-2",
    estateId: "estate-5",
    title: "CCTV Upgrade in Progress",
    eventDate: "2026-07-16T09:00",
    description:
      "Our security team will be installing new CCTV cameras on all floors and at the gate on Wednesday 16th July. Kindly allow the technicians access to common areas. This will enhance security for all residents.",
    createdAt: "2026-07-12",
  },
  {
    id: "kn-3",
    estateId: "estate-5",
    title: "Residents Association Meeting",
    eventDate: "2026-07-20T15:00",
    description:
      "All residents are invited to the quarterly residents association meeting on Sunday 20th July at 3:00 PM in the ground floor boardroom. Agenda: service charge review, guest parking policy, landscaping proposal.",
    createdAt: "2026-07-10",
  },
  {
    id: "kn-4",
    estateId: "estate-5",
    title: "Water Pump Maintenance — Brief Outage",
    eventDate: "2026-07-18T07:00",
    description:
      "Water supply will be briefly interrupted on Friday 18th July from 7:00 AM to 10:00 AM for scheduled pump maintenance. Please store water in advance. We apologise for the inconvenience.",
    createdAt: "2026-07-14",
  },
];

const KILIMANI_MAINTENANCE: MaintenanceItem[] = [
  {
    id: "km-1",
    estateId: "estate-5",
    title: "CCTV Camera Installation",
    description:
      "Installing 16 new HD CCTV cameras across all floors, the car park, and the main gate. Contractor: SafeGuard Kenya Ltd.",
    status: "in_progress",
    createdAt: "2026-07-12",
  },
  {
    id: "km-2",
    estateId: "estate-5",
    title: "Electric Gate Automation",
    description:
      "Replacing manual gate with automated boom barrier and intercom system. Improves access control for all residents and visitors.",
    status: "scheduled",
    createdAt: "2026-07-10",
  },
  {
    id: "km-3",
    estateId: "estate-5",
    title: "K202 Plumbing Leak — Fixed",
    description:
      "Burst pipe under the kitchen sink in unit K202 was repaired on 5th July. Resident confirmed no further leaking. Damage to cabinet was also repaired.",
    status: "resolved",
    createdAt: "2026-07-03",
  },
  {
    id: "km-4",
    estateId: "estate-5",
    title: "Common Area LED Lighting Upgrade",
    description:
      "Replacing all corridor and stairwell fluorescent lights with energy-saving LED fittings on all four floors. Expected 40% savings on common area electricity.",
    status: "in_progress",
    createdAt: "2026-07-08",
  },
  {
    id: "km-5",
    estateId: "estate-5",
    title: "Rooftop Waterproofing — Block K4",
    description:
      "Scheduled waterproofing of the Block K4 rooftop to prevent the seepage reported by K401 residents during the long rains. Contractor assessment done.",
    status: "scheduled",
    createdAt: "2026-07-11",
  },
  {
    id: "km-6",
    estateId: "estate-5",
    title: "Gym Equipment Servicing",
    description:
      "Annual servicing of all treadmills, weights bench, and cycling machines in the gym. Two treadmills sent to workshop for belt replacement.",
    status: "resolved",
    createdAt: "2026-06-28",
  },
];

const KILIMANI_PAYMENTS: Payment[] = [
  // tenant-3 (Brian - K101)
  {
    id: "kp-1",
    estateId: "estate-5",
    tenantId: "tenant-3",
    houseId: "kh-1",
    amount: 55000,
    type: "rent",
    status: "due",
    dueDate: "2026-07-31",
  },
  {
    id: "kp-2",
    estateId: "estate-5",
    tenantId: "tenant-3",
    houseId: "kh-1",
    amount: 1500,
    type: "water",
    status: "confirmed",
    dueDate: "2026-06-30",
    paidAt: "2026-06-27T10:32:00.000Z",
  },
  {
    id: "kp-3",
    estateId: "estate-5",
    tenantId: "tenant-3",
    houseId: "kh-1",
    amount: 2800,
    type: "electricity",
    status: "confirmed",
    dueDate: "2026-06-30",
    paidAt: "2026-06-27T10:45:00.000Z",
  },
  // tenant-4 (Susan - K102)
  {
    id: "kp-4",
    estateId: "estate-5",
    tenantId: "tenant-4",
    houseId: "kh-2",
    amount: 32000,
    type: "rent",
    status: "due",
    dueDate: "2026-07-31",
  },
  {
    id: "kp-5",
    estateId: "estate-5",
    tenantId: "tenant-4",
    houseId: "kh-2",
    amount: 900,
    type: "water",
    status: "confirmed",
    dueDate: "2026-06-30",
    paidAt: "2026-06-29T14:10:00.000Z",
  },
  {
    id: "kp-6",
    estateId: "estate-5",
    tenantId: "tenant-4",
    houseId: "kh-2",
    amount: 1600,
    type: "electricity",
    status: "due",
    dueDate: "2026-07-15",
  },
  // tenant-5 (Joseph - K103)
  {
    id: "kp-7",
    estateId: "estate-5",
    tenantId: "tenant-5",
    houseId: "kh-3",
    amount: 85000,
    type: "rent",
    status: "confirmed",
    dueDate: "2026-07-31",
    paidAt: "2026-07-02T09:15:00.000Z",
  },
  {
    id: "kp-8",
    estateId: "estate-5",
    tenantId: "tenant-5",
    houseId: "kh-3",
    amount: 2200,
    type: "water",
    status: "due",
    dueDate: "2026-07-15",
  },
  {
    id: "kp-9",
    estateId: "estate-5",
    tenantId: "tenant-5",
    houseId: "kh-3",
    amount: 4500,
    type: "electricity",
    status: "confirmed",
    dueDate: "2026-06-30",
    paidAt: "2026-06-30T16:00:00.000Z",
  },
];

const KILIMANI_INQUIRIES: Inquiry[] = [
  {
    id: "ki-1",
    estateId: "estate-5",
    tenantId: "tenant-3",
    houseId: "kh-1",
    message:
      "The air conditioning unit in K101 has stopped cooling. It turns on but only blows warm air. This has been an issue for the past 3 days — please send a technician as soon as possible.",
    status: "pending",
    createdAt: "2026-07-13T08:22:00.000Z",
  },
  {
    id: "ki-2",
    estateId: "estate-5",
    tenantId: "tenant-4",
    houseId: "kh-2",
    message:
      "I would like to request an additional parking slot for a second vehicle. My family has recently acquired a new car and we have no space in the designated area for K102.",
    reply:
      "Hi Susan, thank you for reaching out. We do have one reserved visitor slot that can be assigned to K102 on a semi-permanent basis. Please come to the management office this week to sign the parking allocation form. Monthly fee will be KES 2,000.",
    status: "resolved",
    createdAt: "2026-07-08T11:45:00.000Z",
    repliedAt: "2026-07-09T09:30:00.000Z",
  },
  {
    id: "ki-3",
    estateId: "estate-5",
    tenantId: "tenant-5",
    houseId: "kh-3",
    message:
      "My gate remote control stopped working this morning. I have tried replacing the battery but it still doesn't open the gate. Could maintenance look into this or issue a replacement remote?",
    reply:
      "Hi Joseph, apologies for the inconvenience. The gate system was reconfigured during last week's security upgrade, which reset the remote pairing. Please bring your remote to the caretaker's office and we will re-pair it free of charge. This takes about 5 minutes.",
    status: "resolved",
    createdAt: "2026-07-11T07:10:00.000Z",
    repliedAt: "2026-07-11T10:55:00.000Z",
  },
];

const KILIMANI_PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: "kpo-1",
    estateId: "estate-5",
    method: "M-Pesa Till",
    details: "Till No: 123456 | Kilimani Court Management",
    createdAt: "2024-02-15",
  },
  {
    id: "kpo-2",
    estateId: "estate-5",
    method: "KCB Bank Transfer",
    details: "KCB Bank Kilimani | Acc: 0012345678 | Branch: Kilimani",
    createdAt: "2024-02-15",
  },
];

const KILIMANI_PROPOSALS: RentalProposal[] = [
  {
    id: "kpr-1",
    estateId: "estate-5",
    houseId: "kh-1",
    applicantName: "Brian Njoroge",
    applicantEmail: "brian@gmail.com",
    applicantPhone: "+254711223344",
    status: "approved",
    createdAt: "2024-03-28",
  },
  {
    id: "kpr-2",
    estateId: "estate-5",
    houseId: "kh-2",
    applicantName: "Susan Kamau",
    applicantEmail: "susan@email.com",
    applicantPhone: "+254722334455",
    status: "approved",
    createdAt: "2024-04-08",
  },
  {
    id: "kpr-3",
    estateId: "estate-5",
    houseId: "kh-3",
    applicantName: "Joseph Mutua",
    applicantEmail: "joseph@gmail.com",
    applicantPhone: "+254733445566",
    status: "approved",
    createdAt: "2024-04-16",
  },
];

// ── Main seed data ──────────────────────────────────────────────────────────

const SEED_ESTATES: Estate[] = [
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
    adminId: "estate-admin-2",
    createdAt: "2024-03-10",
  },
  {
    id: "estate-3",
    name: "Nakuru Heights",
    location: "Milimani",
    county: "Nakuru",
    units: 60,
    totalArea: 5000,
    description:
      "Premium residential estate overlooking Lake Nakuru with breathtaking views and lush greenery.",
    managementName: "Heights Properties",
    managementEmail: "admin@nakuruheights.co.ke",
    managementPhone: "+254767890123",
    titleDeedNumber: "TNRD/NAKURU/2020/11223",
    estatePhoto: "https://picsum.photos/seed/estate3/800/500",
    amenityPhotos: [],
    status: "approved",
    adminId: "estate-admin-3",
    createdAt: "2024-04-05",
  },
  {
    id: "estate-4",
    name: "Mombasa Pearl",
    location: "Nyali",
    county: "Mombasa",
    units: 24,
    totalArea: 1800,
    description:
      "Luxurious beachfront apartments with stunning Indian Ocean views in the vibrant Nyali area.",
    managementName: "Pearl Coast Realty",
    managementEmail: "info@mombasapearl.co.ke",
    managementPhone: "+254778901234",
    titleDeedNumber: "TNRD/MOMBASA/2021/44556",
    estatePhoto: "https://picsum.photos/seed/estate4/800/500",
    amenityPhotos: [],
    status: "pending",
    adminId: "estate-admin-4",
    createdAt: "2024-05-20",
  },
  {
    id: "estate-5",
    name: "Kilimani Court",
    location: "Kilimani",
    county: "Nairobi",
    units: 12,
    totalArea: 1050,
    description:
      "A fully-occupied boutique residential court in the heart of Kilimani, Nairobi. All 12 units feature modern finishes, secure parking, and 24-hour security. Managed by Kilimani Court Management Ltd.",
    managementName: "Kilimani Court Management Ltd",
    managementEmail: "robert@kilimani.co.ke",
    managementPhone: "+254756789012",
    titleDeedNumber: "TNRD/NAIROBI/2022/98765",
    estatePhoto: "https://picsum.photos/seed/estate5/800/500",
    amenityPhotos: [
      "https://picsum.photos/seed/estate5a/400/300",
      "https://picsum.photos/seed/estate5b/400/300",
      "https://picsum.photos/seed/estate5c/400/300",
    ],
    status: "approved",
    adminId: "estate-admin-2",
    createdAt: "2024-02-20",
  },
];

const SEED_HOUSES: House[] = [
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
    houseNumber: "A102",
    totalArea: 65,
    rooms: 1,
    photos: ["https://picsum.photos/seed/house2/600/400"],
    amenities: ["WiFi", "Parking"],
    rent: 28000,
    managerPhone: "+254723456789",
    status: "vacant",
  },
  {
    id: "house-3",
    estateId: "estate-1",
    houseNumber: "B201",
    totalArea: 120,
    rooms: 3,
    photos: ["https://picsum.photos/seed/house3/600/400"],
    amenities: ["WiFi", "Parking", "Gym", "Balcony"],
    rent: 75000,
    managerPhone: "+254723456789",
    status: "occupied",
    occupiedAt: "2024-06-01",
  },
  {
    id: "house-4",
    estateId: "estate-2",
    houseNumber: "C101",
    totalArea: 90,
    rooms: 2,
    photos: ["https://picsum.photos/seed/house4/600/400"],
    amenities: ["WiFi", "Garden", "Security"],
    rent: 55000,
    managerPhone: "+254756789012",
    status: "vacant",
  },
  {
    id: "house-5",
    estateId: "estate-3",
    houseNumber: "D301",
    totalArea: 110,
    rooms: 3,
    photos: ["https://picsum.photos/seed/house5/600/400"],
    amenities: ["WiFi", "Parking", "Pool View"],
    rent: 38000,
    managerPhone: "+254767890123",
    status: "vacant",
  },
  ...KILIMANI_HOUSES,
];

const SEED_MAINTENANCE: MaintenanceItem[] = [
  {
    id: "m1",
    estateId: "estate-1",
    title: "Elevator Servicing",
    description: "Routine maintenance of all three elevators in Block A and B.",
    status: "in_progress",
    createdAt: "2024-07-10",
  },
  {
    id: "m2",
    estateId: "estate-1",
    title: "Parking Lot Repainting",
    description:
      "Repainting of parking bays and directional arrows in the basement.",
    status: "scheduled",
    createdAt: "2024-07-12",
  },
  ...KILIMANI_MAINTENANCE,
];

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    estateId: "estate-1",
    title: "Annual Residents Meeting",
    eventDate: "2024-07-25T14:00",
    description:
      "All residents are invited to the annual meeting at the clubhouse. Agenda includes security updates and estate improvements.",
    createdAt: "2024-07-10",
  },
  {
    id: "n2",
    estateId: "estate-1",
    title: "Water Interruption Notice",
    eventDate: "2024-07-18T08:00",
    description:
      "Water supply will be interrupted from 8AM to 2PM for scheduled maintenance. Please store water in advance.",
    createdAt: "2024-07-13",
  },
  ...KILIMANI_NOTIFICATIONS,
];

const SEED_PAYMENTS: Payment[] = [
  {
    id: "pay1",
    estateId: "estate-1",
    tenantId: "tenant-1",
    houseId: "house-3",
    amount: 75000,
    type: "rent",
    status: "due",
    dueDate: "2024-07-31",
  },
  {
    id: "pay2",
    estateId: "estate-1",
    tenantId: "tenant-1",
    houseId: "house-3",
    amount: 1200,
    type: "water",
    status: "confirmed",
    dueDate: "2024-06-30",
    paidAt: "2024-06-28",
  },
  ...KILIMANI_PAYMENTS,
];

const SEED_PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: "po1",
    estateId: "estate-1",
    method: "M-Pesa Paybill",
    details: "Paybill: 880100 | Account: Your Unit Number",
    createdAt: "2024-01-01",
  },
  {
    id: "po2",
    estateId: "estate-1",
    method: "Bank Transfer",
    details: "Equity Bank | Acc: 0023456789 | Branch: Westlands",
    createdAt: "2024-01-01",
  },
  ...KILIMANI_PAYMENT_OPTIONS,
];

const DataContext = createContext<DataContextType | null>(null);

function save(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Always keep seed items present; preserve any user-added items by id
function loadMerged<T extends { id: string }>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return seed;
    const stored: T[] = JSON.parse(raw);
    const seedIds = new Set(seed.map((s) => s.id));
    const userAdded = stored.filter((s) => !seedIds.has(s.id));
    return [...seed, ...userAdded];
  } catch {
    return seed;
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [estates, setEstates] = useState<Estate[]>(() =>
    loadMerged(KEYS.estates, SEED_ESTATES),
  );
  const [houses, setHouses] = useState<House[]>(() =>
    loadMerged(KEYS.houses, SEED_HOUSES),
  );
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    loadMerged(KEYS.notifications, SEED_NOTIFICATIONS),
  );
  const [maintenanceItems, setMaintenance] = useState<MaintenanceItem[]>(() =>
    loadMerged(KEYS.maintenance, SEED_MAINTENANCE),
  );
  const [payments, setPayments] = useState<Payment[]>(() =>
    loadMerged(KEYS.payments, SEED_PAYMENTS),
  );
  const [inquiries, setInquiries] = useState<Inquiry[]>(() =>
    loadMerged(KEYS.inquiries, KILIMANI_INQUIRIES),
  );
  const [proposals, setProposals] = useState<RentalProposal[]>(() =>
    loadMerged(KEYS.proposals, KILIMANI_PROPOSALS),
  );
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>(() =>
    loadMerged(KEYS.paymentOptions, SEED_PAYMENT_OPTIONS),
  );

  useEffect(() => {
    save(KEYS.estates, estates);
  }, [estates]);
  useEffect(() => {
    save(KEYS.houses, houses);
  }, [houses]);
  useEffect(() => {
    save(KEYS.notifications, notifications);
  }, [notifications]);
  useEffect(() => {
    save(KEYS.maintenance, maintenanceItems);
  }, [maintenanceItems]);
  useEffect(() => {
    save(KEYS.payments, payments);
  }, [payments]);
  useEffect(() => {
    save(KEYS.inquiries, inquiries);
  }, [inquiries]);
  useEffect(() => {
    save(KEYS.proposals, proposals);
  }, [proposals]);
  useEffect(() => {
    save(KEYS.paymentOptions, paymentOptions);
  }, [paymentOptions]);

  useEffect(() => {
    async function loadApiData() {
      try {
        const [
          estatesResp,
          housesResp,
          notificationsResp,
          maintenanceResp,
          paymentsResp,
          inquiriesResp,
          proposalsResp,
          paymentOptionsResp,
        ] = await Promise.all([
          apiRequest<{ estates: Estate[] }>("/estates"),
          apiRequest<{ houses: House[] }>("/houses"),
          apiRequest<{ notifications: Notification[] }>("/notifications"),
          apiRequest<{ maintenance: MaintenanceItem[] }>("/maintenance"),
          apiRequest<{ payments: Payment[] }>("/payments"),
          apiRequest<{ inquiries: Inquiry[] }>("/inquiries"),
          apiRequest<{ proposals: RentalProposal[] }>("/proposals"),
          apiRequest<{ paymentOptions: PaymentOption[] }>("/payment-options"),
        ]);

        setEstates(estatesResp.estates ?? estates);
        setHouses(housesResp.houses ?? houses);
        setNotifications(notificationsResp.notifications ?? notifications);
        setMaintenance(maintenanceResp.maintenance ?? maintenanceItems);
        setPayments(paymentsResp.payments ?? payments);
        setInquiries(inquiriesResp.inquiries ?? inquiries);
        setProposals(proposalsResp.proposals ?? proposals);
        setPaymentOptions(paymentOptionsResp.paymentOptions ?? paymentOptions);
      } catch (error) {
        console.warn(
          "Unable to load backend data, using local state fallback.",
          error,
        );
      }
    }

    loadApiData();
  }, []);

  const addEstate = (
    data: Omit<Estate, "id" | "createdAt" | "status">,
  ): string => {
    const tempId = makeId("estate");
    const newEstate: Estate = {
      ...data,
      id: tempId,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setEstates((prev) => [...prev, newEstate]);

    void (async () => {
      try {
        const result = await apiRequest<{ estate: Estate }>("/estates", {
          method: "POST",
          body: {
            name: data.name,
            location: data.location,
            county: data.county,
            units: data.units,
            total_area: data.totalArea,
            management_name: data.managementName,
            management_email: data.managementEmail,
            management_phone: data.managementPhone,
            title_deed_number: data.titleDeedNumber,
            estate_photo: data.estatePhoto,
            amenity_photos: data.amenityPhotos,
            description: data.description,
            admin_id: data.adminId,
          },
        });
        if (result.estate) {
          setEstates((prev) =>
            prev.map((estate) =>
              estate.id === tempId ? result.estate : estate,
            ),
          );
        }
      } catch (error) {
        console.warn("Failed to create estate on backend:", error);
      }
    })();

    return tempId;
  };

  const updateEstateStatus = (id: string, status: EstateStatus) => {
    setEstates((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    void (async () => {
      try {
        await apiRequest(`/estates/${id}/status`, {
          method: "PATCH",
          body: { status },
        });
      } catch (error) {
        console.warn("Failed to update estate status:", error);
      }
    })();
  };

  const updateEstatePhoto = (id: string, photo: string) => {
    setEstates((prev) =>
      prev.map((e) => (e.id === id ? { ...e, estatePhoto: photo } : e)),
    );
    void (async () => {
      try {
        await apiRequest(`/estates/${id}`, {
          method: "PATCH",
          body: { estatePhoto: photo },
        });
      } catch (error) {
        console.warn("Failed to upload estate photo:", error);
      }
    })();
  };

  const addHouse = (data: Omit<House, "id">) => {
    const tempId = makeId("house");
    const h: House = { ...data, id: tempId };
    setHouses((prev) => [...prev, h]);
    void (async () => {
      try {
        const result = await apiRequest<{ house: House }>("/houses", {
          method: "POST",
          body: {
            estateId: data.estateId,
            houseNumber: data.houseNumber,
            totalArea: data.totalArea,
            rooms: data.rooms,
            photos: data.photos,
            amenities: data.amenities,
            rent: data.rent,
            managerPhone: data.managerPhone,
            status: data.status,
          },
        });
        if (result.house) {
          setHouses((prev) =>
            prev.map((house) => (house.id === tempId ? result.house : house)),
          );
        }
      } catch (error) {
        console.warn("Failed to create house on backend:", error);
      }
    })();
  };

  const updateHouseStatus = (id: string, status: HouseStatus) => {
    setHouses((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              status,
              occupiedAt:
                status === "occupied" ? new Date().toISOString() : undefined,
            }
          : h,
      ),
    );
    void (async () => {
      try {
        await apiRequest(`/houses/${id}`, {
          method: "PATCH",
          body: {
            status,
            occupiedAt: status === "occupied" ? new Date().toISOString() : null,
          },
        });
      } catch (error) {
        console.warn("Failed to update house status:", error);
      }
    })();
  };

  const addNotification = (data: Omit<Notification, "id" | "createdAt">) => {
    const tempId = makeId("notif");
    const n: Notification = {
      ...data,
      id: tempId,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setNotifications((prev) => [...prev, n]);
    void (async () => {
      try {
        const result = await apiRequest<{ notification: Notification }>(
          "/notifications",
          {
            method: "POST",
            body: {
              estateId: data.estateId,
              title: data.title,
              description: data.description,
              eventDate: data.eventDate,
            },
          },
        );
        if (result.notification) {
          setNotifications((prev) =>
            prev.map((item) =>
              item.id === tempId ? result.notification : item,
            ),
          );
        }
      } catch (error) {
        console.warn("Failed to create notification:", error);
      }
    })();
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    void (async () => {
      try {
        await apiRequest(`/notifications/${id}`, { method: "DELETE" });
      } catch (error) {
        console.warn("Failed to delete notification on backend:", error);
      }
    })();
  };

  const addMaintenance = (data: Omit<MaintenanceItem, "id" | "createdAt">) => {
    const tempId = `m-${Date.now()}`;
    const m: MaintenanceItem = {
      ...data,
      id: tempId,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setMaintenance((prev) => [...prev, m]);
    void (async () => {
      try {
        const result = await apiRequest<{ maintenance: MaintenanceItem }>(
          "/maintenance",
          {
            method: "POST",
            body: {
              estateId: data.estateId,
              houseId: data.houseId,
              title: data.title,
              description: data.description,
              status: data.status,
              priority: data.priority || "medium",
              reportedBy: data.reportedBy,
              assignedTo: data.assignedTo,
            },
          },
        );
        if (result.maintenance) {
          setMaintenance((prev) =>
            prev.map((item) =>
              item.id === tempId ? result.maintenance : item,
            ),
          );
        }
      } catch (error) {
        console.warn("Failed to create maintenance item on backend:", error);
      }
    })();
  };

  const updateMaintenanceStatus = (id: string, status: MaintenanceStatus) => {
    setMaintenance((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m)),
    );
    void (async () => {
      try {
        await apiRequest(`/maintenance/${id}`, {
          method: "PATCH",
          body: { status },
        });
      } catch (error) {
        console.warn("Failed to update maintenance status on backend:", error);
      }
    })();
  };

  const deleteMaintenance = (id: string) => {
    setMaintenance((prev) => prev.filter((m) => m.id !== id));
    void (async () => {
      try {
        await apiRequest(`/maintenance/${id}`, { method: "DELETE" });
      } catch (error) {
        console.warn("Failed to delete maintenance item on backend:", error);
      }
    })();
  };

  const addPaymentOption = (data: Omit<PaymentOption, "id" | "createdAt">) => {
    const tempId = `po-${Date.now()}`;
    const opt: PaymentOption = {
      ...data,
      id: tempId,
      createdAt: new Date().toISOString(),
    };
    setPaymentOptions((prev) => [...prev, opt]);
    void (async () => {
      try {
        const result = await apiRequest<{ paymentOption: PaymentOption }>(
          "/payment-options",
          {
            method: "POST",
            body: {
              estateId: data.estateId,
              method: data.method,
              details: data.details,
            },
          },
        );
        if (result.paymentOption) {
          setPaymentOptions((prev) =>
            prev.map((item) =>
              item.id === tempId ? result.paymentOption : item,
            ),
          );
        }
      } catch (error) {
        console.warn("Failed to create payment option on backend:", error);
      }
    })();
  };

  const removePaymentOption = (id: string) => {
    setPaymentOptions((prev) => prev.filter((p) => p.id !== id));
    void (async () => {
      try {
        await apiRequest(`/payment-options/${id}`, { method: "DELETE" });
      } catch (error) {
        console.warn("Failed to delete payment option on backend:", error);
      }
    })();
  };

  const updatePaymentStatus = (id: string, status: "confirmed") => {
    const paidAt = new Date().toISOString();
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status, paidAt } : p)),
    );
    void (async () => {
      try {
        await apiRequest(`/payments/${id}`, {
          method: "PATCH",
          body: { status, paidAt },
        });
      } catch (error) {
        console.warn("Failed to update payment status on backend:", error);
      }
    })();
  };

  const addInquiry = (data: Omit<Inquiry, "id" | "createdAt" | "status">) => {
    const tempId = `inq-${Date.now()}`;
    const inq: Inquiry = {
      ...data,
      id: tempId,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setInquiries((prev) => [...prev, inq]);
    void (async () => {
      try {
        const result = await apiRequest<{ inquiry: Inquiry }>("/inquiries", {
          method: "POST",
          body: {
            estateId: data.estateId,
            houseId: data.houseId,
            message: data.message,
          },
        });
        if (result.inquiry) {
          setInquiries((prev) =>
            prev.map((item) => (item.id === tempId ? result.inquiry : item)),
          );
        }
      } catch (error) {
        console.warn("Failed to create inquiry on backend:", error);
      }
    })();
  };

  const replyInquiry = (id: string, reply: string) => {
    setInquiries((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              reply,
              status: "resolved",
              repliedAt: new Date().toISOString(),
            }
          : i,
      ),
    );
    void (async () => {
      try {
        await apiRequest(`/inquiries/${id}`, {
          method: "PATCH",
          body: {
            reply,
            status: "resolved",
          },
        });
      } catch (error) {
        console.warn("Failed to reply to inquiry on backend:", error);
      }
    })();
  };

  const addProposal = (
    data: Omit<RentalProposal, "id" | "createdAt" | "status">,
  ) => {
    const tempId = `prop-${Date.now()}`;
    const p: RentalProposal = {
      ...data,
      id: tempId,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setProposals((prev) => [...prev, p]);
    void (async () => {
      try {
        const result = await apiRequest<{ proposal: RentalProposal }>(
          "/proposals",
          {
            method: "POST",
            body: {
              estateId: data.estateId,
              houseId: data.houseId,
              applicantName: data.applicantName,
              applicantEmail: data.applicantEmail,
              applicantPhone: data.applicantPhone,
              message: data.message,
            },
          },
        );
        if (result.proposal) {
          setProposals((prev) =>
            prev.map((item) => (item.id === tempId ? result.proposal : item)),
          );
        }
      } catch (error) {
        console.warn("Failed to create proposal on backend:", error);
      }
    })();
  };

  const approveProposal = (id: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "approved" } : p)),
    );
    setHouses((hs) =>
      hs.map((h) =>
        h.id === prev.find((proposal) => proposal.id === id)?.houseId
          ? {
              ...h,
              status: "occupied",
              occupiedAt: new Date().toISOString(),
            }
          : h,
      ),
    );
    void (async () => {
      try {
        await apiRequest(`/proposals/${id}`, {
          method: "PATCH",
          body: { status: "approved" },
        });
      } catch (error) {
        console.warn("Failed to approve proposal on backend:", error);
      }
    })();
  };

  const rejectProposal = (id: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "rejected" } : p)),
    );
    void (async () => {
      try {
        await apiRequest(`/proposals/${id}`, {
          method: "PATCH",
          body: { status: "rejected" },
        });
      } catch (error) {
        console.warn("Failed to reject proposal on backend:", error);
      }
    })();
  };

  const promoteToAdmin = async (userId: string, estateId: string) => {
    try {
      const estateName =
        estates.find((e) => e.id === estateId)?.name ?? "your estate";
      await apiRequest<{ user: User }>(`/users/${userId}`, {
        method: "PATCH",
        body: {
          role: "estate_admin",
          estate_id: estateId,
        },
      });

      const current = localStorage.getItem(STORAGE_KEY);
      if (current) {
        const cu = JSON.parse(current) as User;
        if (cu.id === userId) {
          const promoted = { ...cu, role: "estate_admin", estateId };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(promoted));
          window.dispatchEvent(
            new CustomEvent("communest:promoted-to-estate-admin", {
              detail: { estateName, estateId },
            }),
          );
          window.dispatchEvent(
            new CustomEvent("communest:user-updated", { detail: promoted }),
          );
        }
      }
    } catch (error) {
      console.warn("Failed to promote user on backend:", error);
    }
  };

  return (
    <DataContext.Provider
      value={{
        estates,
        houses,
        notifications,
        maintenanceItems,
        payments,
        inquiries,
        proposals,
        paymentOptions,
        addEstate,
        updateEstateStatus,
        updateEstatePhoto,
        addHouse,
        updateHouseStatus,
        addNotification,
        deleteNotification,
        addMaintenance,
        updateMaintenanceStatus,
        deleteMaintenance,
        addPaymentOption,
        removePaymentOption,
        updatePaymentStatus,
        addInquiry,
        replyInquiry,
        addProposal,
        approveProposal,
        rejectProposal,
        promoteToAdmin,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
