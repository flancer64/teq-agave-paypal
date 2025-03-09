/**
 * Common ES6 module for setting up a DI container and initializing an application factory.
 */
import Container from '/src/@teqfw/di/Container.js';

/** @type {TeqFw_Di_Container} */
const container = new Container();

// Configure the resolver for handling dependencies by namespace.
const resolver = container.getResolver();
resolver.addNamespaceRoot('Fl64_Paypal_', '/src/@flancer64/teq-agave-paypal'); // Plugin namespace
resolver.addNamespaceRoot('TeqFw_Core_', '/src/@teqfw/core', 'mjs'); // Core plugin namespace
resolver.addNamespaceRoot('TeqFw_Web_', '/src/@teqfw/web', 'mjs'); // Web plugin namespace

export default container;
