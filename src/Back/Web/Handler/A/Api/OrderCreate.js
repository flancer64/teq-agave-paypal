/**
 * Handles PayPal order creation requests within a web application.
 *
 * This class processes incoming HTTP requests to create PayPal orders, logs the
 * transaction details, stores order information in the database, and responds with
 * the order data. It integrates PayPal API interactions, session handling, and
 * database logging.
 */
export default class Fl64_Paypal_Back_Web_Handler_A_Api_OrderCreate {
    /**
     * @param {typeof import('node:http2')} http2
     * @param {typeof import('@paypal/paypal-server-sdk')} paypal
     * @param {TeqFw_Core_Shared_Api_Logger} logger
     * @param {TeqFw_Web_Back_Help_Respond} respond
     * @param {Fl64_Web_Session_Back_Manager} session
     * @param {Fl64_Paypal_Back_Helper_Web} helpWeb
     * @param {Fl64_Paypal_Back_Store_RDb_Repo_Log} repoLog
     * @param {Fl64_Paypal_Back_Store_RDb_Repo_Order} repoOrder
     * @param {Fl64_Paypal_Back_Client} client
     * @param {typeof Fl64_Paypal_Back_Enum_Request_Type} REQUEST_TYPE
     * @param {typeof Fl64_Paypal_Back_Enum_Order_Status} ORDER_STATUS
     */
    constructor(
        {
            'node:http2': http2,
            'node:@paypal/paypal-server-sdk': paypal,
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Web_Back_Help_Respond$: respond,
            Fl64_Web_Session_Back_Manager$: session,
            Fl64_Paypal_Back_Helper_Web$: helpWeb,
            Fl64_Paypal_Back_Store_RDb_Repo_Log$: repoLog,
            Fl64_Paypal_Back_Store_RDb_Repo_Order$: repoOrder,
            Fl64_Paypal_Back_Client$: client,
            Fl64_Paypal_Back_Enum_Request_Type$: REQUEST_TYPE,
            Fl64_Paypal_Back_Enum_Order_Status$: ORDER_STATUS,
        }
    ) {
        // VARS
        const {
            HTTP2_HEADER_CONTENT_TYPE,
            HTTP2_METHOD_POST,
            HTTP_STATUS_INTERNAL_SERVER_ERROR,
        } = http2.constants;
        const {ApiError} = paypal;

        const A_ORDER = repoOrder.getSchema().getAttributes();

        // FUNCS

        /**
         * Sends a request to PayPal to create an order and logs the request and response.
         *
         * This function constructs a PayPal order request with the given purchase details,
         * sends it to PayPal, logs the request and response in the database, and returns
         * the response data. If an error occurs, it logs the failure and throws the error.
         *
         * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
         *
         * @async
         * @param {number} userRef - The reference ID of the user creating the order.
         * @param {Object} purchaseUnits - The purchase details formatted according to PayPal API requirements.
         * @returns {Promise<{ jsonResponse: Object, httpStatusCode: number }>}
         *          A promise resolving to the PayPal response data and HTTP status code.
         * @throws {Error} If the PayPal API request fails.
         */
        async function createPaypalOrder(userRef, purchaseUnits) {
            const collect = {
                body: {
                    intent: 'CAPTURE', purchaseUnits,
                }, prefer: 'return=minimal',
            };
            // create PayPal log DTO
            const logDto = repoLog.createDto();
            logDto.date_request = new Date();
            logDto.request_data = JSON.stringify(collect);
            logDto.request_type = REQUEST_TYPE.ORDER_CREATE;
            logDto.response_data = null;
            logDto.response_status = HTTP_STATUS_INTERNAL_SERVER_ERROR;
            try {
                // perform paypal request
                const {body, ...httpResponse} = await client.getOrdersController().ordersCreate(collect);
                // log PayPal request if succeed
                logDto.date_response = new Date();
                logDto.response_data = body;
                logDto.response_status = httpResponse.statusCode;
                await repoLog.createOne({dto: logDto});
                // Get more response info: `const { statusCode, headers } = httpResponse`
                return {
                    jsonResponse: JSON.parse(body),
                    httpStatusCode: httpResponse.statusCode,
                };
            } catch (e) {
                logger.exception(e);
                // log PayPal request if failed
                logDto.date_response = new Date();
                if (e instanceof ApiError) {
                    logDto.response_data = e.body;
                    logDto.response_status = e.statusCode;
                } else {
                    logDto.response_data = e.message;
                }
                await repoLog.createOne({dto: logDto});
                throw e;
            }
        }

        /**
         * Saves a newly created PayPal order to the database.
         *
         * This function creates a new order record with the provided details,
         * assigns the PayPal order ID, and sets the initial status.
         * After successfully saving, it logs the order creation event.
         *
         * @async
         * @param {number} userRef - The reference ID of the user who placed the order.
         * @param {number} amount - The total order amount.
         * @param {string} currency - The currency code (e.g., "USD", "EUR").
         * @param {Object} response - The PayPal API response containing order details.
         * @returns {Promise<void>} Resolves when the order is successfully saved.
         * @throws {Error} If the database operation fails.
         */
        async function saveOrder(userRef, amount, currency, response) {
            const dto = repoOrder.createDto();
            dto.amount = amount;
            dto.currency = currency;
            dto.date_created = new Date();
            dto.paypal_order_id = response.id;
            dto.status = ORDER_STATUS.CREATED;
            dto.user_ref = userRef;
            const {primaryKey} = await repoOrder.createOne({dto});
            logger.info(`New PayPal order #${primaryKey[A_ORDER.ID]} is created for user ${userRef}.`);
        }

        // MAIN

        /**
         * Handles an incoming HTTP request to create a PayPal order.
         *
         * Validates the request, processes the cart data, creates a PayPal order,
         * saves order details in the database, and responds with the order data.
         *
         * @param {module:http.IncomingMessage|module:http2.Http2ServerRequest} req - Incoming HTTP request
         * @param {module:http.ServerResponse|module:http2.Http2ServerResponse} res - HTTP response object
         *
         * @return {Promise<boolean>}
         */
        this.run = async function (req, res) {
            if (req.method === HTTP2_METHOD_POST) {
                const {cart, discountCode} = await helpWeb.parsePostedData(req);
                if (cart) {
                    if (discountCode)
                        logger.info(`Discount code '${discountCode}' is applied.`);
                    // there are 3 DB transactions here: session, PayPal logs in `createPaypalOrder`, `saveOrder`.
                    const {dto} = await session.getFromRequest({req});
                    // send request to PayPal to create order
                    const {jsonResponse, httpStatusCode} = await createPaypalOrder(dto.user_ref, cart);
                    // save order data
                    if ((httpStatusCode >= 200) && (httpStatusCode < 300)) {
                        const {value, currencyCode} = cart[0].amount;
                        await saveOrder(dto.user_ref, value, currencyCode, jsonResponse);
                        respond.code200_Ok({
                            res, body: jsonResponse, headers: {
                                [HTTP2_HEADER_CONTENT_TYPE]: 'application/json'
                            }
                        });
                        return true;
                    }
                }
            }
        };
    }
}
