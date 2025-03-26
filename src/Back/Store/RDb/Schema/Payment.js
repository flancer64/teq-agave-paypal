/**
 * Persistent DTO with metadata for the RDB entity: PayPal Payment.
 * @namespace Fl64_Paypal_Back_Store_RDb_Schema_Payment
 */

// MODULE'S VARS

/**
 * Path to the entity in the plugin's DEM.
 *
 * @type {string}
 */
const ENTITY = '/fl64/paypal/payment';

/**
 * Attribute mappings for the entity.
 * @memberOf Fl64_Paypal_Back_Store_RDb_Schema_Payment
 */
const ATTR = {
    AMOUNT: 'amount',
    CURRENCY: 'currency',
    DATE_CAPTURED: 'date_captured',
    ID: 'id',
    ORDER_REF: 'order_ref',
    PAYER_ID: 'payer_id',
    PAYPAL_PAYMENT_ID: 'paypal_payment_id',
    STATUS: 'status',
};
Object.freeze(ATTR);

// MODULE'S CLASSES

/**
 * DTO class representing the persistent structure of the PayPal Payment entity.
 * @memberOf Fl64_Paypal_Back_Store_RDb_Schema_Payment
 */
class Dto {
    /**
     * Captured payment amount.
     *
     * @type {number}
     */
    amount;

    /**
     * Currency code (e.g., USD, EUR).
     *
     * @type {string}
     */
    currency;

    /**
     * Timestamp when the payment was captured.
     *
     * @type {Date}
     */
    date_captured;

    /**
     * Internal payment ID.
     *
     * @type {number}
     */
    id;

    /**
     * Reference to the PayPal order.
     *
     * @type {number}
     */
    order_ref;

    /**
     * Payer ID from PayPal.
     *
     * @type {string}
     */
    payer_id;

    /**
     * Payment ID from PayPal.
     *
     * @type {string}
     */
    paypal_payment_id;

    /**
     * Payment status.
     *
     * @type {string}
     * @see Fl64_Paypal_Back_Enum_Payment_Status
     */
    status;
}

/**
 * Implements metadata and utility methods for the PayPal Payment entity.
 * @implements TeqFw_Db_Back_Api_RDb_Schema_Object
 */
export default class Fl64_Paypal_Back_Store_RDb_Schema_Payment {
    /**
     * Constructor for the PayPal Payment persistent DTO class.
     *
     * @param {Fl64_Paypal_Back_Defaults} DEF
     * @param {typeof Fl64_Paypal_Back_Enum_Payment_Status} PAYMENT_STATUS
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     */
    constructor(
        {
            Fl64_Paypal_Back_Defaults$: DEF,
            Fl64_Paypal_Back_Enum_Payment_Status$: PAYMENT_STATUS,
            TeqFw_Core_Shared_Util_Cast$: cast
        }
    ) {
        // INSTANCE METHODS

        /**
         * Creates a DTO object for PayPal Payment.
         *
         * @param {Fl64_Paypal_Back_Store_RDb_Schema_Payment.Dto|Object} [data]
         * @returns {Fl64_Paypal_Back_Store_RDb_Schema_Payment.Dto}
         */
        this.createDto = function (data) {
            const res = new Dto();
            if (data) {
                res.amount = cast.decimal(data.amount);
                res.currency = cast.string(data.currency);
                res.date_captured = cast.date(data.date_captured);
                res.id = cast.int(data.id);
                res.order_ref = cast.int(data.order_ref);
                res.payer_id = cast.string(data.payer_id);
                res.paypal_payment_id = cast.string(data.paypal_payment_id);
                res.status = cast.enum(data.status, PAYMENT_STATUS);
            }
            return res;
        };

        /**
         * Returns the attribute map for the entity.
         *
         * @returns {typeof Fl64_Paypal_Back_Store_RDb_Schema_Payment.ATTR}
         */
        this.getAttributes = () => ATTR;

        /**
         * Returns the entity's path in the DEM.
         *
         * @returns {string}
         */
        this.getEntityName = () => `${DEF.NAME}${ENTITY}`;

        /**
         * Returns the primary key attributes for the entity.
         *
         * @returns {Array<string>}
         */
        this.getPrimaryKey = () => [ATTR.ID];
    }
}
