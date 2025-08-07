'use client'

/**
 * This configuration is used to for the Sanity Studio that's mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './src/sanity/env.js'
import {schema} from './src/sanity/schemaTypes/index.js'
import {structureBuilder} from './src/sanity/structure.js'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  apiVersion, // Add explicit apiVersion
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  plugins: [
    structureTool({structure: structureBuilder}),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool(),
  ],
  // Fix for React 18 compatibility
  vite: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-dom/server': 'react-dom/server.browser',
    };
    
    return config;
  },
}) 