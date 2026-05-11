export interface BookingRequest {
  screening_id: number;
  seats: string[];
}

export interface BookingSummary {
  confirmed: boolean;
  movie: string;
  date: string;
  time: string;
  seats: string[];
  totalPrice: number;
  confirmationCode?: string;
  error?: string;
}
