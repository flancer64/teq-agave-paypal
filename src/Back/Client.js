/**
 * The client gets an app configuration and allows to use PayPal SDK.
 */
export default class Fl64_Paypal_Back_Client {
    /**
     * Initializes the handler with required dependencies.
     *
     * @param {typeof import('@paypal/paypal-server-sdk')} paypal
     * @param {Fl64_Paypal_Back_Defaults} DEF
     * @param {TeqFw_Core_Back_Config} config
     * @param {typeof Fl64_Paypal_Back_Enum_Mode} MODE
     */
    constructor(
        {
            'node:@paypal/paypal-server-sdk': paypal,
            Fl64_Paypal_Back_Defaults$: DEF,
            TeqFw_Core_Back_Config$: config,
            Fl64_Paypal_Back_Enum_Mode$: MODE,
        }
    ) {
        // VARS
        const {Client, Environment, LogLevel, OrdersController} = paypal;

        /** @type {Fl64_Paypal_Back_Plugin_Dto_Config_Local.Dto} */
        let cfg;
        let client, ordersController;

        // FUNCS
        /**
         * Get the configuration settings and create new PayPal client.
         * @returns {Client}
         */
        function getClient() {
            if (!client) {
                cfg = config.getLocal(DEF.NAME);
                const environment = (cfg?.mode?.toUpperCase() === MODE.PRODUCTION) ? Environment.Production : Environment.Sandbox;
                client = new Client({
                    clientCredentialsAuthCredentials: {
                        oAuthClientId: cfg.clientId,
                        oAuthClientSecret: cfg.clientSecret,
                    },
                    timeout: 0,
                    environment,
                    logging: {
                        logLevel: LogLevel.Info,
                        logRequest: {logBody: true},
                        logResponse: {logHeaders: true},
                    },
                });
            }
            return client;

        }

        // MAIN

        /**
         * Return the PayPal `clientId` from the local configuration.
         * @returns {string}
         */
        this.getClientId = function () {
            if (!client) getClient();
            return cfg.clientId;
        };

        this.getOrdersController = function () {
            if (!ordersController) {
                const client = getClient();
                ordersController = new OrdersController(client);
            }
            return ordersController;
        };
    }
}
