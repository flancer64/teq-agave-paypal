import {constants as H2} from 'node:http2';
import {
    ApiError,
    CheckoutPaymentIntent,
    Client,
    Environment,
    LogLevel,
    OrdersController,
    PaymentsController,
} from '@paypal/paypal-server-sdk';

const {
    HTTP2_HEADER_CONTENT_TYPE,
    HTTP2_METHOD_POST,
} = H2;

/**
 * Dispatcher for handling HTTP requests.
 */
export default class Fl64_Paypal_Back_Web_Handler_A_Api_OrderCapture {
    /**
     * Initializes the handler with required dependencies.
     *
     * @param {Fl64_Paypal_Back_Defaults} DEF
     * @param {TeqFw_Core_Shared_Api_Logger} logger
     * @param {TeqFw_Core_Back_Config} config
     * @param {TeqFw_Db_Back_App_TrxWrapper} trxWrapper - Database transaction wrapper
     * @param {TeqFw_Web_Back_Help_Respond} respond
     * @param {Fl64_Tmpl_Back_Service_Render} tmplRender
     * @param {Fl64_Tmpl_Back_Api_Adapter} adapterTmpl
     * @param {Fl64_Otp_Back_Mod_Token} modToken - OTP token model to manage OTP tokens
     * @param {Fl64_Paypal_Back_Helper_Web} helpWeb
     * @param {typeof Fl64_Paypal_Back_Enum_Mode} MODE
     * @param {typeof Fl64_Tmpl_Back_Enum_Type} TMPL
     */
    constructor(
        {
            Fl64_Paypal_Back_Defaults$: DEF,
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Core_Back_Config$: config,
            TeqFw_Db_Back_App_TrxWrapper$: trxWrapper,
            TeqFw_Web_Back_Help_Respond$: respond,
            Fl64_Tmpl_Back_Service_Render$: tmplRender,
            Fl64_Tmpl_Back_Api_Adapter$: adapterTmpl,
            Fl64_Otp_Back_Mod_Token$: modToken,
            Fl64_Paypal_Back_Helper_Web$: helpWeb,
            'Fl64_Paypal_Back_Enum_Mode.default': MODE,
            'Fl64_Tmpl_Back_Enum_Type.default': TMPL,
        }
    ) {
        // VARS
        let client, ordersController;

        // FUNCS

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

        function getOrdersController() {
            if (!ordersController) {
                const client = getClient();
                ordersController = new OrdersController(client);
            }
            return ordersController;
        }


        /**
         * Capture payment for the created order to complete the transaction.
         * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
         */
        async function captureOrder(orderID) {
            const collect = {
                id: orderID,
                prefer: 'return=minimal',
            };

            try {
                const ordersController = getOrdersController();
                const {body, ...httpResponse} = await ordersController.ordersCapture(
                    collect
                );
                // Get more response info...
                // const { statusCode, headers } = httpResponse;
                return {
                    jsonResponse: JSON.parse(body),
                    httpStatusCode: httpResponse.statusCode,
                };
            } catch (error) {
                if (error instanceof ApiError) {
                    // const { statusCode, headers } = error;
                    throw new Error(error.message);
                }
            }
        };

        // MAIN
        /**
         * Handles the provider selection action.
         *
         * @param {module:http.IncomingMessage|module:http2.Http2ServerRequest} req - Incoming HTTP request
         * @param {module:http.ServerResponse|module:http2.Http2ServerResponse} res - HTTP response object
         *
         * @return {Promise<void>}
         */
        this.run = async function (req, res) {
            // FUNCS

            // MAIN
            if (req.method === HTTP2_METHOD_POST) {
                const payload = await helpWeb.parsePostedData(req);
                const orderId = payload?.orderId;

                const {jsonResponse, httpStatusCode} = await captureOrder(orderId);
                debugger
                respond.code200_Ok({
                    res, body: jsonResponse, headers: {
                        [HTTP2_HEADER_CONTENT_TYPE]: 'application/json'
                    }
                });
            }

        };
    }
}
