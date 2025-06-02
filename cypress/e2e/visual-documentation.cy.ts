describe('Visual Documentation', () => {
  it('documents all main screens for the application', () => {
    // Login screen
    cy.visit('/');
    cy.compareSnapshot('01-login-screen');
    
    // Login as field worker
    cy.login('fieldworker@example.com', 'password123');
    cy.compareSnapshot('02-field-worker-dashboard');
    
    // Scanner screen
    cy.get('[data-testid="scan-button"]').click();
    cy.mockCamera();
    cy.compareSnapshot('03-scanner-screen');
    
    // After scan screen (mock a scan)
    cy.simulateQRScan('CRATE-1234');
    cy.wait('@fetchCrateDetails');
    cy.compareSnapshot('04-scan-result');
    
    // Form filling
    cy.get('[data-testid="bread-quantity"]').type('30');
    cy.compareSnapshot('05-data-entry');
    
    // Success screen
    cy.get('[data-testid="submit-button"]').click();
    cy.wait('@submitCrate');
    cy.compareSnapshot('06-submission-success');
    
    // Logout and login as admin
    cy.get('[data-testid="logout-button"]').click();
    cy.login('admin@example.com', 'admin123');
    cy.compareSnapshot('07-admin-dashboard');
    
    // Admin users page
    cy.get('[data-testid="users-link"]').click();
    cy.compareSnapshot('08-admin-users');
    
    // Admin crates page
    cy.get('[data-testid="crates-link"]').click();
    cy.compareSnapshot('09-admin-crates');
    
    // QR code generation
    cy.get('[data-testid="add-crate-button"]').click();
    cy.get('[data-testid="new-crate-id"]').type('CRATE-9999');
    cy.get('[data-testid="new-crate-location"]').type('Warehouse A');
    cy.get('[data-testid="save-crate-button"]').click();
    cy.contains('CRATE-9999').parent().find('[data-testid="generate-qr-button"]').click();
    cy.compareSnapshot('10-qr-code-generation');
  });
});
