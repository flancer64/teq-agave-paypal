/**
 * Persistent DTO with metadata for the RDB entity: PayPal Log.
 * @namespace Fl64_Paypal_Back_Store_RDb_Schema_Log
 */

// MODULE'S VARS

/**
 * Path to the entity in the plugin's DEM.
 *
 * @type {string}
 */
const ENTITY = '/fl64/paypal/log';

/**
 * Attribute mappings for the entity.
 * @memberOf Fl64_Paypal_Back_Store_RDb_Schema_Log
 */
const ATTR = {
    DATE_LOGGED: 'date_logged',
    ID: 'id',
    REQUEST_DATA: 'request_data',
    REQUEST_TYPE: 'request_type',
    RESPONSE_DATA: 'response_data',
    RESPONSE_STATUS: 'response_status',
};
Object.freeze(ATTR);

// MODULE'S CLASSES

/**
 * DTO class representing the persistent structure of the PayPal Log entity.
 * @memberOf Fl64_Paypal_Back_Store_RDb_Schema_Log
 */
class Dto {
    /**
     * Timestamp when log entry was recorded.
     *
     * @type {Date}
     */
    date_logged;

    /**
     * Internal log entry ID.
     *
     * @type {number}
     */
    id;

    /**
     * JSON payload of the request.
     *
     * @type {object}
     */
    request_data;

    /**
     * Type of PayPal request (e.g., order_create, capture).
     *
     * @type {string}
     */
    request_type;

    /**
     * JSON payload of the response.
     *
     * @type {object}
     */
    response_data;

    /**
     * HTTP status code of the response.
     *
     * @type {number}
     */
    response_status;
}

/**
 * Implements metadata and utility methods for the PayPal Log entity.
 * @implements TeqFw_Db_Back_Api_RDb_Schema_Object
 */
export default class Fl64_Paypal_Back_Store_RDb_Schema_Log {
    /**
     * Constructor for the PayPal Log persistent DTO class.
     *
     * @param {Fl64_Paypal_Back_Defaults} DEF
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     */
    constructor(
        {
            Fl64_Paypal_Back_Defaults$: DEF,
            TeqFw_Core_Shared_Util_Cast$: cast
        }
    ) {
        // INSTANCE METHODS

        /**
         * Creates a DTO object for PayPal Log.
         *
         * @param {Fl64_Paypal_Back_Store_RDb_Schema_Log.Dto|Object} [data]
         * @returns {Fl64_Paypal_Back_Store_RDb_Schema_Log.Dto}
         */
        this.createDto = function (data) {
            const res = new Dto();
            if (data) {
                res.date_logged = cast.date(data.date_logged);
                res.id = cast.int(data.id);
                res.request_data = cast.string(data.request_data);
                res.request_type = cast.string(data.request_type);
                res.response_data = cast.string(data.response_data);
                res.response_status = cast.int(data.response_status);
            }
            return res;
        };

        /**
         * Returns the attribute map for the entity.
         *
         * @returns {typeof Fl64_Paypal_Back_Store_RDb_Schema_Log.ATTR}
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
