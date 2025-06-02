// Import commands for component testing
import './commands';

// Import React mount command
import { mount } from 'cypress/react18';

// Add mount command to Cypress
Cypress.Commands.add('mount', mount);

// Declare mount in global Cypress namespace
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}
