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
export default class Fl64_Paypal_Back_Web_Handler_A_Api_OrderCreate {
    /**
     * Initializes the handler with required dependencies.
     *
     * @param {Fl64_Paypal_Back_Defaults} DEF
     * @param {TeqFw_Core_Shared_Api_Logger} logger
     * @param {TeqFw_Core_Back_Config} config
     * @param {TeqFw_Db_Back_App_TrxWrapper} trxWrapper - Database transaction wrapper
     * @param {TeqFw_Web_Back_Help_Respond} respond
     * @param {Fl64_Web_Session_Back_Manager} session
     * @param {Fl64_Paypal_Back_Helper_Web} helpWeb
     * @param {Fl64_Paypal_Back_Store_RDb_Repo_Log} repoLog
     * @param {Fl64_Paypal_Back_Store_RDb_Repo_Order} repoOrder
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
            Fl64_Web_Session_Back_Manager$: session,
            Fl64_Paypal_Back_Helper_Web$: helpWeb,
            Fl64_Paypal_Back_Store_RDb_Repo_Log$: repoLog,
            Fl64_Paypal_Back_Store_RDb_Repo_Order$: repoOrder,
            'Fl64_Paypal_Back_Enum_Mode.default': MODE,
            'Fl64_Paypal_Back_Enum_Request_Type.default': REQUEST_TYPE,
            'Fl64_Paypal_Back_Enum_Order_Status.default': ORDER_STATUS,
        }
    ) {
        // VARS
        const A_LOG = repoLog.getSchema().getAttributes();

        let client, ordersController;

        // FUNCS

        function getClient() {
            if (!client) {
                /** @type {Fl64_Paypal_Back_Plugin_Dto_Config_Local.Dto} */
                const cfg = config.getLocal(DEF.NAME);
                const environment = (cfg.mode === MODE.PRODUCTION) ? Environment.Production : Environment.Sandbox;
                client = new Client({
                    clientCredentialsAuthCredentials: {
                        oAuthClientId: cfg.clientId, oAuthClientSecret: cfg.clientSecret,
                    }, timeout: 0, environment, logging: {
                        logLevel: LogLevel.Info, logRequest: {logBody: true}, logResponse: {logHeaders: true},
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
         * Create an order to start the payment transaction.
         * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
         *
         * @param {TeqFw_Db_Back_RDb_ITrans} trx
         * @param {number} userRef
         * @param {Object} purchaseUnits
         */
        async function createPaypalOrder(trx, userRef, purchaseUnits) {
            const collect = {
                body: {
                    intent: 'CAPTURE', purchaseUnits,
                }, prefer: 'return=minimal',
            };
            try {
                // log data for paypal request
                const logReq = repoLog.createDto();
                logReq.request_data = JSON.stringify(collect);
                logReq.request_type = REQUEST_TYPE.ORDER_CREATE;
                logReq.date_request = new Date();
                const {primaryKey} = await repoLog.createOne({trx, dto: logReq});
                const logId = primaryKey[A_LOG.ID];
                // perform paypal request
                const {body, ...httpResponse} = await getOrdersController().ordersCreate(collect);
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
                logger.exception(error);
                if (error instanceof ApiError) {
                    // const { statusCode, headers } = error;
                    throw new Error(error.message);
                }
            }
        }

        /**
         *
         * @param {TeqFw_Db_Back_RDb_ITrans} trx
         * @param {number} userRef
         * @param {number} amount
         * @param {string} currency
         * @param {Object} response
         * @returns {Promise<void>}
         */
        async function saveOrder(trx, userRef, amount, currency, response) {
            const dto = repoOrder.createDto();
            dto.amount = amount;
            dto.currency = currency;
            dto.date_created = new Date();
            dto.paypal_order_id = response.id;
            dto.status = ORDER_STATUS.CREATED;
            dto.user_ref = userRef;
            const {primaryKey: id} = await repoOrder.createOne({trx, dto});
            logger.info(`New PayPal order #${id} is created for user ${userRef}.`);
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
                const {cart} = await helpWeb.parsePostedData(req);
                if (cart) {
                    await trxWrapper.execute(null, async (trx) => {
                        const {dto} = await session.getFromRequest({trx, req});
                        // send request to PayPal to create order
                        const {jsonResponse, httpStatusCode} = await createPaypalOrder(trx, dto.user_ref, cart);
                        // save order data
                        const {value, currencyCode} = cart[0].amount;
                        await saveOrder(trx, dto.user_ref, value, currencyCode, jsonResponse);
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
