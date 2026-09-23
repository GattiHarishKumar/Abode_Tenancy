export type Role = 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'STAFF' | 'COOK' | 'TENANT';

export interface User {
  id: string;
  phone: string;
  fullName: string;
  email?: string;
  role: Role;
  status?: string;
  languagePreference?: string;
  tenantId?: string;
  propertyId?: string;
  name?: string; // alias for fullName
}

export interface AuthResponse {
  token: string;
  tokenType?: string;
  userId: string;
  fullName: string;
  phone: string;
  email?: string;
  role: Role;
  status?: string;
  languagePreference?: string;
  propertyId?: string;
  propertyName?: string;
  tenantId?: string;
  user?: User;
}

export interface PropertySummary {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  genderAllowed: string;
  contactPhone: string;
  contactEmail?: string;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
}

export interface BedItem {
  id: string;
  bedLabel: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  currentTenantId?: string;
  currentTenantName?: string;
  currentTenantPhone?: string;
  isOnNotice?: boolean;
  vacatingDate?: string;
}

export interface RoomSummary {
  id: string;
  roomNumber: string;
  floorNumber: number;
  sharingType: number;
  baseRent: number;
  isAc?: boolean;
  hasBalcony?: boolean;
  hasAttachedWashroom?: boolean;
  isCleanedToday?: boolean;
  lastCleanedAt?: string;
  status: 'AVAILABLE' | 'PARTIALLY_OCCUPIED' | 'FULL' | 'MAINTENANCE';
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  beds: BedItem[];
}

export interface BedDetail {
  bedId: string;
  bedLabel: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  tenantId?: string;
  tenantName?: string;
  tenantPhone?: string;
  joiningDate?: string;
  rentStatus?: string;
}

export interface RoomComplaint {
  id: string;
  title: string;
  category: string;
  status: string;
  createdAt: string;
}

export interface RoomDetail {
  id: string;
  roomNumber: string;
  floorNumber: number;
  sharingType: number;
  baseRent: number;
  isAc?: boolean;
  hasBalcony?: boolean;
  hasAttachedWashroom?: boolean;
  isCleanedToday?: boolean;
  lastCleanedAt?: string;
  status: string;
  beds: BedDetail[];
  openComplaints: RoomComplaint[];
}

export interface TenantSummary {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email?: string;
  roomId?: string;
  roomNumber?: string;
  bedId?: string;
  bedLabel?: string;
  sharingType: number;
  joiningDate: string;
  vacatingDate?: string;
  rentAmount: number;
  depositAmount: number;
  status: 'ACTIVE' | 'ON_NOTICE' | 'VACATED';
  currentMonthRentStatus: 'PAID' | 'PENDING' | 'OVERDUE';
  openComplaintsCount: number;
}

export interface NoticePeriodItem {
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  roomId: string;
  roomNumber: string;
  bedId: string;
  bedLabel: string;
  vacatingDate: string;
  daysRemaining: number;
  depositHeld: number;
  rentAmount: number;
}

export interface SettlementResponse {
  tenantId: string;
  tenantName: string;
  depositHeld: number;
  totalDeductions: number;
  netRefundAmount: number;
  settlementDate: string;
  status: string;
  notes: string;
}

export interface InvoiceItem {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  roomNumber: string;
  bedLabel: string;
  invoiceNumber: string;
  monthYear: string;
  billingMonth?: string;
  amount: number;
  totalAmount?: number;
  discountAmount: number;
  dueDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED';
  paidAmount: number;
  paidDate?: string;
}

export interface ComplaintSummary {
  id: string;
  propertyId: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  roomId?: string;
  roomNumber?: string;
  bedLabel?: string;
  category: 'PLUMBING' | 'ELECTRICAL' | 'WIFI' | 'FOOD' | 'CLEANLINESS' | 'NOISE' | 'OTHER';
  title: string;
  description: string;
  photoUrl?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'NEW' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assignedTo?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  complaintNumber?: string;
}

export interface TimelineEvent {
  date: string;
  title: string;
  category: string;
  description: string;
}

export interface Tenant360 {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  propertyId: string;
  propertyName: string;
  roomId?: string;
  roomNumber?: string;
  bedId?: string;
  bedLabel?: string;
  sharingType: number;
  joiningDate: string;
  checkInDate?: string;
  vacatingDate?: string;
  rentAmount: number;
  depositAmount: number;
  status: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  recentInvoices: InvoiceItem[];
  complaints: ComplaintSummary[];
  activityTimeline: TimelineEvent[];
  verifiedDocumentsCount: number;
  totalDocumentsCount: number;
  // Aliases for convenience
  name?: string;
  totalOutstandingBalance?: number;
  upiId?: string;
  companyOrCollege?: string;
  city?: string;
  idProofType?: string;
  noticePeriodDays?: number;
}

// Alias for TenantProfile360
export type TenantProfile360 = Tenant360;

