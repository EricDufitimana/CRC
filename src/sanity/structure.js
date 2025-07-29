import { structure } from 'sanity/structure'

export const structureBuilder = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Resources')
        .schemaType('resource')
        .child(
          S.documentList()
            .title('Resources')
            .schemaType('resource')
            .filter('_type == "resource"')
            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
        ),
      S.listItem()
        .title('Workshops')
        .schemaType('workshops')
        .child(
          S.documentList()
            .title('Workshops')
            .schemaType('workshops')
            .filter('_type == "workshops"')
            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
        ),
    ])
