/**
 * Enum for PayPal order statuses.
 * Represents the possible statuses of an order in PayPal.
 * @readonly
 * @enum {string}
 */
const Fl64_Paypal_Back_Enum_Order_Status = {
    APPROVED: 'APPROVED', // User approved the payment, but funds are not captured
    COMPLETED: 'COMPLETED', // Order successfully completed (funds captured)
    CREATED: 'CREATED', // Order created but not paid
    FAILED: 'FAILED', // Order failed due to an error
    VOIDED: 'VOIDED', // Order has been canceled
};
export default Fl64_Paypal_Back_Enum_Order_Status;