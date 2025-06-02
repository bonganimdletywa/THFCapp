// TypeScript definitions
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to log in to the application
       * @param email - The user's email
       * @param password - The user's password
       */
      login(email: string, password: string): Chainable<Element>;
      
      /**
       * Custom command to mock the camera for QR code scanning
       */
      mockCamera(): Chainable<Window>;
      
      /**
       * Custom command to simulate a QR code scan
       * @param qrValue - The value to simulate being scanned
       */
      simulateQRScan(qrValue: string): Chainable<Window>;
      
      /**
       * Custom command to check accessibility
       */
      checkAccessibility(): Chainable<Element>;
      
      /**
       * Custom command to take a screenshot for visual testing
       * @param name - The name of the snapshot
       */
      compareSnapshot(name: string): Chainable<Element>;
    }
  }
}

// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
});

// Mock camera for QR scanning
Cypress.Commands.add('mockCamera', () => {
  cy.window().then((win) => {
    cy.stub(win.navigator.mediaDevices, 'getUserMedia').resolves({
      getTracks: () => [{
        stop: () => {}
      }]
    });
  });
});

// Simulate QR code scan
Cypress.Commands.add('simulateQRScan', (qrValue) => {
  cy.window().then((win) => {
    // Create a synthetic event that simulates QR detection
    // This assumes your app listens for this custom event
    win.postMessage({ type: 'qr-detected', payload: qrValue }, '*');
    
    // If your app uses a global function for QR detection callback:
    if (typeof win.onQRCodeDetected === 'function') {
      win.onQRCodeDetected(qrValue);
    }
  });
});

// Add accessibility testing
Cypress.Commands.add('checkAccessibility', () => {
  // Note: This requires cypress-axe to be installed
  // This is a placeholder - you would need to install and import cypress-axe
  cy.log('Checking accessibility - placeholder for cypress-axe');
});

// Add visual testing command
Cypress.Commands.add('compareSnapshot', (name) => {
  // Note: This requires cypress-visual-regression to be installed
  // This is a placeholder - you would need to install and import cypress-visual-regression
  cy.screenshot(name);
  cy.log(`Took snapshot: ${name}`);
});

export {};
