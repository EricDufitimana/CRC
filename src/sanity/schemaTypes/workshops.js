import { defineType, defineField } from "sanity";

export const workshops = defineType({
  name: "workshops",
  title: "Workshops",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "presentation_pdf_url",
      title: "Presentation PDF URL",
      type: "url",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "workshop_date",
      title: "Workshop Date",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "workshop_group",
      title: "Workshop Group",
      type: "string",
      options: {
        list: [
          {title: "EY", value: "ey"},
          {title: "Senior 4", value: "senior_4"},
          {title: "Senior 5 - Group A+B", value: "senior_5_group_a_b"},
          {title: "Senior 5 - Customer Care", value: "senior_5_customer_care"},
          {title: "Senior 6 - Group A+B", value: "senior_6_group_a_b"},
          {title: "Senior 6 - Group C", value: "senior_6_group_c"},
          {title: "Senior 6 - Group D", value: "senior_6_group_d"},
          {title: "Senior 6 - Job Readiness Course", value: "senior_6_job_readiness_course"},
        ]
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "assignment", 
      title: "Assignment",
      type: "object",
      fields:  [
        defineField({
          name: "assignment_title",
          title: "Assignment Title",
          type: "string",
        }),
        defineField({
          name: "assignment_description",
          title: "Assignment Description",
          type: "text",
        }),
        defineField({
          name: "assignment_submission_url",
          title: "Assignment Submission URL",
          type: "url",
        }),
        defineField({
          name: "assignment_submission_deadline",
          title: "Assignment Submission Deadline",
          type: "date",
        })
      ]
    })
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "workshop_group",
      media: "image",
    },
  },
});