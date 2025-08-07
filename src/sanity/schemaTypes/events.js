import { defineField, defineType } from "sanity";

export default defineType({
  name: "events",
  title: "Events",
  type: "document",
  icon: () => "📅",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
    }),
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: {
        list: [
          {title: "Previous Events", value: "previous_events"},
          {title: "Upcoming Events", value: "upcoming_events"},
        ]
      }
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
    }),
   defineField({
      name: "category",
      title: "Category",
      type: "string",
      options:{
        list:[
          {title:"Conference", value:"conference"},
          {title:"Seminar", value:"seminar"},
          {title:"Workshop", value:"workshop"},
          {title:"Webinar", value:"webinar"},
          {title:"Training", value:"training"},
          {title:"Other", value:"other"},
        ]
      }
    }),
    defineField({
      name:"event_organizer",
      title:"Event Organizer",
      type:"object",
      fields:[
        defineField({
          name:"name",
          title:"Name",
          type:"string",
        }),
        defineField({
          name:"role",
          title:"Role",
          type:"string",
        }),
        defineField({
          name:"image",
          title:"Image",
          type:"string",
        }),
      ]
    }),
    defineField({
      name:"gallery", 
      title:"Gallery",
      type:"array",
      of:[
        {
          type:"image",
          name:"GalleryImage",
          title:"Gallery Image",
          options: {
            hotspot: true
          },
          fields:[
            defineField({
              name:"isHero",
              title:"Is Hero",
              type:"boolean",
              initialValue:false,
            }),
            defineField({
              name:"alt",
              title:"Alt Text",
              type:"string",
            })
          ]
        }
      ]
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "date",
      media: "gallery.0.asset",
    },
    prepare({title, date, media}){
      return{
        title,
        subtitle: date? new Date(date).toLocaleDateString() : "No Date",
        media
      }
    }
  }
});