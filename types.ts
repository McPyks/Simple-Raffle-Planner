import { ReactNode } from "react";

export interface RaffleSlotType {
  id: number;
  name: string;
  cabin: string;
  note: string;
  paid: boolean;
}

export interface RaffleBoardType {
  id: string;
  title: string;
  slots: RaffleSlotType[];
  currency: 'USD' | 'EUR';
  slotPrice: number;
}