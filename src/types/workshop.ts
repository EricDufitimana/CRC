export interface Workshop {
  _id: string;
  title: string;
  description: string;
  presentation_pdf_url: string;
  workshop_date: string;
  workshop_group: string;
  _createdAt: string;
  assignment?: {
    assignment_title: string;
    assignment_description: string;
    assignment_submission_url: string;
    assignment_submission_deadline: string;
  };
} 