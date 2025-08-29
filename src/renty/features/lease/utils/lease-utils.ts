/**
 * Shared utilities for lease-related functionality
 * Used across multiple components to avoid code duplication
 */

import type { LeaseStatus, LeaseType } from "@prisma/client"

/**
 * Get Tailwind CSS classes for lease status badge styling
 */
export const getLeaseStatusColor = (status: LeaseStatus | string): string => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    case 'EXPIRED':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    case 'TERMINATED':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }
}

/**
 * Get Tailwind CSS classes for lease type badge styling
 */
export const getLeaseTypeColor = (leaseType: LeaseType | string): string => {
  switch (leaseType) {
    case 'INDIVIDUAL':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    case 'SHARED':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
    case 'COLOCATION':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }
}

/**
 * Format currency amount for display
 */
export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

/**
 * Check if a lease is expired
 */
export const isLeaseExpired = (endDate: Date | string | null): boolean => {
  if (!endDate) return false
  return new Date(endDate) < new Date()
}

/**
 * Check if a lease is expiring soon (within 30 days)
 */
export const isLeaseExpiringSoon = (endDate: Date | string | null): boolean => {
  if (!endDate) return false
  const expiryDate = new Date(endDate)
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  return expiryDate <= thirtyDaysFromNow && expiryDate > new Date()
}

/**
 * Get lease duration in months
 */
export const getLeaseDurationInMonths = (startDate: Date | string, endDate: Date | string | null): number | null => {
  if (!endDate) return null
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const diffTime = end.getTime() - start.getTime()
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  
  return Math.ceil(diffDays / 30)
}

/**
 * Calculate total monthly rent including charges
 */
export const getTotalMonthlyRent = (rentAmount: number, charges?: number | null): number => {
  return rentAmount + (charges || 0)
}

/**
 * Calculate annual revenue from a lease
 */
export const getAnnualRevenue = (rentAmount: number, charges?: number | null): number => {
  return getTotalMonthlyRent(rentAmount, charges) * 12
}