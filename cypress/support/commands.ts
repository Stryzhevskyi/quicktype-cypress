/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
import { TextDecoder } from 'util';

declare global {
    namespace Cypress {
        interface Chainable {
            collectTypes(): Chainable<void>
        }
    }
}

type RequestData = {
    urlPattern: string,
    response: string;
    request?: string;
    method: string;
};

const requests: Map<string, RequestData> = new Map();

const headerName = 'cypress-stack';
const xhrPatch = `<script>
(() => {
    const headerName = 'cypress-stack';
    const XMLHttpRequestOriginal = window.XMLHttpRequest;
    const open = XMLHttpRequestOriginal.prototype.open;
    XMLHttpRequestOriginal.prototype.open = function () {
      open.apply(this, arguments);
      try {
          const stack = (new Error()).stack.replaceAll('\\n', '<n>');
          this.setRequestHeader(headerName, stack);
      } catch (e) {
        console.error(e);
      } 
    };
})();
</script>
`;
// sourceMap.SourceMapConsumer.initialize({
//     "lib/mappings.wasm": "https://unpkg.com/source-map@0.7.3/lib/mappings.wasm"
// });

function addRequest({ req, res, stack, getStackLine }) {
    const reqBody = req.body;
    const resBody = res.body;
    const url = req.url;
    const initiator = getStackLine(stack.split('<n>'));
    const location = initiator.match(/\((.*)\)/)[1];
    const sourceUrl = location.split(':').slice(0, -2).join(':');
    const [line, column] = location.split(':').slice(-2).map((s) => parseInt(s));
    fetch('http://localhost:8001/request/', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            reqBody,
            resBody,
            url,
            sourceUrl,
            line,
            column,
        })
    }).then((res) => {
        console.log(res);
    });
}

function getStackLineDefault(stack: string[]) {
    return stack[stack.length - 2];
}

const decoder = new window.TextDecoder('utf-8');

Cypress.Commands.add('collectTypes', (getStackLine = getStackLineDefault) => {
    cy.intercept({
        method: 'GET',
        url: '**',
        middleware: true,
    }, (req) => {
        const stack = req.headers[headerName];
        delete req.headers[headerName];
        req.continue((res) => {
            if (res.headers['content-type']?.includes('text/html')) {
                let body = res.body;
                if (res.body instanceof ArrayBuffer) {
                    body = decoder.decode(body);
                }
                body = res.body.replace('</head>', `\n${xhrPatch}\n</head>`);
                res.send(res.statusCode, body, res.headers);
            } else if (res.headers['content-type']?.includes('application/json')) {
                res.send(res.statusCode, res.body, res.headers);
                addRequest({ req, res, stack, getStackLine });
            }
        })
    })
});
