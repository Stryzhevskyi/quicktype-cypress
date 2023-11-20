/// <reference types="cypress" />

describe('Smoke test', () => {
    before(() => {
        cy.collectTypes();
        cy.visit('http://localhost:3000/');
        cy.intercept(/pokeapi\.co\/api\/v2\/pokemon\/\d+/).as('pokemon')
    })
    it('should load something', () => {
        cy.get('[test-id="pokemon-view-bulbasaur"]')
          .should('be.visible')
          .click();

        // TODO figure iut why alias is not working
        // cy.wait('@pokemon').then((res) => {
        //     console.log(res)
        // });
    });
});
