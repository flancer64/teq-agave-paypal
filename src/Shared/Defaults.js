/**
 * Plugin constants (hardcoded configuration) for shared code.
 */
export default class Fl64_Paypal_Shared_Defaults {

    API_ORDER_CAPTURE = 'order_capture';
    API_ORDER_CREATE = 'order_create';
    NAME = '@flancer64/teq-agave-paypal';
    ROUTE_API = 'api';
    ROUTE_CHECKOUT = 'checkout';
    SPACE = 'fl64-paypal';

    constructor() {
        Object.freeze(this);
    }
}
