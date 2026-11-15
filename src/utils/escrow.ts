import { OrderStatus } from '../types';

export interface EscrowBreakdown {
  totalAmount: number;
  commissionRate: number;
  commissionAmount: number;
  freelancerEarnings: number;
}

/**
 * Calculates platform commission and net freelancer payout.
 * Commission is rounded to nearest whole integer for BDT currency.
 */
export function calculateEscrowBreakdown(
  totalAmount: number,
  commissionRatePercent = 10
): EscrowBreakdown {
  if (totalAmount <= 0) {
    return {
      totalAmount: 0,
      commissionRate: commissionRatePercent,
      commissionAmount: 0,
      freelancerEarnings: 0,
    };
  }

  const rate = Math.max(0, Math.min(100, commissionRatePercent));
  const commissionAmount = Math.round((totalAmount * rate) / 100);
  const freelancerEarnings = totalAmount - commissionAmount;

  return {
    totalAmount,
    commissionRate: rate,
    commissionAmount,
    freelancerEarnings,
  };
}

/**
 * Validates order status state machine transitions based on role.
 * Order Flow:
 * Pending -> In Progress (Client funds escrow or accepts)
 * In Progress -> Delivered (Freelancer delivers files)
 * Delivered -> Revision (Client requests rework)
 * Revision -> Delivered (Freelancer redelivers)
 * Delivered -> Completed (Client approves and releases escrow)
 * Pending / In Progress -> Cancelled (Admin or mutual cancellation)
 */
export function canTransitionOrderStatus(
  current: OrderStatus,
  target: OrderStatus,
  actor: 'client' | 'freelancer' | 'admin'
): boolean {
  if (current === target) return false;
  if (current === 'Completed' && actor !== 'admin') return false;
  if (current === 'Cancelled' && actor !== 'admin') return false;

  if (actor === 'admin') {
    return true; // Admin can resolve disputes and override
  }

  if (actor === 'freelancer') {
    if (current === 'Pending' && target === 'In Progress') return true;
    if (current === 'In Progress' && target === 'Delivered') return true;
    if (current === 'Revision' && target === 'Delivered') return true;
    return false;
  }

  if (actor === 'client') {
    if (current === 'Pending' && (target === 'In Progress' || target === 'Cancelled')) return true;
    if (current === 'Delivered' && target === 'Completed') return true;
    if (current === 'Delivered' && target === 'Revision') return true;
    if (current === 'In Progress' && target === 'Cancelled') return false; // Needs dispute or admin
    return false;
  }

  return false;
}
