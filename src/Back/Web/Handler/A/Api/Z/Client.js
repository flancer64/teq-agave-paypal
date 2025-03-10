import {
    Client,
    Environment,
    LogLevel,
    OrdersController,
} from '@paypal/paypal-server-sdk';

/**
 * The client gets an app configuration and allows to use PayPal SDK.
 */
export default class Fl64_Paypal_Back_Web_Handler_A_Api_Z_Client {
    /**
     * Initializes the handler with required dependencies.
     *
     * @param {Fl64_Paypal_Back_Defaults} DEF
     * @param {TeqFw_Core_Back_Config} config
     * @param {typeof Fl64_Paypal_Back_Enum_Mode} MODE
     */
    constructor(
        {
            Fl64_Paypal_Back_Defaults$: DEF,
            TeqFw_Core_Back_Config$: config,
            'Fl64_Paypal_Back_Enum_Mode.default': MODE,
        }
    ) {
        // VARS
        let client, ordersController;

        // FUNCS
        /**
         * Get the configuration settings and create new PayPal client.
         * @returns {Client}
         */
        function getClient() {
            if (!client) {
                /** @type {Fl64_Paypal_Back_Plugin_Dto_Config_Local.Dto} */
                const cfg = config.getLocal(DEF.NAME);
                const environment = (cfg.mode === MODE.PRODUCTION) ? Environment.Production : Environment.Sandbox;
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

        this.getOrdersController = function () {
            if (!ordersController) {
                const client = getClient();
                ordersController = new OrdersController(client);
            }
            return ordersController;
        };
    }
}
