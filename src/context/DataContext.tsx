import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Category,
  Conversation,
  Job,
  Message,
  NotificationItem,
  Order,
  OrderStatus,
  PlatformSettings,
  Profile,
  Proposal,
  Report,
  Review,
  Service,
  Transaction,
  Withdrawal,
} from '../types';
import {
  SEED_CATEGORIES,
  SEED_JOBS,
  SEED_ORDERS,
  SEED_PROFILES,
  SEED_PROPOSALS,
  SEED_REVIEWS,
  SEED_SERVICES,
  SEED_TRANSACTIONS,
  SEED_WITHDRAWALS,
} from '../data/seedData';
import { calculateEscrowBreakdown } from '../utils/escrow';
import { useAuth } from './AuthContext';

interface DataContextType {
  categories: Category[];
  profiles: Profile[];
  services: Service[];
  jobs: Job[];
  proposals: Proposal[];
  orders: Order[];
  reviews: Review[];
  transactions: Transaction[];
  withdrawals: Withdrawal[];
  notifications: NotificationItem[];
  conversations: Conversation[];
  messages: Message[];
  reports: Report[];
  settings: PlatformSettings;
  savedFreelancerIds: string[];
  // Actions
  createService: (data: Omit<Service, 'id' | 'createdAt' | 'rating' | 'reviewCount' | 'status'>) => void;
  updateService: (id: string, data: Partial<Service>) => void;
  deleteService: (id: string) => void;
  createJob: (data: Omit<Job, 'id' | 'createdAt' | 'proposalsCount' | 'status'>) => Job;
  updateJob: (id: string, data: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  submitProposal: (data: Omit<Proposal, 'id' | 'createdAt' | 'status'>) => void;
  acceptProposal: (proposalId: string, paymentMethod?: string) => Order;
  rejectProposal: (proposalId: string) => void;
  deliverOrder: (orderId: string, notes: string, files?: string[]) => void;
  requestOrderRevision: (orderId: string, revisionNotes: string) => void;
  approveOrderAndReleaseEscrow: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;
  requestWithdrawal: (data: Omit<Withdrawal, 'id' | 'createdAt' | 'status'>) => void;
  approveWithdrawal: (id: string) => void;
  rejectWithdrawal: (id: string) => void;
  addReview: (data: Omit<Review, 'id' | 'createdAt'>) => void;
  toggleSaveFreelancer: (freelancerId: string) => void;
  isFreelancerSaved: (freelancerId: string) => boolean;
  sendMessage: (conversationId: string, text: string, fileUrl?: string, fileName?: string) => void;
  createOrGetConversation: (otherUserId: string, otherUserName: string, otherUserAvatar?: string, orderId?: string) => string;
  submitReport: (data: Omit<Report, 'id' | 'createdAt' | 'status'>) => void;
  updateReportStatus: (id: string, status: Report['status']) => void;
  updateSettings: (newSettings: Partial<PlatformSettings>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteReview: (id: string) => void;
  suspendUser: (uid: string, suspend: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Storage helper with fallback
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return fallback;
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // ignore
  }
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [categories] = useState<Category[]>(SEED_CATEGORIES);
  const [profiles, setProfiles] = useState<Profile[]>(() =>
    loadFromStorage('skillshare_profiles', SEED_PROFILES)
  );
  const [services, setServices] = useState<Service[]>(() =>
    loadFromStorage('skillshare_services', SEED_SERVICES)
  );
  const [jobs, setJobs] = useState<Job[]>(() =>
    loadFromStorage('skillshare_jobs', SEED_JOBS)
  );
  const [proposals, setProposals] = useState<Proposal[]>(() =>
    loadFromStorage('skillshare_proposals', SEED_PROPOSALS)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadFromStorage('skillshare_orders', SEED_ORDERS)
  );
  const [reviews, setReviews] = useState<Review[]>(() =>
    loadFromStorage('skillshare_reviews', SEED_REVIEWS)
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadFromStorage('skillshare_transactions', SEED_TRANSACTIONS)
  );
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(() =>
    loadFromStorage('skillshare_withdrawals', SEED_WITHDRAWALS)
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadFromStorage('skillshare_notifications', [
      {
        id: 'notif-1',
        userId: 'freelancer-001',
        title: 'New Proposal Request',
        message: 'Your proposal for "Multi-Vendor E-Commerce" was shortlisted.',
        type: 'proposal',
        link: '/dashboard',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ])
  );
  const [savedFreelancerIds, setSavedFreelancerIds] = useState<string[]>(() =>
    loadFromStorage('skillshare_saved_freelancers', ['freelancer-002'])
  );
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    loadFromStorage('skillshare_conversations', [
      {
        id: 'conv-001',
        participants: ['freelancer-001', 'client-001'],
        participantDetails: {
          'freelancer-001': { name: 'Tanvir Ahmed', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', headline: 'Senior Full Stack Developer' },
          'client-001': { name: 'Saadman Chowdhury', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80', headline: 'Dhaka Tech Ventures' },
        },
        lastMessage: 'Sounds good! I have initiated the escrow contract.',
        lastMessageAt: '2026-10-28T12:30:00Z',
        orderId: 'ord-102',
      },
    ])
  );
  const [messages, setMessages] = useState<Message[]>(() =>
    loadFromStorage('skillshare_messages', [
      {
        id: 'msg-001',
        conversationId: 'conv-001',
        senderId: 'client-001',
        senderName: 'Saadman Chowdhury',
        text: 'Hi Tanvir, saw your portfolio. Are you available for an e-commerce task starting this week?',
        createdAt: '2026-10-28T12:00:00Z',
      },
      {
        id: 'msg-002',
        conversationId: 'conv-001',
        senderId: 'freelancer-001',
        senderName: 'Tanvir Ahmed',
        text: 'Hello Saadman! Yes absolutely, I can prioritize your platform development.',
        createdAt: '2026-10-28T12:15:00Z',
      },
    ])
  );
  const [reports, setReports] = useState<Report[]>(() =>
    loadFromStorage('skillshare_reports', [])
  );
  const [settings, setSettings] = useState<PlatformSettings>(() =>
    loadFromStorage('skillshare_settings', {
      id: 'platform',
      siteName: 'SkillShare',
      commissionRate: 10,
      announcement: 'Welcome to SkillShare Bangladesh! Escrow deposits via bKash and Nagad are now 0% transaction fee this month.',
      featuredFreelancerIds: ['freelancer-001', 'freelancer-002', 'freelancer-005'],
      isMaintenanceMode: false,
    })
  );

  // Sync to storage
  useEffect(() => saveToStorage('skillshare_services', services), [services]);
  useEffect(() => saveToStorage('skillshare_jobs', jobs), [jobs]);
  useEffect(() => saveToStorage('skillshare_proposals', proposals), [proposals]);
  useEffect(() => saveToStorage('skillshare_orders', orders), [orders]);
  useEffect(() => saveToStorage('skillshare_reviews', reviews), [reviews]);
  useEffect(() => saveToStorage('skillshare_transactions', transactions), [transactions]);
  useEffect(() => saveToStorage('skillshare_withdrawals', withdrawals), [withdrawals]);
  useEffect(() => saveToStorage('skillshare_notifications', notifications), [notifications]);
  useEffect(() => saveToStorage('skillshare_saved_freelancers', savedFreelancerIds), [savedFreelancerIds]);
  useEffect(() => saveToStorage('skillshare_conversations', conversations), [conversations]);
  useEffect(() => saveToStorage('skillshare_messages', messages), [messages]);
  useEffect(() => saveToStorage('skillshare_reports', reports), [reports]);
  useEffect(() => saveToStorage('skillshare_settings', settings), [settings]);
  useEffect(() => saveToStorage('skillshare_profiles', profiles), [profiles]);

  // Actions
  const createService = (data: Omit<Service, 'id' | 'createdAt' | 'rating' | 'reviewCount' | 'status'>) => {
    const newService: Service = {
      ...data,
      id: `srv-${Date.now()}`,
      rating: 5.0,
      reviewCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setServices((prev) => [newService, ...prev]);
  };

  const updateService = (id: string, data: Partial<Service>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const createJob = (data: Omit<Job, 'id' | 'createdAt' | 'proposalsCount' | 'status'>): Job => {
    const newJob: Job = {
      ...data,
      id: `job-${Date.now()}`,
      proposalsCount: 0,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    setJobs((prev) => [newJob, ...prev]);
    return newJob;
  };

  const updateJob = (id: string, data: Partial<Job>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...data } : j)));
  };

  const deleteJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const submitProposal = (data: Omit<Proposal, 'id' | 'createdAt' | 'status'>) => {
    const newProp: Proposal = {
      ...data,
      id: `prop-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setProposals((prev) => [newProp, ...prev]);

    // Increment proposal count on job
    setJobs((prev) =>
      prev.map((j) => (j.id === data.jobId ? { ...j, proposalsCount: (j.proposalsCount || 0) + 1 } : j))
    );

    // Notify job client
    const targetJob = jobs.find((j) => j.id === data.jobId);
    if (targetJob) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: targetJob.clientId,
        title: 'New Proposal Received',
        message: `${data.freelancerName} submitted a proposal for "${targetJob.title}".`,
        type: 'proposal',
        link: `/jobs/${targetJob.id}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const acceptProposal = (proposalId: string, paymentMethod = 'bKash Escrow'): Order => {
    const proposal = proposals.find((p) => p.id === proposalId);
    if (!proposal) throw new Error('Proposal not found');

    const job = jobs.find((j) => j.id === proposal.jobId);
    const breakdown = calculateEscrowBreakdown(proposal.bidAmount, settings.commissionRate);

    // Update proposal status
    setProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, status: 'accepted' } : p.jobId === proposal.jobId ? { ...p, status: 'rejected' } : p))
    );

    // Update job status to in_progress
    if (job) {
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: 'in_progress' } : j)));
    }

    // Create Escrow Order
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `SKILL-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      jobId: proposal.jobId,
      title: job?.title || 'Contract Order',
      clientId: currentUser?.uid || job?.clientId || 'client-001',
      clientName: currentUser?.displayName || job?.clientName || 'Client',
      freelancerId: proposal.freelancerId,
      freelancerName: proposal.freelancerName,
      amount: breakdown.totalAmount,
      commissionRate: breakdown.commissionRate,
      commissionAmount: breakdown.commissionAmount,
      freelancerEarnings: breakdown.freelancerEarnings,
      status: 'In Progress',
      paymentMethod,
      requirements: proposal.coverLetter,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Record Escrow Deposit Transaction
    const depositTx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: newOrder.clientId,
      userName: newOrder.clientName,
      type: 'escrow_deposit',
      amount: newOrder.amount,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      status: 'completed',
      description: `Escrow funded for order ${newOrder.orderNumber} (${paymentMethod})`,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [depositTx, ...prev]);

    // Notify Freelancer
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: proposal.freelancerId,
      title: 'Proposal Accepted! Order Started',
      message: `${newOrder.clientName} accepted your proposal for ৳${newOrder.amount.toLocaleString('en-IN')}. Funds are securely held in escrow.`,
      type: 'order',
      link: '/dashboard',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);

    return newOrder;
  };

  const rejectProposal = (proposalId: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, status: 'rejected' } : p))
    );
  };

  const deliverOrder = (orderId: string, notes: string, files: string[] = []) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: 'Delivered',
          deliveryNotes: notes,
          deliveryFiles: files,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: targetOrder.clientId,
        title: 'Work Delivered for Review',
        message: `${targetOrder.freelancerName} has delivered work for order ${targetOrder.orderNumber}. Please review and approve payment.`,
        type: 'order',
        link: '/dashboard',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const requestOrderRevision = (orderId: string, revisionNotes: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: 'Revision',
          revisionNotes,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: targetOrder.freelancerId,
        title: 'Revision Requested',
        message: `${targetOrder.clientName} requested changes for order ${targetOrder.orderNumber}: "${revisionNotes}"`,
        type: 'order',
        link: '/dashboard',
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const approveOrderAndReleaseEscrow = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Completed', updatedAt: new Date().toISOString() } : o))
    );

    // Release payout transaction to freelancer
    const releaseTx: Transaction = {
      id: `tx-${Date.now()}-rel`,
      userId: targetOrder.freelancerId,
      userName: targetOrder.freelancerName,
      type: 'escrow_release',
      amount: targetOrder.freelancerEarnings,
      orderId: targetOrder.id,
      orderNumber: targetOrder.orderNumber,
      status: 'completed',
      description: `Escrow payout released for completed order ${targetOrder.orderNumber}`,
      createdAt: new Date().toISOString(),
    };

    // Platform commission transaction
    const feeTx: Transaction = {
      id: `tx-${Date.now()}-fee`,
      userId: 'admin-user-001',
      userName: 'SkillShare Platform',
      type: 'commission',
      amount: targetOrder.commissionAmount,
      orderId: targetOrder.id,
      orderNumber: targetOrder.orderNumber,
      status: 'completed',
      description: `Platform commission (${targetOrder.commissionRate}%) for order ${targetOrder.orderNumber}`,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [releaseTx, feeTx, ...prev]);

    // Update Freelancer Profile stats (completedJobs count)
    setProfiles((prev) =>
      prev.map((p) =>
        p.uid === targetOrder.freelancerId ? { ...p, completedJobs: (p.completedJobs || 0) + 1 } : p
      )
    );

    // Notify Freelancer
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: targetOrder.freelancerId,
      title: 'Escrow Payment Released! 🎉',
      message: `${targetOrder.clientName} approved your delivery. ৳${targetOrder.freelancerEarnings.toLocaleString('en-IN')} has been added to your available wallet balance.`,
      type: 'payment',
      link: '/dashboard',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Cancelled', updatedAt: new Date().toISOString() } : o))
    );

    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder) {
      // Refund client
      const refundTx: Transaction = {
        id: `tx-${Date.now()}-ref`,
        userId: targetOrder.clientId,
        userName: targetOrder.clientName,
        type: 'refund',
        amount: targetOrder.amount,
        orderId: targetOrder.id,
        orderNumber: targetOrder.orderNumber,
        status: 'completed',
        description: `Full refund for cancelled order ${targetOrder.orderNumber}`,
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [refundTx, ...prev]);
    }
  };

  const requestWithdrawal = (data: Omit<Withdrawal, 'id' | 'createdAt' | 'status'>) => {
    const newWdr: Withdrawal = {
      ...data,
      id: `wdr-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setWithdrawals((prev) => [newWdr, ...prev]);

    // Add pending transaction
    const tx: Transaction = {
      id: `tx-${Date.now()}-wdr`,
      userId: data.userId,
      userName: data.userName,
      type: 'withdrawal',
      amount: data.amount,
      status: 'pending',
      description: `Withdrawal request to ${data.method} (${data.accountNumber})`,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  const approveWithdrawal = (id: string) => {
    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, status: 'approved', processedAt: new Date().toISOString() } : w
      )
    );
  };

  const rejectWithdrawal = (id: string) => {
    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, status: 'rejected', processedAt: new Date().toISOString() } : w
      )
    );
  };

  const addReview = (data: Omit<Review, 'id' | 'createdAt'>) => {
    const newRev: Review = {
      ...data,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [newRev, ...prev]);

    // Recalculate reviewee rating
    const allUserReviews = [...reviews, newRev].filter((r) => r.revieweeId === data.revieweeId);
    const avg =
      allUserReviews.reduce((sum, r) => sum + r.rating, 0) / (allUserReviews.length || 1);

    setProfiles((prev) =>
      prev.map((p) =>
        p.uid === data.revieweeId
          ? { ...p, rating: Number(avg.toFixed(2)), reviewCount: allUserReviews.length }
          : p
      )
    );

    // Update order rated status
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== data.orderId) return o;
        return data.role === 'client' ? { ...o, clientRated: true } : { ...o, freelancerRated: true };
      })
    );
  };

  const deleteReview = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleSaveFreelancer = (freelancerId: string) => {
    setSavedFreelancerIds((prev) =>
      prev.includes(freelancerId) ? prev.filter((id) => id !== freelancerId) : [...prev, freelancerId]
    );
  };

  const isFreelancerSaved = (freelancerId: string) => savedFreelancerIds.includes(freelancerId);

  const sendMessage = (conversationId: string, text: string, fileUrl?: string, fileName?: string) => {
    if (!currentUser) return;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      senderAvatar: currentUser.photoURL,
      text,
      fileUrl,
      fileName,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, lastMessage: text, lastMessageAt: new Date().toISOString() }
          : c
      )
    );
  };

  const createOrGetConversation = (
    otherUserId: string,
    otherUserName: string,
    otherUserAvatar?: string,
    orderId?: string
  ): string => {
    if (!currentUser) return '';
    const existing = conversations.find(
      (c) => c.participants.includes(currentUser.uid) && c.participants.includes(otherUserId)
    );
    if (existing) return existing.id;

    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      participants: [currentUser.uid, otherUserId],
      participantDetails: {
        [currentUser.uid]: {
          name: currentUser.displayName,
          avatar: currentUser.photoURL,
          headline: currentUser.currentMode === 'freelancer' ? 'Skill Provider' : 'Client',
        },
        [otherUserId]: {
          name: otherUserName,
          avatar: otherUserAvatar,
        },
      },
      lastMessage: 'Conversation started',
      lastMessageAt: new Date().toISOString(),
      orderId,
    };
    setConversations((prev) => [newConv, ...prev]);
    return newId;
  };

  const submitReport = (data: Omit<Report, 'id' | 'createdAt' | 'status'>) => {
    const rep: Report = {
      ...data,
      id: `rep-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setReports((prev) => [rep, ...prev]);
  };

  const updateReportStatus = (id: string, status: Report['status']) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const suspendUser = (uid: string, suspend: boolean) => {
    setProfiles((prev) =>
      prev.map((p) => (p.uid === uid ? { ...p, availability: suspend ? 'Not Available' : 'Available' } : p))
    );
  };

  return (
    <DataContext.Provider
      value={{
        categories,
        profiles,
        services,
        jobs,
        proposals,
        orders,
        reviews,
        transactions,
        withdrawals,
        notifications,
        conversations,
        messages,
        reports,
        settings,
        savedFreelancerIds,
        createService,
        updateService,
        deleteService,
        createJob,
        updateJob,
        deleteJob,
        submitProposal,
        acceptProposal,
        rejectProposal,
        deliverOrder,
        requestOrderRevision,
        approveOrderAndReleaseEscrow,
        cancelOrder,
        requestWithdrawal,
        approveWithdrawal,
        rejectWithdrawal,
        addReview,
        deleteReview,
        toggleSaveFreelancer,
        isFreelancerSaved,
        sendMessage,
        createOrGetConversation,
        submitReport,
        updateReportStatus,
        updateSettings,
        markNotificationRead,
        markAllNotificationsRead,
        suspendUser,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
