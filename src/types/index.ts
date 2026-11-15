/**
 * Core type definitions for SkillShare platform
 */

export type UserRole = 'user' | 'admin';
export type AppMode = 'freelancer' | 'client' | 'admin';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  currentMode: AppMode;
  isSuspended: boolean;
  isVerified: boolean;
  walletBalance: number;
  pendingEscrowBalance: number;
  totalEarned: number;
  totalSpent: number;
  createdAt: string;
}

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Expert';
export type AvailabilityStatus = 'Available' | 'Busy' | 'Not Available';

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  projectUrl?: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  year: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  description?: string;
}

export interface Profile {
  uid: string;
  name: string;
  headline: string;
  bio: string;
  location: string;
  phone?: string;
  skills: string[];
  skillLevel: SkillLevel;
  hourlyRate: number;
  education: EducationItem[];
  experience: ExperienceItem[];
  portfolio: PortfolioItem[];
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  availability: AvailabilityStatus;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  completionPercentage: number;
}

export interface Category {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  icon: string;
  description: string;
  jobCount: number;
  serviceCount: number;
}

export type JobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled' | 'flagged';

export interface Job {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  title: string;
  category: string;
  description: string;
  requiredSkills: string[];
  budget: number;
  deadline: string;
  proposalsCount: number;
  status: JobStatus;
  createdAt: string;
  attachments?: string[];
}

export type ProposalStatus = 'pending' | 'accepted' | 'rejected';

export interface Proposal {
  id: string;
  jobId: string;
  jobTitle?: string;
  jobClientId?: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar?: string;
  freelancerHeadline?: string;
  freelancerRating?: number;
  coverLetter: string;
  bidAmount: number;
  deliveryDays: number;
  status: ProposalStatus;
  createdAt: string;
}

export type ServiceStatus = 'active' | 'paused' | 'flagged';

export interface Service {
  id: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar?: string;
  freelancerRating?: number;
  freelancerReviewsCount?: number;
  title: string;
  category: string;
  description: string;
  price: number;
  deliveryTimeDays: number;
  sampleImages: string[];
  rating: number;
  reviewCount: number;
  status: ServiceStatus;
  createdAt: string;
}

export type OrderStatus =
  | 'Pending'
  | 'In Progress'
  | 'Delivered'
  | 'Revision'
  | 'Completed'
  | 'Cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  jobId?: string;
  serviceId?: string;
  title: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  amount: number;
  commissionRate: number; // e.g. 10 for 10%
  commissionAmount: number;
  freelancerEarnings: number;
  status: OrderStatus;
  paymentMethod: string;
  requirements?: string;
  deliveryNotes?: string;
  deliveryFiles?: string[];
  revisionNotes?: string;
  createdAt: string;
  updatedAt: string;
  clientRated?: boolean;
  freelancerRated?: boolean;
}

export interface Review {
  id: string;
  orderId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  revieweeId: string;
  revieweeName: string;
  rating: number;
  comment: string;
  role: 'client' | 'freelancer';
  createdAt: string;
}

export type TransactionType =
  | 'escrow_deposit'
  | 'escrow_release'
  | 'commission'
  | 'withdrawal'
  | 'refund';

export interface Transaction {
  id: string;
  userId: string;
  userName?: string;
  type: TransactionType;
  amount: number;
  orderId?: string;
  orderNumber?: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
}

export type WithdrawalMethod = 'bKash' | 'Nagad' | 'Bank';
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

export interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  method: WithdrawalMethod;
  accountNumber: string;
  accountName: string;
  bankName?: string;
  branch?: string;
  amount: number;
  fee: number;
  status: WithdrawalStatus;
  createdAt: string;
  processedAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantDetails: {
    [uid: string]: {
      name: string;
      avatar?: string;
      headline?: string;
    };
  };
  lastMessage: string;
  lastMessageAt: string;
  orderId?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'proposal' | 'message' | 'payment' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'user' | 'job' | 'service' | 'review';
  targetId: string;
  targetTitle: string;
  reason: string;
  details: string;
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed';
  createdAt: string;
}

export interface PlatformSettings {
  id: string;
  siteName: string;
  commissionRate: number;
  announcement?: string;
  featuredFreelancerIds: string[];
  isMaintenanceMode: boolean;
}
