import { createClient } from '@sanity/client'
import React from 'react'

// This is the new pattern for accessing the client in Sanity Studio
// Use this instead of configContext.client
export const getStudioClient = (context) => {
  return context.getClient({ apiVersion: '2025-07-20' })
}

// Alternative: Create a client with the new pattern
export const createStudioClient = () => {
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2025-07-20',
    useCdn: false, // Studio should not use CDN
  })
}

// Example: Custom input component using the new client pattern
export const createCustomInputComponent = () => {
  return {
    name: 'customGallery',
    title: 'Custom Gallery',
    type: 'object',
    fields: [
      {
        name: 'images',
        title: 'Images',
        type: 'array',
        of: [{ type: 'image' }],
        components: {
          input: (props) => {
            const { value, onChange, context } = props
            
            // Use the new client method instead of configContext.client
            const client = context.getClient({ apiVersion: '2025-07-20' })
            
            // Your custom component logic here
            return React.createElement('div', {
              // Custom input component
            })
          }
        }
      }
    ]
  }
}

// Example: Custom document action using the new client pattern
export const createCustomDocumentAction = () => {
  return {
    name: 'customAction',
    title: 'Custom Action',
    onHandle: async (props) => {
      const { draft, published, context } = props
      
      // Use the new client method
      const client = context.getClient({ apiVersion: '2025-07-20' })
      
      // Your custom action logic here
      console.log('Custom action executed')
    }
  }
} 