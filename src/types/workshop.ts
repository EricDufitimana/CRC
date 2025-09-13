export interface Workshop {
  _id: string;
  id: string;
  title: string;
  description: string;
  presentation_pdf_url?: string;
  presentation_url?: string;
  workshop_date?: string;
  date?: string;
  workshop_group?: string;
  _createdAt?: string;
  created_at?: string;
  has_assignment?: boolean;
  assignments?: Array<{
    id: string;
    title: string;
    description: string;
    submission_style: string;
    submission_idate?: string;
  }>;
  crc_classes?: Array<{
    id: string;
    name: string;
  }>;
  assignment?: {
    assignment_title: string;
    assignment_description: string;
    assignment_submission_url: string;
    assignment_submission_deadline: string;
  };
} 