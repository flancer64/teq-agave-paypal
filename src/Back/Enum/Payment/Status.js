import Fl64_Paypal_Back_Enum_Order_Status from '../Order/Status.js';

/**
 * Enum for PayPal payment statuses.
 * Represents the possible statuses of a payment in PayPal.
 * @readonly
 * @enum {string}
 */
const Fl64_Paypal_Back_Enum_Payment_Status = {
    PENDING: 'PENDING', // Payment is pending and not yet completed
    COMPLETED: 'COMPLETED', // Payment successfully completed
    FAILED: 'FAILED', // Payment failed
    DENIED: 'DENIED', // Payment was denied by PayPal
    CANCELLED: 'CANCELLED', // Payment was canceled before completion
    REFUNDED: 'REFUNDED', // Payment was fully refunded
    PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED', // Payment was partially refunded
};
export default Fl64_Paypal_Back_Enum_Payment_Status;