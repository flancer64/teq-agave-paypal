// VARS
/**
 * @memberOf Fl64_Paypal_Front_Call_Base_OrderCreate
 */
const RESULT = {
    SUCCESS: 'SUCCESS',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};
Object.freeze(RESULT);

// MAIN
/**
 * @implements {TeqFw_Core_Shared_Api_Service}
 */
export default class Fl64_Paypal_Front_Call_Base_OrderCreate {
    /**
     * @param {Fl64_Paypal_Front_Defaults} DEF
     */
    constructor(
        {
            Fl64_Paypal_Front_Defaults$: DEF,
        }
    ) {
        // VARS
        const URL = `/${DEF.SHARED.SPACE}/${DEF.SHARED.ROUTE_API}/${DEF.SHARED.API_ORDER_CREATE}`;

        // FUNCS


        // MAIN
        /**
         * @returns {typeof Fl64_Paypal_Front_Call_Base_OrderCreate.RESULT}
         */
        this.getResultCodes = () => RESULT;

        /**
         * @param {Object} params
         * @param {Object} params.cart
         * @see `purchaseUnits` in https://developer.paypal.com/docs/api/orders/v2/#orders_create
         * @returns {Promise<{resultCode: string, orderId:string}>}
         */
        this.perform = async function ({cart}) {
            // VARS
            let resultCode = RESULT.UNKNOWN_ERROR, orderId;

            // MAIN
            try {
                const response = await fetch(URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    // use the "body" param to optionally pass additional order information
                    // like product ids and quantities
                    body: JSON.stringify({cart}),
                });

                const orderData = await response.json();

                if (orderData.id) {
                    orderId = orderData.id;
                    resultCode = RESULT.SUCCESS;
                } else {
                    const errorDetail = orderData?.details?.[0];
                    const errorMessage = errorDetail
                        ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                        : JSON.stringify(orderData);
                    console.error(errorMessage);
                }
            } catch (error) {
                console.error(error);
                // resultMessage(`Could not initiate PayPal Checkout...<br><br>${error}`);
            }
            return {resultCode, orderId};
        };
    }


}