export interface ApplicationSummary {
  id: string;
  propertyId: string;
  propertyName: string;
  name: string;
  phone: string;
  email?: string;
  age?: number;
  occupation?: string;
  companyOrCollege?: string;
  preferredSharing: number | string;
  expectedJoiningDate?: string;
  expectedMoveInDate?: string;
  dietaryPreference?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ONBOARDED';
  notes?: string;
  createdAt: string;
}

export interface MenuResponse {
  id?: string;
  propertyId: string;
  menuDate: string;
  breakfastItems?: string;
  breakfastStart?: string;
  breakfastEnd?: string;
  lunchItems?: string;
  lunchStart?: string;
  lunchEnd?: string;
  dinnerItems?: string;
  dinnerStart?: string;
  dinnerEnd?: string;
  isPublished?: boolean;
  // Aliases
  breakfastMenu?: string;
  lunchMenu?: string;
  dinnerMenu?: string;
  lunchIsNonVeg?: boolean;
  dinnerIsNonVeg?: boolean;
}

export interface MealConfirmationItem {
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  isAttending: boolean;
  isCutoffPassed: boolean;
  timing?: string;
  items?: string;
}

export interface IngredientEstimate {
  name: string;
  quantity: string;
}

export interface CookMealCard {
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  title?: string;
  timing?: string;
  items?: string;
  confirmedCount?: number;
  expectedCount?: number;
  status?: string;
  prepStatus?: string;
  preparedCount?: number;
  menuText?: string;
  vegCount?: number;
  nonVegCount?: number;
  ingredients?: IngredientEstimate[];
}

export interface CookMealSummary {
  confirmedCount: number;
  vegCount: number;
  nonVegCount: number;
  prepStatus: string;
  menuText: string;
}

export interface CookDashboard {
  date: string;
  propertyId: string;
  propertyName: string;
  cookLanguage: string;
  meals?: CookMealCard[];
  breakfast?: CookMealSummary;
  lunch?: CookMealSummary;
  dinner?: CookMealSummary;
}

export interface RentSummaryItem {
  invoiceId: string;
  roomNumber: string;
  bedLabel: string;
  tenantName: string;
  phone: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: string;
}

export interface RentDashboardSummary {
  monthYear: string;
  totalExpected: number;
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  totalTenants: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  collectionRate?: number;
  items?: RentSummaryItem[];
  invoices?: InvoiceItem[];
}

export interface PaymentReceipt {
  paymentId: string;
  paymentNumber: string;
  receiptNumber: string;
  tenantName: string;
  tenantPhone: string;
  propertyName: string;
  propertyAddress: string;
  roomNumber: string;
  bedLabel: string;
  monthYear: string;
  amount: number;
  paymentMethod: string;
  status: string;
  paidAt: string;
}

export interface ActionItem {
  id: string;
  level: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';
  title: string;
  description: string;
  link: string;
  count: string;
}

export interface OwnerDashboardData {
  propertyId: string;
  propertyName: string;
  city: string;
  date: string;
  totalTenants: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  pendingRent: number;
  pendingRentCount: number;
  openComplaintsCount: number;
  pendingApplicationsCount: number;
  vacatingSoonCount: number;
  breakfast: { confirmed: number; expected: number; notConfirmed: number; prepStatus: string };
  lunch: { confirmed: number; expected: number; notConfirmed: number; prepStatus: string };
  dinner: { confirmed: number; expected: number; notConfirmed: number; prepStatus: string };
  actionCenter: ActionItem[];
  operations: {
    propertyStatus: string;
    rentStatus: string;
    breakfastStatus: string;
    lunchStatus: string;
    dinnerStatus: string;
    issuesStatus: string;
    newTenantsStatus: string;
    vacatingStatus: string;
  };
}

export interface TenantDayViewData {
  tenantName: string;
  propertyName: string;
  roomNumber: string;
  bedLabel: string;
  todayDate: string;
  todayMeals: {
    mealType: string;
    title: string;
    timing: string;
    items: string;
    isAttending: boolean;
    isCutoffPassed: boolean;
  }[];
  rentStatus: string;
  rentDueDate: string;
  rentDueAmount: number;
  activeComplaints: ComplaintSummary[];
  recentAnnouncements: {
    id: string;
    title: string;
    message: string;
    isPinned: boolean;
    createdAt: string;
  }[];
}

export interface PublicPGProfile {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  genderAllowed?: string;
  genderPolicy?: string;
  contactPhone: string;
  contactEmail?: string;
  description?: string;
  rules?: string;
  noticePeriodDays?: number;
  defaultDeposit?: number;
  referralReward?: number;
  totalVacantBeds?: number;
  photos?: { id: string; category: string; photoUrl: string; caption?: string; sortOrder: number }[];
  facilities?: { id: string; facilityName: string; icon?: string; isAvailable: boolean }[];
  pricing?: { id: string; sharingType: number; monthlyRent: number; depositAmount: number; description?: string }[];
  faqs?: { id: string; question: string; answer: string; sortOrder: number }[];
  vacancies?: { sharingType: number; totalBeds: number; availableBeds: number; status: string }[];
}

export type PublicPropertyProfile = PublicPGProfile;

