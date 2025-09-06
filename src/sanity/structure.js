import { apiVersion } from './env.js'

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
            .apiVersion(apiVersion)
            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
        ),
  
      S.listItem()
        .title('Events')
        .schemaType('events')
        .child(
          S.documentList()
            .title('Events')
            .schemaType('events')
            .filter('_type == "events"')
            .apiVersion(apiVersion)
            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
        ),
    ])
