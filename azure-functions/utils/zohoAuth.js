const axios = require('axios');

const ZOHO_OAUTH_URL = 'https://accounts.zoho.com/oauth/v2/token';
const ZOHO_API_URL = 'https://inventory.zoho.com/api/v1';

async function getZohoAccessToken(refreshToken) {
  try {
    const response = await axios.post(ZOHO_OAUTH_URL, null, {
      params: {
        refresh_token: refreshToken,
        client_id: process.env.ZOHO_INVENTORY_CLIENT_ID,
        client_secret: process.env.ZOHO_INVENTORY_CLIENT_SECRET,
        grant_type: 'refresh_token'
      }
    });

    return response.data.access_token;
  } catch (error) {
    throw new Error(`Failed to get Zoho access token: ${error.message}`);
  }
}

async function updateZohoInventory(accessToken, data) {
  try {
    const { crate_id_input: crateId, bread_quantity, location } = data;
    
    // First, get the current item
    const getResponse = await axios.get(`${ZOHO_API_URL}/items`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      params: { sku: crateId }
    });

    if (!getResponse.data.items || getResponse.data.items.length === 0) {
      throw new Error(`Crate ${crateId} not found in Zoho inventory`);
    }

    const item = getResponse.data.items[0];

    // Update the item quantity
    const updateResponse = await axios.put(
      `${ZOHO_API_URL}/items/${item.item_id}`,
      {
        name: item.name,
        sku: crateId,
        initial_stock: bread_quantity,
        initial_stock_rate: item.rate || 0,
        status: 'active'
      },
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );

    return updateResponse.data;
  } catch (error) {
    throw new Error(`Failed to update Zoho inventory: ${error.message}`);
  }
}

async function createZohoInventoryItem(accessToken, data) {
  try {
    const { crate_id, initial_bread_quantity = 0, location } = data;

    const response = await axios.post(
      `${ZOHO_API_URL}/items`,
      {
        name: `Crate ${crate_id}`,
        sku: crate_id,
        initial_stock: initial_bread_quantity,
        initial_stock_rate: 0,
        status: 'active',
        description: `Bread crate ${crate_id}${location ? ` at ${location}` : ''}`
      },
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(`Failed to create Zoho inventory item: ${error.message}`);
  }
}

module.exports = {
  getZohoAccessToken,
  updateZohoInventory,
  createZohoInventoryItem
}; 