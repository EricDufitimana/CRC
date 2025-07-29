import { defineField, defineType } from "sanity";

export const resource = defineType({
  name: "resource",
  title: "Resource",
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
      name: "url",
      title: "URL",
      type: "url",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "secondary_url",
      title: "Secondary URL",
      type: "url",
    }),
    defineField({
      name: "image_address",
      title: "Image Address",
      type: "url",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          {title: "Internship" , value: "internship"},
          {title: "Templates", value: "templates"},
          {title: "New Opportunities", value: "new_opportunities"},
          {title: "English Language Learning", value: "english_language_learning"},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "opportunity_deadline",
      title: "Opportunity Deadline",
      type: "date",
    })
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category",
      media: "image", 
    },
  },
}); 
