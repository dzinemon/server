// Import necessary modules
// require('dotenv').config();

// Define the configuration object
const config = {
  production: {
    baseUrl: `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`,
  },
  staging: {
    baseUrl: 'http://localhost:3000',
  },
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
}

// Export the appropriate configuration based on the environment
const baseConfig =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    ? config.production
    : config.staging

module.exports = {
  ...baseConfig,
  pagination: config.pagination,
}
