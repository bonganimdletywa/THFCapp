const { getZohoAccessToken, updateZohoInventory, createZohoInventoryItem } = require('../utils/zohoAuth');

class CrateService {
  constructor(context) {
    this.context = context;
  }

  async submitCrateData(data) {
    const {
      crate_id_input,
      bread_quantity,
      device_scan_id,
      is_offline_scan,
      stock_source,
      dispatch_order_ref,
      donation_batch_ref,
      location
    } = data;

    // Log operation
    this.context.log.info('Submitting crate data:', {
      crate_id: crate_id_input,
      location,
      is_offline_scan
    });

    const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
    if (!refreshToken) {
      throw new Error('Zoho refresh token not configured');
    }

    // Get access token and update inventory
    const accessToken = await getZohoAccessToken(refreshToken);
    const zohoResult = await updateZohoInventory(accessToken, data);

    return {
      crate_id: crate_id_input,
      updated_quantity: bread_quantity,
      timestamp: new Date().toISOString(),
      zoho_item_id: zohoResult.item_id
    };
  }

  async createCrate(data) {
    const { crate_id, location, initial_bread_quantity } = data;

    // Log operation
    this.context.log.info('Creating new crate:', {
      crate_id,
      location
    });

    const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
    if (!refreshToken) {
      throw new Error('Zoho refresh token not configured');
    }

    // Get access token and create inventory item
    const accessToken = await getZohoAccessToken(refreshToken);
    const zohoResult = await createZohoInventoryItem(accessToken, data);

    return {
      crate_id,
      location,
      initial_bread_quantity,
      created_at: new Date().toISOString(),
      zoho_item_id: zohoResult.item_id
    };
  }
}

module.exports = CrateService; 