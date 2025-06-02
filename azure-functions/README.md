# THFC RF Scanner - Azure Functions

This project contains Azure Functions for the THFC RF Scanner application, handling backend operations including Zoho API integration.

## Prerequisites

- Node.js 16.x or later
- Azure Functions Core Tools v4.x
- Azure CLI (optional, for deployment)
- Zoho Inventory API credentials

## Setup

1. Install dependencies:
   ```bash
   cd functions
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Zoho API credentials

3. For local development, update `local.settings.json` with your configuration.

## Running Locally

1. Start the Azure Functions runtime:
   ```bash
   cd functions
   npm start
   ```

2. The functions will be available at:
   - Submit Crate Data: `POST http://localhost:7071/api/crates`

## Deployment

1. Install Azure CLI and log in:
   ```bash
   az login
   ```

2. Create a new Function App in Azure Portal or using CLI:
   ```bash
   az functionapp create --resource-group <resource-group> --consumption-plan-location <location> --runtime node --runtime-version 16 --functions-version 4 --name <app-name> --storage-account <storage-account>
   ```

3. Deploy the function app:
   ```bash
   cd functions
   func azure functionapp publish <app-name>
   ```

## Available Functions

- **submitCrateData**: Handles submission of crate scanning data
  - Method: POST
  - Route: /api/crates
  - Body: JSON with crate data

## Environment Variables

- `ZOHO_INVENTORY_CLIENT_ID`: Zoho OAuth client ID
- `ZOHO_INVENTORY_CLIENT_SECRET`: Zoho OAuth client secret
- `ZOHO_INVENTORY_ORGANIZATION_ID`: Zoho organization ID
- `ZOHO_REFRESH_TOKEN`: Zoho OAuth refresh token
- `ZOHO_ACCESS_TOKEN`: Zoho OAuth access token (auto-refreshed)

## Development

- Use TypeScript for type safety
- Add new functions in the `functions` directory
- Run `npm run build` to compile TypeScript to JavaScript
- Run `npm run watch` for development with auto-rebuild
