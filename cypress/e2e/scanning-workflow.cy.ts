describe('Scanning Workflow', () => {
  beforeEach(() => {
    // Mock APIs
    cy.intercept('POST', '**/submitCrateDataToZoho', {
      statusCode: 200,
      body: { success: true, data: { crate_id: 'CRATE-1234' } }
    }).as('submitCrate');
    
    cy.intercept('GET', '**/fetchCrateDetails*', {
      statusCode: 200,
      body: { 
        success: true, 
        data: { 
          crate_id: 'CRATE-1234',
          bread_quantity: 24,
          last_updated: '2023-06-15T10:30:00Z' 
        }
      }
    }).as('fetchCrateDetails');
    
    // Login as field worker
    cy.login('fieldworker@example.com', 'password123');
    
    // Mock camera
    cy.mockCamera();
  });
  
  it('completes full scan workflow', () => {
    // Go to scanning page
    cy.get('[data-testid="scan-button"]').click();
    
    // Verify scanner is visible
    cy.get('[data-testid="scanner-container"]').should('be.visible');
    
    // Take a snapshot for visual testing
    cy.compareSnapshot('scanner-screen');
    
    // Simulate QR code scan
    cy.simulateQRScan('CRATE-1234');
    
    // Verify API call for crate details
    cy.wait('@fetchCrateDetails');
    
    // Verify crate details appeared
    cy.contains('CRATE-1234').should('be.visible');
    
    // Enter bread quantity
    cy.get('[data-testid="bread-quantity"]').type('30');
    
    // Take a snapshot of data entry
    cy.compareSnapshot('data-entry-screen');
    
    // Submit form
    cy.get('[data-testid="submit-button"]').click();
    
    // Verify submission API call
    cy.wait('@submitCrate');
    
    // Verify success message
    cy.contains('Submission successful').should('be.visible');
    
    // Take a snapshot of success screen
    cy.compareSnapshot('submission-success');
    
    // Check accessibility
    cy.checkAccessibility();
  });
  
  it('handles offline mode correctly', () => {
    // Simulate offline mode
    cy.intercept('**/fetchCrateDetails*', { forceNetworkError: true }).as('networkError');
    cy.intercept('**/submitCrateDataToZoho', { forceNetworkError: true });
    
    // Go to scanning page
    cy.get('[data-testid="scan-button"]').click();
    
    // Simulate QR code scan
    cy.simulateQRScan('CRATE-1234');
    
    // Check offline indicator
    cy.contains('Working offline').should('be.visible');
    
    // Enter bread quantity
    cy.get('[data-testid="bread-quantity"]').type('30');
    
    // Submit form
    cy.get('[data-testid="submit-button"]').click();
    
    // Verify data stored for sync
    cy.contains('Saved for later sync').should('be.visible');
    
    // Verify data in localStorage
    cy.window().then((win) => {
      const offlineData = JSON.parse(win.localStorage.getItem('offline_scans') || '[]');
      expect(offlineData).to.have.length.at.least(1);
      expect(offlineData[0].crate_id_input).to.equal('CRATE-1234');
    });
  });
  
  it('handles invalid QR codes', () => {
    // Go to scanning page
    cy.get('[data-testid="scan-button"]').click();
    
    // Simulate invalid QR code scan
    cy.simulateQRScan('INVALID-CODE');
    
    // Verify error message
    cy.contains('Invalid QR code format').should('be.visible');
    
    // Verify retry button is available
    cy.get('[data-testid="retry-scan"]').should('be.visible');
    
    // Click retry and try again
    cy.get('[data-testid="retry-scan"]').click();
    
    // Verify scanner is active again
    cy.get('[data-testid="scanner-container"]').should('be.visible');
  });
});
