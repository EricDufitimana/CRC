import { groq } from 'next-sanity';

export const getNewOpportunities = groq`
  *[_type == "resource" && category=="new_opportunities"] | order(_createdAt desc) {
  _id, category, description, title, url, image_address, __createdAt, opportunity_deadline
}
`;

export const getTemplates = groq`
  *[_type=="resource" && category=="templates"] | order(_createdAt desc) {
  _createdAt, _id, description, image_address, url, secondary_url, title, opportunity_deadline
}
`;

export const getEnglishLanguageLearning = groq`
  *[_type == "resource" && category=="english_language_learning"] | order(_createdAt desc) {
  _id, category, description, title, url, image_address, __createdAt, opportunity_deadline
}
`;

export const getELL = groq`
  *[_type=="resource" && category=="english_language_learning"] | order(_createdAt desc) {
  _createdAt, _id, description, image_address, title, url, opportunity_deadline
}
`;

export const getRecurringOpportunities = groq`
  *[_type == "resource" && category=="recurring_opportunities"] | order(_createdAt desc) {
  _id, category, description, title, url, image_address, __createdAt, opportunity_deadline
}
`;

export const getPreviousEvents = groq`
  *[_type == "resource" && category=="previous_events"] | order(_createdAt desc) {
  _id, category, description, title, url, image_address, __createdAt, opportunity_deadline
}
`;

export const getUpcomingEvents = groq`
  *[_type == "resource" && category=="upcoming_events"] | order(_createdAt desc) {
  _id, category, description, title, url, image_address, __createdAt, opportunity_deadline
}
`;

export const getWorkshopByCategory = groq`
  *[_type == "resource" && category==$workshopCategory] | order(_createdAt desc) {
  _id, category, description, title, url, image_address, __createdAt, opportunity_deadline
}
`;