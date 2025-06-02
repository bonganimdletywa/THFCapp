describe('Admin Features', () => {
  beforeEach(() => {
    // Login as admin
    cy.login('admin@example.com', 'admin123');
    
    // Verify we're on admin dashboard
    cy.url().should('include', '/admin');
  });
  
  it('displays and navigates admin dashboard correctly', () => {
    // Check admin dashboard elements
    cy.get('[data-testid="admin-dashboard-title"]').should('be.visible');
    cy.contains('Welcome, Admin').should('be.visible');
    
    // Check navigation links
    cy.get('[data-testid="users-link"]').should('be.visible');
    cy.get('[data-testid="crates-link"]').should('be.visible');
    
    // Take a snapshot of admin dashboard
    cy.compareSnapshot('admin-dashboard-full');
  });
  
  it('allows management of users', () => {
    // Navigate to users page
    cy.get('[data-testid="users-link"]').click();
    
    // Verify URL
    cy.url().should('include', '/admin/users');
    
    // Check user list is displayed
    cy.get('[data-testid="users-table"]').should('be.visible');
    
    // Check add user button
    cy.get('[data-testid="add-user-button"]').should('be.visible');
    
    // Take a snapshot of users page
    cy.compareSnapshot('admin-users-page');
    
    // Test user creation flow
    cy.get('[data-testid="add-user-button"]').click();
    cy.get('[data-testid="new-user-email"]').type('newuser@example.com');
    cy.get('[data-testid="new-user-name"]').type('New Test User');
    cy.get('[data-testid="new-user-role"]').select('field-worker');
    cy.get('[data-testid="save-user-button"]').click();
    
    // Verify new user appears in list
    cy.contains('newuser@example.com').should('be.visible');
  });
  
  it('allows management of crates', () => {
    // Navigate to crates page
    cy.get('[data-testid="crates-link"]').click();
    
    // Verify URL
    cy.url().should('include', '/admin/crates');
    
    // Check crates list is displayed
    cy.get('[data-testid="crates-table"]').should('be.visible');
    
    // Check add crate button
    cy.get('[data-testid="add-crate-button"]').should('be.visible');
    
    // Take a snapshot of crates page
    cy.compareSnapshot('admin-crates-page');
    
    // Test crate creation flow
    cy.get('[data-testid="add-crate-button"]').click();
    cy.get('[data-testid="new-crate-id"]').type('CRATE-9999');
    cy.get('[data-testid="new-crate-location"]').type('Warehouse A');
    cy.get('[data-testid="save-crate-button"]').click();
    
    // Verify new crate appears in list
    cy.contains('CRATE-9999').should('be.visible');
    
    // Test QR code generation
    cy.contains('CRATE-9999').parent().find('[data-testid="generate-qr-button"]').click();
    cy.get('[data-testid="qr-code-image"]').should('be.visible');
    cy.get('[data-testid="download-qr-button"]').should('be.visible');
    
    // Take a snapshot of QR code modal
    cy.compareSnapshot('qr-code-modal');
  });
  
  it('displays analytics on the dashboard', () => {
    // Verify analytics components
    cy.get('[data-testid="analytics-widget"]').should('have.length.at.least', 1);
    cy.get('[data-testid="crates-count"]').should('be.visible');
    cy.get('[data-testid="users-count"]').should('be.visible');
    cy.get('[data-testid="recent-activity"]').should('be.visible');
    
    // Check filtering options
    cy.get('[data-testid="date-range-filter"]').should('be.visible');
    cy.get('[data-testid="date-range-filter"]').select('Last 7 days');
    
    // Verify chart updates
    cy.get('[data-testid="activity-chart"]').should('be.visible');
    
    // Take a snapshot of dashboard with filter applied
    cy.compareSnapshot('admin-dashboard-filtered');
  });
});
