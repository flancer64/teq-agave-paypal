/**
 * This is a code for a 'checkout.html' template.
 */
export default class Fl64_Paypal_Front_Ui_Page_Checkout {
    /**
     * @param {Fl64_Paypal_Front_Call_Base_OrderCapture} callOrderCapture
     * @param {Fl64_Paypal_Front_Call_Base_OrderCreate} callOrderCreate
     */
    constructor(
        {
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
        /**
         * @returns {Promise<CartData>}
         */
        let cartDataProvider = defaultCartDataProvider;

        // FUNCS
        async function createOrder(data, actions) {
            const {cart, discountCode} = await cartDataProvider();
            const {resultCode, orderId} = await callOrderCreate.perform({cart, discountCode});
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
                resultMessage({
                    message: `Transaction ${transaction.status}: ${transaction.id}<br>
          <br>See console for all available details`
                });
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
        function defaultResultMessage({message}) {
            const container = document.querySelector('#result-message');
            container.innerHTML = message;
        }

        /**
         * Provides default cart data.
         * @returns {Promise<CartData>} The default cart data.
         */
        async function defaultCartDataProvider() {
            const discountCode = '';
            const cart = [{
                description: 'Test payment via @flancer64/teq-agave-paypal.',
                amount: {value: '100', currency: 'USD'},
            }];
            return {cart, discountCode};
        }

        // MAIN

        /**
         * Renders PayPal buttons in the specified container.
         * @param {object} params
         * @param {string} params.cssContainer - The CSS selector for the container where the PayPal button will be rendered.
         * @param {object} [params.buttons] - Optional configuration for the PayPal Buttons instance, such as actions, styles, or events.
         */
        this.renderButtons = function ({cssContainer, buttons}) {
            if (!window?.paypal?.Buttons) {
                console.error('PayPal Buttons SDK is not available.');
            } else {
                const opts = buttons ?? BUTTONS;
                if (!opts.createOrder) opts.createOrder = createOrder;
                if (!opts.onApprove) opts.onApprove = onApprove;
                debugger
                window.paypal
                    .Buttons(opts)
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

/**
 * @typedef {Object} CartItem
 * @see `purchaseUnits` in https://developer.paypal.com/docs/api/orders/v2/#orders_create
 * @property {string} description - Description of the cart item.
 * @property {{value: string, currency: string}} amount - Amount details.
 */

/**
 * @typedef {Object} CartData
 * @property {CartItem[]} cart - List of items in the cart.
 * @property {string} [discountCode] - Applied discount code.
 */
