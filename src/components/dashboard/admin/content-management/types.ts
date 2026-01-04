export type Resource = {
  id: string;
  title: string;
  description: string;
  url: string | null;
  secondary_url: string | null;
  image_address: string | null;
  created_at: string | null;
  opportunity_deadline: string | null;
  category: string;
  status: 'active' | 'inactive' | null;
};
