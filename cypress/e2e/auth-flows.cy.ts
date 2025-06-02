describe('Authentication Flows', () => {
  beforeEach(() => {
    // Reset any previous state
    cy.clearLocalStorage();
    cy.clearCookies();
    
    // Visit the homepage (login page)
    cy.visit('/');
  });
  
  it('allows a field worker to login', () => {
    // Check login page elements
    cy.get('[data-testid="email-input"]').should('be.visible');
    cy.get('[data-testid="password-input"]').should('be.visible');
    cy.get('[data-testid="login-button"]').should('be.visible');
    
    // Take a snapshot of login page
    cy.compareSnapshot('login-page');
    
    // Perform login
    cy.get('[data-testid="email-input"]').type('fieldworker@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    
    // Verify redirect to field worker dashboard
    cy.url().should('include', '/field-worker');
    
    // Verify field worker UI elements
    cy.get('[data-testid="scan-button"]').should('be.visible');
    
    // Take a snapshot of field worker dashboard
    cy.compareSnapshot('field-worker-dashboard');
  });
  
  it('allows an admin to login', () => {
    // Perform admin login
    cy.get('[data-testid="email-input"]').type('admin@example.com');
    cy.get('[data-testid="password-input"]').type('admin123');
    cy.get('[data-testid="login-button"]').click();
    
    // Verify redirect to admin dashboard
    cy.url().should('include', '/admin');
    
    // Verify admin UI elements
    cy.get('[data-testid="admin-dashboard-title"]').should('be.visible');
    cy.get('[data-testid="users-link"]').should('be.visible');
    cy.get('[data-testid="crates-link"]').should('be.visible');
    
    // Take a snapshot of admin dashboard
    cy.compareSnapshot('admin-dashboard');
  });
  
  it('shows error for invalid credentials', () => {
    // Attempt login with invalid credentials
    cy.get('[data-testid="email-input"]').type('wrong@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();
    
    // Verify error message
    cy.contains('Invalid email or password').should('be.visible');
    
    // Verify we're still on login page
    cy.url().should('not.include', '/field-worker');
    cy.url().should('not.include', '/admin');
  });
  
  it('allows logout functionality', () => {
    // Login first
    cy.get('[data-testid="email-input"]').type('fieldworker@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    
    // Verify we're logged in
    cy.url().should('include', '/field-worker');
    
    // Find and click logout button
    cy.get('[data-testid="logout-button"]').click();
    
    // Verify redirect to login page
    cy.url().should('not.include', '/field-worker');
    cy.get('[data-testid="email-input"]').should('be.visible');
  });
});
