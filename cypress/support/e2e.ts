// Import Cypress commands
import './commands';

// Prevent uncaught exceptions from failing tests
Cypress.on('uncaught:exception', () => {
  // Returning false prevents Cypress from failing the test
  return false;
});

// Log test start and end for better debugging
beforeEach(() => {
  cy.log(`**Starting test: ${Cypress.currentTest.title}**`);
});

afterEach(() => {
  cy.log(`**Finished test: ${Cypress.currentTest.title}**`);
});
