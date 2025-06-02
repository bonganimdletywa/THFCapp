const axios = require('axios');

class ZohoApi {
    constructor() {
        this.baseUrl = 'https://inventory.zoho.com/api/v1';
        this.clientId = process.env.ZOHO_CLIENT_ID || process.env.ZOHO_INVENTORY_CLIENT_ID;
        this.clientSecret = process.env.ZOHO_CLIENT_SECRET || process.env.ZOHO_INVENTORY_CLIENT_SECRET;
        this.organizationId = process.env.ZOHO_ORGANIZATION_ID || process.env.ZOHO_INVENTORY_ORGANIZATION_ID;
        this.refreshToken = process.env.ZOHO_REFRESH_TOKEN;
        this.accessToken = process.env.ZOHO_ACCESS_TOKEN;
        
        // Log configuration for debugging
        console.log('Zoho API Configuration:', {
            baseUrl: this.baseUrl,
            clientId: this.clientId ? '***' : 'MISSING',
            clientSecret: this.clientSecret ? '***' : 'MISSING',
            organizationId: this.organizationId || 'MISSING',
            refreshToken: this.refreshToken ? '***' : 'MISSING',
            accessToken: this.accessToken ? '***' : 'MISSING'
        });
        this.tokenExpiry = 0;
    }

    async refreshAccessToken() {
        try {
            const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
                params: {
                    refresh_token: this.refreshToken,
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    grant_type: 'refresh_token'
                }
            });

            this.accessToken = response.data.access_token;
            // Set token expiry to 55 minutes from now (tokens typically last 1 hour)
            this.tokenExpiry = Date.now() + (55 * 60 * 1000);
            process.env.ZOHO_ACCESS_TOKEN = this.accessToken;
            
            return this.accessToken;
        } catch (error) {
            console.error('Error refreshing Zoho access token:', error.response?.data || error.message);
            throw new Error('Failed to refresh Zoho access token');
        }
    }

    async ensureValidToken() {
        if (!this.accessToken || Date.now() >= this.tokenExpiry) {
            await this.refreshAccessToken();
        }
        return this.accessToken;
    }

    async makeRequest(method, endpoint, data = null, params = {}) {
        try {
            const token = await this.ensureValidToken();
            const url = `${this.baseUrl}${endpoint}`;
            
            const response = await axios({
                method,
                url,
                headers: {
                    'Authorization': `Zoho-oauthtoken ${token}`,
                    'Content-Type': 'application/json',
                    'X-com-zoho-inventory-organizationid': this.organizationId
                },
                params,
                data
            });

            return response.data;
        } catch (error) {
            console.error('Zoho API request failed:', {
                endpoint,
                error: error.response?.data || error.message
            });
            
            // If token is expired, try refreshing it once and retry
            if (error.response?.status === 401) {
                await this.refreshAccessToken();
                return this.makeRequest(method, endpoint, data, params);
            }
            
            throw error;
        }
    }

    // Example methods for specific endpoints
    async getItems(params = {}) {
        return this.makeRequest('GET', '/items', null, params);
    }

    async createItem(itemData) {
        return this.makeRequest('POST', '/items', JSON.stringify(itemData));
    }

    async getSalesOrders(params = {}) {
        return this.makeRequest('GET', '/salesorders', null, params);
    }

    async createSalesOrder(orderData) {
        return this.makeRequest('POST', '/salesorders', JSON.stringify(orderData));
    }
    
    // Add more methods as needed for your application
}

module.exports = new ZohoApi();
