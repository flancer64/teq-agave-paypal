/**
 * This is a code for a 'checkout.html' template.
 */
export default class Fl64_Paypal_Front_Ui_Page_Checkout {
    /**
     * @param {Fl64_Paypal_Front_Defaults} DEF
     * @param {Fl64_Paypal_Front_Call_Base_OrderCapture} callOrderCapture
     * @param {Fl64_Paypal_Front_Call_Base_OrderCreate} callOrderCreate
     */
    constructor(
        {
            Fl64_Paypal_Front_Defaults$: DEF,
            Fl64_Paypal_Front_Call_Base_OrderCapture$: callOrderCapture,
            Fl64_Paypal_Front_Call_Base_OrderCreate$: callOrderCreate,
        }
    ) {
        // VARS
        // @see https://developer.paypal.com/sdk/js/reference/
        const BUTTONS = {
            style: {
                color: 'gold',
                label: 'paypal',
                layout: 'vertical',
                shape: 'rect',
                tagline: false,
            },
            message: {
                amount: undefined,
            },
            createOrder,
            onApprove,
            onCancel: ({orderId} = {}) => {},
            onError,
        };
        const RES_CAPTURE = callOrderCapture.getResultCodes();
        const RES_CREATE = callOrderCreate.getResultCodes();
        let resultMessage = defaultResultMessage;
        // @see `purchaseUnits` in https://developer.paypal.com/docs/api/orders/v2/#orders_create
        let cartDataProvider = defaultCartDataProvider;

        // FUNCS
        async function createOrder() {
            const cart = await cartDataProvider();
            const {resultCode, orderId} = await callOrderCreate.perform({cart});
            if (resultCode === RES_CREATE.SUCCESS) return orderId;
            else throw new Error('Cannot create a new PayPal order on the backend.');
        }

        async function onApprove(data, actions) {
            const {resultCode, orderData} = await callOrderCapture.perform({
                orderId: data?.orderID,
            });
            if (resultCode === RES_CAPTURE.SUCCESS) {
                // (3) Successful transaction -> Show confirmation or thank you message
                // Or go to another URL:  actions.redirect('thank_you.html');
                const transaction =
                    orderData?.purchase_units?.[0]?.payments
                        ?.captures?.[0] ||
                    orderData?.purchase_units?.[0]?.payments
                        ?.authorizations?.[0];
                resultMessage(
                    `Transaction ${transaction.status}: ${transaction.id}<br>
          <br>See console for all available details`
                );
                console.log(
                    'Capture result',
                    orderData,
                    JSON.stringify(orderData, null, 2)
                );
            } else throw new Error('Cannot create a new PayPal order on the backend.');
        }

        async function onError(err) {
            console.error('Error while processing the order:', err);
            alert('An error occurred while processing the order. Please try again later.');
        }

        // Example function to show a result to the user. Your site's UI library can be used instead.
        function defaultResultMessage(message) {
            const container = document.querySelector('#result-message');
            container.innerHTML = message;
        }

        /**
         * @returns {Promise<Object[]>}
         * @see `purchaseUnits` in https://developer.paypal.com/docs/api/orders/v2/#orders_create
         */
        async function defaultCartDataProvider() {
            return [{
                description: 'Test payment',
                amount: '100',
                currency: 'USD',
            }];
        }

        // MAIN

        /**
         * Renders PayPal buttons in the specified container.
         * @param {Object} params
         * @param {string} params.cssContainer - The CSS selector for the container where the PayPal button will be rendered.
         */
        this.renderButtons = function ({cssContainer}) {
            if (!window?.paypal?.Buttons) {
                console.error('PayPal Buttons SDK is not available.');
            } else {
                window.paypal
                    .Buttons(BUTTONS)
                    .render(cssContainer);
            }
        };

        /**
         * Sets the handlers for various actions.
         * @param {Object} params
         * @param {function} params.cartDataProvider - An callback function to compose card items.
         * @param {function} [params.onMessage] - An optional callback function to handle messages.
         *  If provided, this function will be used as the message handler.
         */
        this.setHandlers = function ({cartDataProvider: cart, onMessage}) {
            if (typeof onMessage === 'function') resultMessage = onMessage;
            if (typeof cart === 'function') cartDataProvider = cart;
        };


    }
}
