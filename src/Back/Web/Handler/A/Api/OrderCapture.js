import {constants as H2} from 'node:http2';
import {
    ApiError,
    Client,
    Environment,
    LogLevel,
    OrdersController,
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
     * @param {TeqFw_Db_Back_App_TrxWrapper} trxWrapper
     * @param {TeqFw_Web_Back_Help_Respond} respond
     * @param {Fl64_Paypal_Back_Helper_Web} helpWeb
     * @param {Fl64_Paypal_Back_Store_RDb_Repo_Log} repoLog
     * @param {Fl64_Paypal_Back_Store_RDb_Repo_Order} repoOrder
     * @param {Fl64_Paypal_Back_Store_RDb_Repo_Payment} repoPayment
     * @param {typeof Fl64_Paypal_Back_Enum_Mode} MODE
     * @param {typeof Fl64_Paypal_Back_Enum_Request_Type} REQUEST_TYPE
     * @param {typeof Fl64_Paypal_Back_Enum_Order_Status} ORDER_STATUS
     */
    constructor(
        {
            Fl64_Paypal_Back_Defaults$: DEF,
            TeqFw_Core_Shared_Api_Logger$$: logger,
            TeqFw_Core_Back_Config$: config,
            TeqFw_Db_Back_App_TrxWrapper$: trxWrapper,
            TeqFw_Web_Back_Help_Respond$: respond,
            Fl64_Paypal_Back_Helper_Web$: helpWeb,
            Fl64_Paypal_Back_Store_RDb_Repo_Log$: repoLog,
            Fl64_Paypal_Back_Store_RDb_Repo_Order$: repoOrder,
            Fl64_Paypal_Back_Store_RDb_Repo_Payment$: repoPayment,
            'Fl64_Paypal_Back_Enum_Mode.default': MODE,
            'Fl64_Paypal_Back_Enum_Request_Type.default': REQUEST_TYPE,
            'Fl64_Paypal_Back_Enum_Order_Status.default': ORDER_STATUS,
        }
    ) {
        // VARS
        const A_LOG = repoLog.getSchema().getAttributes();
        const A_ORDER = repoOrder.getSchema().getAttributes();
        const A_PAYMENT = repoPayment.getSchema().getAttributes();

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
         *
         * @param {TeqFw_Db_Back_RDb_ITrans} trx
         * @param {string} orderId
         */
        async function captureOrder(trx, orderId) {
            const collect = {
                id: orderId,
                prefer: 'return=minimal',
            };
            try {
                // log data for paypal request
                const logReq = repoLog.createDto();
                logReq.request_data = JSON.stringify(collect);
                logReq.request_type = REQUEST_TYPE.ORDER_CAPTURE;
                logReq.date_request = new Date();
                const {primaryKey} = await repoLog.createOne({trx, dto: logReq});
                const logId = primaryKey[A_LOG.ID];
                // perform paypal request
                const {body, ...httpResponse} = await getOrdersController().ordersCapture(collect);
                // log data for paypal response
                const {record: logRes} = await repoLog.readOne({trx, key: logId});
                logRes.date_response = new Date();
                logRes.response_data = body;
                logRes.response_status = httpResponse.statusCode;
                await repoLog.updateOne({trx, updates: logRes});
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
        }

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
            if (req.method === HTTP2_METHOD_POST) {
                const payload = await helpWeb.parsePostedData(req);
                const orderId = payload?.orderId;
                if (orderId) {
                    await trxWrapper.execute(null, async (trx) => {
                        const {jsonResponse, httpStatusCode} = await captureOrder(trx, orderId);
                        // update order status
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
                        respond.code200_Ok({
                            res, body: jsonResponse, headers: {
                                [HTTP2_HEADER_CONTENT_TYPE]: 'application/json'
                            }
                        });
                    });
                }

            }
        };
    }
}
