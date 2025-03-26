/**
 * Persistent DTO with metadata for the RDB entity: PayPal Order.
 * @namespace Fl64_Paypal_Back_Store_RDb_Schema_Order
 */

// MODULE'S VARS

/**
 * Path to the entity in the plugin's DEM.
 *
 * @type {string}
 */
const ENTITY = '/fl64/paypal/order';

/**
 * Attribute mappings for the entity.
 * @memberOf Fl64_Paypal_Back_Store_RDb_Schema_Order
 */
const ATTR = {
    AMOUNT: 'amount',
    CURRENCY: 'currency',
    DATE_CREATED: 'date_created',
    ID: 'id',
    PAYPAL_ORDER_ID: 'paypal_order_id',
    STATUS: 'status',
    USER_REF: 'user_ref',
};
Object.freeze(ATTR);

// MODULE'S CLASSES

/**
 * DTO class representing the persistent structure of the PayPal Order entity.
 * @memberOf Fl64_Paypal_Back_Store_RDb_Schema_Order
 */
class Dto {
    /**
     * Order total amount.
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
     * Timestamp when the order was created.
     *
     * @type {Date}
     */
    date_created;

    /**
     * Internal order ID.
     *
     * @type {number}
     */
    id;

    /**
     * Order ID from PayPal.
     *
     * @type {string}
     */
    paypal_order_id;

    /**
     * Current status of the order.
     *
     * @type {string}
     * @see Fl64_Paypal_Back_Enum_Order_Status
     */
    status;

    /**
     * Reference to the user who created the order.
     *
     * @type {number}
     */
    user_ref;
}

/**
 * Implements metadata and utility methods for the PayPal Order entity.
 * @implements TeqFw_Db_Back_Api_RDb_Schema_Object
 */
export default class Fl64_Paypal_Back_Store_RDb_Schema_Order {
    /**
     * Constructor for the PayPal Order persistent DTO class.
     *
     * @param {Fl64_Paypal_Back_Defaults} DEF
     * @param {typeof Fl64_Paypal_Back_Enum_Order_Status} ORDER_STATUS
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     */
    constructor(
        {
            Fl64_Paypal_Back_Defaults$: DEF,
            Fl64_Paypal_Back_Enum_Order_Status$: ORDER_STATUS,
            TeqFw_Core_Shared_Util_Cast$: cast
        }
    ) {
        // INSTANCE METHODS

        /**
         * Creates a DTO object for PayPal Order.
         *
         * @param {Fl64_Paypal_Back_Store_RDb_Schema_Order.Dto|Object} [data]
         * @returns {Fl64_Paypal_Back_Store_RDb_Schema_Order.Dto}
         */
        this.createDto = function (data) {
            const res = new Dto();
            if (data) {
                res.amount = cast.decimal(data.amount);
                res.currency = cast.string(data.currency);
                res.date_created = cast.date(data.date_created);
                res.id = cast.int(data.id);
                res.paypal_order_id = cast.string(data.paypal_order_id);
                res.status = cast.enum(data.status, ORDER_STATUS);
                res.user_ref = cast.int(data.user_ref);
            }
            return res;
        };

        /**
         * Returns the attribute map for the entity.
         *
         * @returns {typeof Fl64_Paypal_Back_Store_RDb_Schema_Order.ATTR}
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
