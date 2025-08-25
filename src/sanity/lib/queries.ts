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

export const getPreviousEvents = groq`
*[_type=="events" && type=="previous_events"] | order(_createdAt desc){
  _id, _createdAt, category, date, description, event_organizer, gallery, location, title
}
`;

export const getS4Workshops = groq`
  *[_type=="workshops" && workshop_group=="senior_4"] | order(_createdAt desc) {
  _id, description, presentation_pdf_url, title, workshop_date, _createAt
}
`;

export const getWorkshopsByGroup = groq`
  *[_type=="workshops" && workshop_group==$workshopGroup] | order(_createdAt desc) {
  _id, description, presentation_pdf_url, title, workshop_date, workshop_group, _createdAt, assignment
}
`;

export const getAllWorkshops = groq`
  *[_type=="workshops"] | order(_createdAt desc) {
  _id, description, presentation_pdf_url, title, workshop_date, workshop_group, _createdAt, assignment
}
`;

export const getRecentResources = groq`
  *[_type == "resource"] | order(_createdAt desc)[0...6] {
    _id,
    title,
    category,
    _createdAt
  }
`;
