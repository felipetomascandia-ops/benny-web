export interface PublicReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  photoUrls: string[];
  createdAt?: string;
}

export interface BookingRecord {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  address?: string;
  projectDetails?: string;
  reservationDate: string;
  reservationTime: string;
  status: string;
}
