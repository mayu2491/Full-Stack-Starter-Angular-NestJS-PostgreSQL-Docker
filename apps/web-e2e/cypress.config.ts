import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    supportFile: 'src/support/e2e.ts',
    specPattern: 'src/e2e/**/*.cy.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:4200'
  }
});
