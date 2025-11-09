describe('Fullstack starter smoke', () => {
  it('should render the login page by default', () => {
    cy.visit('/');
    cy.contains('Sign in');
    cy.get('form').should('exist');
  });
});
