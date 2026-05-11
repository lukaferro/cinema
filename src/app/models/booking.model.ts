export interface BookingRequest {
  first_name: string;
  last_name: string;
  email: string;
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
