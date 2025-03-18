/**
 * Interface for adapting the PayPal plugin to the application.
 *
 * This interface defines the contract for integrating the PayPal plugin with the application.
 * It ensures that application-specific business logic is executed after a successful payment.
 *
 * This is a documentation-only interface (not executable).
 *
 * @interface
 */
export default class Fl64_Paypal_Back_Api_Adapter {

    /**
     * Handles application-specific actions after a successful payment.
     *
     * @param {Object} params - Input parameters.
     * @param {number} params.orderId - The internal order ID.
     * @param {Object} params.paypalResponse - The full response object from PayPal.
     * @returns {Promise<void>} - Resolves when the post-payment processing is complete.
     */
    async processSuccessfulPayment({orderId, paypalResponse}) {
        throw new Error('Cannot instantiate an interface');
    }

}
