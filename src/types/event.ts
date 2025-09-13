export interface EventOrganizer {
  name: string;
  avatar: string;
  bio?: string;
}

export interface EventPricing {
  amount: number;
  currency: string;
  earlyBird?: {
    amount: number;
    endDate: Date;
  };
}

export interface EventDetails {
  id: string;
  title: string;
  description: string;
  images: string[];
  date: Date;
  location: string;
  category: string;
  organizer: EventOrganizer;
  tags: string[];
  pricing?: EventPricing;
  capacity?: number;
  duration?: string;
  venue?: string;
  highlights?: string[];
}

export interface EventDetailsModalProps {
  event: EventDetails;
  isOpen: boolean;
  onClose: () => void;
} 