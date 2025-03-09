/**
 * Enum for PayPal request types.
 * Represents the types of requests made to the PayPal API.
 * @readonly
 * @enum {string}
 */
const Fl64_Paypal_Back_Enum_Request_Type = {
    ORDER_CREATE: 'order_create', // Creating a new order in PayPal
    ORDER_CAPTURE: 'order_capture', // Capturing payment for an order
    ORDER_GET: 'order_get', // Retrieving details of an existing order
    PAYMENT_REFUND: 'payment_refund', // Refunding a captured payment
    PAYMENT_GET: 'payment_get', // Retrieving details of a captured payment
};

export default Fl64_Paypal_Back_Enum_Request_Type;
