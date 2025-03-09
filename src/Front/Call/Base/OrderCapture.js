// VARS
/**
 * @memberOf Fl64_Paypal_Front_Call_Base_OrderCapture
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
export default class Fl64_Paypal_Front_Call_Base_OrderCapture {
    /**
     * @param {Fl64_Paypal_Front_Defaults} DEF
     */
    constructor(
        {
            Fl64_Paypal_Front_Defaults$: DEF,
        }
    ) {
        // VARS
        const URL = `/${DEF.SHARED.SPACE}/${DEF.SHARED.ROUTE_API}/${DEF.SHARED.API_ORDER_CAPTURE}`;

        // FUNCS


        // MAIN
        /**
         * @returns {typeof Fl64_Paypal_Front_Call_Base_OrderCapture.RESULT}
         */
        this.getResultCodes = () => RESULT;

        /**
         * @param {string} orderId
         * @returns {Promise<{resultCode: string, orderData: Object}>}
         */
        this.perform = async function ({orderId} = {}) {
            // VARS
            let resultCode = RESULT.UNKNOWN_ERROR, orderData;

            // MAIN
            try {
                const response = await fetch(URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({orderId}),
                });
                orderData = await response.json();
                if (orderData?.purchase_units) {
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
            }
            return {resultCode, orderData};
        };
    }


}
