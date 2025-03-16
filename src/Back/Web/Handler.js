/**
 * Dispatcher for handling HTTP requests in the plugin space.
 */
export default class Fl64_Paypal_Back_Web_Handler {
    /**
     * Initializes the handler with required dependencies.
     *
     * @param {typeof import('node:http2')} http2
     * @param {Fl64_Paypal_Back_Defaults} DEF
     * @param {TeqFw_Core_Shared_Api_Logger} logger
     * @param {TeqFw_Web_Back_Help_Respond} respond
     * @param {Fl64_Paypal_Back_Helper_Web} helpWeb
     * @param {Fl64_Paypal_Back_Web_Handler_A_Api_OrderCapture} aApiOrderCapture
     * @param {Fl64_Paypal_Back_Web_Handler_A_Api_OrderCreate} aApiOrderCreate
     * @param {Fl64_Paypal_Back_Web_Handler_A_Checkout} aForm
     */
    constructor(
        {
            'node:http2': http2,
            Fl64_Paypal_Back_Defaults$: DEF,
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Web_Back_Help_Respond$: respond,
            Fl64_Paypal_Back_Helper_Web$: helpWeb,
            Fl64_Paypal_Back_Web_Handler_A_Api_OrderCapture$: aApiOrderCapture,
            Fl64_Paypal_Back_Web_Handler_A_Api_OrderCreate$: aApiOrderCreate,
            Fl64_Paypal_Back_Web_Handler_A_Checkout$: aForm,
        }
    ) {
        // VARS
        const {
            HTTP2_METHOD_GET,
            HTTP2_METHOD_POST,
        } = http2.constants;

        // FUNCS
        /**
         * Handles incoming HTTP requests and delegates processing to specific handlers.
         *
         * @param {module:http.IncomingMessage|module:http2.Http2ServerRequest} req
         * @param {module:http.ServerResponse|module:http2.Http2ServerResponse} res
         */
        async function process(req, res) {
            try {
                const parts = helpWeb.getPathParts(req);
                const endpoint = parts[0];
                switch (endpoint) {
                    case DEF.SHARED.ROUTE_CHECKOUT:
                        await aForm.run(req, res);
                        break;
                    case DEF.SHARED.ROUTE_API:
                        const service = parts[1];
                        switch (service) {
                            case DEF.SHARED.API_ORDER_CAPTURE:
                                await aApiOrderCapture.run(req, res);
                                break;
                            case DEF.SHARED.API_ORDER_CREATE:
                                await aApiOrderCreate.run(req, res);
                                break;
                        }
                        break;
                    default:
                        // If the endpoint is not recognized, do nothing and let other handlers process it
                        break;
                }
            } catch (error) {
                logger.exception(error);
                respond.code500_InternalServerError({res, body: error.message});
            }
        }

        /**
         * Provides the function to process requests.
         * @returns {Function}
         */
        this.getProcessor = () => process;

        /**
         * Placeholder for initialization logic.
         */
        this.init = async function () { };

        /**
         * Checks if the request can be handled by this instance.
         *
         * @param {Object} options
         * @param {string} options.method
         * @param {Object} options.address
         * @returns {boolean}
         */
        this.canProcess = function ({method, address} = {}) {
            return (
                ((method === HTTP2_METHOD_GET) || (method === HTTP2_METHOD_POST))
                && (address?.space === DEF.SHARED.SPACE)
            );
        };
    }
}
