import { type property } from "@prisma/client";
import type { JsonValue } from "@prisma/client/runtime/library";

type PaymentFrequency = "monthly" | "biweekly" | "quarterly" | "yearly";

function daysInMonth(month: number, year: number) {
    return new Date(year, month, 0).getDate();
  }

function getDaysDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date1.getTime() - date2.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function isLastDayOfMonth(date: Date): boolean {
    const daysInCurrentMonth = daysInMonth(date.getFullYear(), date.getMonth() + 1);
    return date.getDate() === daysInCurrentMonth;
}

function shouldGenerateMonthlyReceipt(startDate: Date, today: Date): boolean {
    const startDayOfMonth = startDate.getDate();
    
    // Special handling for end-of-month dates (29th, 30th, 31st)
    if (startDayOfMonth >= 29) {
        return isLastDayOfMonth(today);
    }
    
    return today.getDate() === startDayOfMonth;
}

function shouldGenerateYearlyReceipt(startDate: Date, today: Date): boolean {
    return today.getDate() === startDate.getDate() && 
           today.getMonth() === startDate.getMonth();
}

function shouldGeneratePeriodicReceipt(startDate: Date, today: Date, periodInDays: number): boolean {
    const diffDays = getDaysDifference(today, startDate);
    return diffDays % periodInDays === 0;
}

export interface RentDetails {
    baseRent: number;
    charges: number;
}

export function parseRentDetails(rentDetails: JsonValue): RentDetails | null {
    if (!rentDetails || typeof rentDetails !== 'object' || Array.isArray(rentDetails)) {
        return null;
    }

    const details = rentDetails as Record<string, JsonValue>;
    const baseRent = typeof details.baseRent === 'number' ? details.baseRent : null;
    const charges = typeof details.charges === 'number' ? details.charges : null;

    if (baseRent === null || charges === null) {
        return null;
    }

    return { baseRent, charges };
}

export function shouldGenerateReceipt(property: property, today: Date = new Date()): boolean {
    const { rentReceiptStartDate, paymentFrequency } = property;
    
    if (!rentReceiptStartDate) {
        return false;
    }

    const frequencyHandlers: Record<PaymentFrequency, () => boolean> = {
        monthly: () => shouldGenerateMonthlyReceipt(rentReceiptStartDate, today),
        yearly: () => shouldGenerateYearlyReceipt(rentReceiptStartDate, today),
        biweekly: () => shouldGeneratePeriodicReceipt(rentReceiptStartDate, today, 14),
        quarterly: () => shouldGeneratePeriodicReceipt(rentReceiptStartDate, today, 91)
    };

    return frequencyHandlers[paymentFrequency as PaymentFrequency]?.() ?? false;
}
