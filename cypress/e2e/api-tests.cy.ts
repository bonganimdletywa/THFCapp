describe('API Integration Tests', () => {
  // Get auth token before tests
  let authToken: string;
  
  before(() => {
    // This simulates getting an auth token
    // In a real app, you would use your auth mechanism
    cy.request({
      method: 'POST',
      url: `${Cypress.env('API_URL')}/login`, // Replace with your actual login endpoint
      body: {
        email: 'admin@example.com',
        password: 'admin123'
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      authToken = response.body.token;
    });
  });
  
  it('tests submitCrateDataToZoho Lambda function', () => {
    // Prepare payload
    const payload = {
      crate_id_input: 'CRATE-1234',
      bread_quantity: 30
    };
    
    // Direct API test
    cy.request({
      method: 'POST',
      url: `${Cypress.env('API_URL')}/submitCrateDataToZoho`,
      headers: {
        'Authorization': `Bearer ${authToken || 'test-token'}`
      },
      body: payload
    }).then((response) => {
      // Validate response
      expect(response.status).to.eq(200);
      expect(response.body.success).to.be.true;
      expect(response.body.data.crate_id).to.eq('CRATE-1234');
      expect(response.body.data.bread_quantity).to.eq(30);
      expect(response.body.data).to.have.property('last_updated');
    });
  });
  
  it('tests fetchCrateDetails Lambda function', () => {
    // Direct API test
    cy.request({
      method: 'GET',
      url: `${Cypress.env('API_URL')}/fetchCrateDetails?crateId=CRATE-1234`,
      headers: {
        'Authorization': `Bearer ${authToken || 'test-token'}`
      }
    }).then((response) => {
      // Validate response
      expect(response.status).to.eq(200);
      expect(response.body.success).to.be.true;
      expect(response.body.data.crate_id).to.eq('CRATE-1234');
      expect(response.body.data).to.have.property('bread_quantity');
      expect(response.body.data).to.have.property('location');
      expect(response.body.data).to.have.property('last_updated');
    });
  });
  
  it('tests createCrateInZoho Lambda function', () => {
    // Generate a unique crate ID for testing
    const uniqueCrateId = `CRATE-TEST-${Date.now()}`;
    
    // Prepare payload
    const payload = {
      crate_id: uniqueCrateId,
      location: 'Test Warehouse',
      initial_bread_quantity: 10
    };
    
    // Direct API test
    cy.request({
      method: 'POST',
      url: `${Cypress.env('API_URL')}/createCrateInZoho`,
      headers: {
        'Authorization': `Bearer ${authToken || 'test-token'}`
      },
      body: payload
    }).then((response) => {
      // Validate response
      expect(response.status).to.eq(200);
      expect(response.body.success).to.be.true;
      expect(response.body.data.crate_id).to.eq(uniqueCrateId);
      expect(response.body.data.message).to.contain('successfully');
      
      // Verify the crate can be fetched
      cy.request({
        method: 'GET',
        url: `${Cypress.env('API_URL')}/fetchCrateDetails?crateId=${uniqueCrateId}`,
        headers: {
          'Authorization': `Bearer ${authToken || 'test-token'}`
        }
      }).then((fetchResponse) => {
        expect(fetchResponse.status).to.eq(200);
        expect(fetchResponse.body.success).to.be.true;
        expect(fetchResponse.body.data.crate_id).to.eq(uniqueCrateId);
        expect(fetchResponse.body.data.bread_quantity).to.eq(10);
      });
    });
  });
  
  it('handles authentication errors correctly', () => {
    // Test with invalid token
    cy.request({
      method: 'POST',
      url: `${Cypress.env('API_URL')}/submitCrateDataToZoho`,
      headers: {
        'Authorization': 'Bearer invalid-token'
      },
      body: {
        crate_id_input: 'CRATE-1234',
        bread_quantity: 30
      },
      failOnStatusCode: false
    }).then((response) => {
      // Validate error response
      expect(response.status).to.eq(401);
      expect(response.body.success).to.be.false;
    });
  });
  
  it('handles validation errors correctly', () => {
    // Test with invalid payload (missing required field)
    cy.request({
      method: 'POST',
      url: `${Cypress.env('API_URL')}/submitCrateDataToZoho`,
      headers: {
        'Authorization': `Bearer ${authToken || 'test-token'}`
      },
      body: {
        // Missing bread_quantity
        crate_id_input: 'CRATE-1234'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Validate error response
      expect(response.status).to.eq(400);
      expect(response.body.success).to.be.false;
      expect(response.body.error).to.contain('bread_quantity');
    });
  });
  
  it('handles non-existent crate correctly', () => {
    // Test with a crate that doesn't exist
    cy.request({
      method: 'GET',
      url: `${Cypress.env('API_URL')}/fetchCrateDetails?crateId=NON-EXISTENT-CRATE`,
      headers: {
        'Authorization': `Bearer ${authToken || 'test-token'}`
      },
      failOnStatusCode: false
    }).then((response) => {
      // Validate error response
      expect(response.status).to.eq(404);
      expect(response.body.success).to.be.false;
      expect(response.body.error).to.contain('not found');
    });
  });
});
