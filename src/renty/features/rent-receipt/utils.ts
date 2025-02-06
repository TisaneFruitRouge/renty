import { type property } from "@prisma/client";
import type { JsonValue } from "@prisma/client/runtime/library";

interface MonthRange {
  startDate: Date;
  endDate: Date;
}

export function getMonthRange(date: Date): MonthRange {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  return {
    startDate: new Date(year, month, 1),
    endDate: new Date(year, month + 1, 0)
  };
}

function daysInMonth(month: number, year: number) {
    return new Date(year, month, 0).getDate();
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
    const { rentReceiptStartDate } = property;
    
    if (!rentReceiptStartDate) {
        return false;
    }

    return shouldGenerateMonthlyReceipt(rentReceiptStartDate, today);
}
