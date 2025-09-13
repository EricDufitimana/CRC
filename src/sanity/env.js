export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION

// Try to get from environment, with fallbacks
const getEnvVar = (key, fallback) => {
  const value = process.env[key] || fallback
  if (!value) {
    console.warn(`Environment variable ${key} not found, using fallback`)
  }
  return value
}

export const dataset = getEnvVar('NEXT_PUBLIC_SANITY_DATASET', 'production')

export const projectId = getEnvVar('NEXT_PUBLIC_SANITY_PROJECT_ID', 'x8lmg4a1')

export const token = process.env.SANITY_WRITE_TOKEN

function assertValue(v, errorMessage) {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
} 