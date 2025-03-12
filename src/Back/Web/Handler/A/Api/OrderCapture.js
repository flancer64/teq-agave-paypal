import {constants as H2} from 'node:http2';
import {ApiError} from '@paypal/paypal-server-sdk';

const {
    HTTP2_HEADER_CONTENT_TYPE,
    HTTP2_METHOD_POST,
    HTTP_STATUS_INTERNAL_SERVER_ERROR,
} = H2;

/**
 * Handles PayPal order capture requests within a web application.
 *
 * This class processes incoming HTTP requests to capture PayPal orders, logs transaction details,
 * updates order statuses in the database, stores payment information, and responds with
 * the capture data. It integrates PayPal API interactions, database transactions, and logging mechanisms.
 */
export default class Fl64_Paypal_Back_Web_Handler_A_Api_OrderCapture {
    /**
     * Initializes the handler with required dependencies.
     *
     * @param {TeqFw_Core_Shared_Api_Logger} logger
     * @param {TeqFw_Db_Back_App_TrxWrapper} trxWrapper
     * @param {TeqFw_Web_Back_Help_Respond} respond
     * @param {Fl64_Paypal_Back_Helper_Web} helpWeb
     * @param {Fl64_Paypal_Back_Store_RDb_Repo_Log} repoLog
     * @param {Fl64_Paypal_Back_Store_RDb_Repo_Order} repoOrder
     * @param {Fl64_Paypal_Back_Store_RDb_Repo_Payment} repoPayment
     * @param {Fl64_Paypal_Back_Client} client
     * @param {typeof Fl64_Paypal_Back_Enum_Request_Type} REQUEST_TYPE
     * @param {typeof Fl64_Paypal_Back_Enum_Order_Status} ORDER_STATUS
     */
    constructor(
        {
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Db_Back_App_TrxWrapper$: trxWrapper,
            TeqFw_Web_Back_Help_Respond$: respond,
            Fl64_Paypal_Back_Helper_Web$: helpWeb,
            Fl64_Paypal_Back_Store_RDb_Repo_Log$: repoLog,
            Fl64_Paypal_Back_Store_RDb_Repo_Order$: repoOrder,
            Fl64_Paypal_Back_Store_RDb_Repo_Payment$: repoPayment,
            Fl64_Paypal_Back_Client$: client,
            'Fl64_Paypal_Back_Enum_Request_Type.default': REQUEST_TYPE,
            'Fl64_Paypal_Back_Enum_Order_Status.default': ORDER_STATUS,
        }
    ) {
        // VARS
        const A_ORDER = repoOrder.getSchema().getAttributes();
        const A_PAYMENT = repoPayment.getSchema().getAttributes();

        // FUNCS

        /**
         * Captures payment for an existing PayPal order.
         *
         * This function sends a capture request to PayPal for a given order ID,
         * logs the request and response in the database, and returns the response data.
         *
         * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
         *
         * @async
         * @param {string} orderId - The PayPal order ID to be captured.
         * @returns {Promise<{ jsonResponse: Object, httpStatusCode: number }>}
         *          A promise resolving to the PayPal capture response and HTTP status code.
         * @throws {Error} If the PayPal API request fails.
         */
        async function captureOrder(orderId) {
            const collect = {
                id: orderId,
                prefer: 'return=minimal',
            };

            // Create a log entry for the PayPal capture request
            const logDto = repoLog.createDto();
            logDto.date_request = new Date();
            logDto.request_data = JSON.stringify(collect);
            logDto.request_type = REQUEST_TYPE.ORDER_CAPTURE;
            logDto.response_data = null;
            logDto.response_status = HTTP_STATUS_INTERNAL_SERVER_ERROR;
            try {
                // perform paypal request
                const {body, ...httpResponse} = await client.getOrdersController().ordersCapture(collect);
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
         * Updates order status and saves captured payments in the database.
         *
         * @async
         * @param {string} orderId - The PayPal order ID.
         * @param {Object} jsonResponse - The PayPal API response containing order capture details.
         * @throws {Error} If a database operation fails.
         * @returns {Promise<void>}
         */
        async function savePayments(orderId, jsonResponse) {
            await trxWrapper.execute(null, async (trx) => {
                const key = {[A_ORDER.PAYPAL_ORDER_ID]: orderId};
                const {record: foundOrder} = await repoOrder.readOne({trx, key});
                foundOrder.status = ORDER_STATUS.COMPLETED;
                await repoOrder.updateOne({trx, updates: foundOrder});
                // save payments
                const payerId = jsonResponse.payer.payer_id;
                const payments = [];
                jsonResponse.purchase_units.forEach((unit) => {
                    if (!unit?.payments?.captures) return;
                    unit.payments.captures.forEach((capture) => {
                        const dto = repoPayment.createDto();
                        dto.amount = parseFloat(capture.amount.value);
                        dto.currency = capture.amount.currency_code;
                        dto.date_captured = new Date(capture.create_time);
                        dto.order_ref = foundOrder.id;
                        dto.payer_id = payerId;
                        dto.paypal_payment_id = capture.id;
                        dto.status = capture.status;
                        payments.push(dto);
                    });
                });
                for (const dto of payments) {
                    const {primaryKey} = await repoPayment.createOne({trx, dto});
                    const id = primaryKey[A_PAYMENT.ID];
                    logger.info(`New payment #${id} is created for order #${foundOrder.id}.`);
                }
            });
        }

        // MAIN

        /**
         * Handles an incoming HTTP request to capture a PayPal order.
         *
         * Validates the request, captures the PayPal order, updates order status in the database,
         * stores payment details, and responds with the capture details.
         *
         * @param {module:http.IncomingMessage|module:http2.Http2ServerRequest} req - Incoming HTTP request.
         * @param {module:http.ServerResponse|module:http2.Http2ServerResponse} res - HTTP response object.
         *
         * @returns {Promise<void>}
         */
        this.run = async function (req, res) {
            if (req.method === HTTP2_METHOD_POST) {
                const payload = await helpWeb.parsePostedData(req);
                const orderId = payload?.orderId;
                if (orderId) {
                    // Capture the order from PayPal in separate DB transaction
                    const {jsonResponse, httpStatusCode} = await captureOrder(orderId);
                    // If successful, update order status and save payments in separate DB transaction
                    if ((httpStatusCode >= 200) && (httpStatusCode < 300)) {
                        await savePayments(orderId, jsonResponse);
                        respond.code200_Ok({
                            res, body: jsonResponse, headers: {
                                [HTTP2_HEADER_CONTENT_TYPE]: 'application/json'
                            }
                        });
                    }
                }
            }
        };
    }
}
