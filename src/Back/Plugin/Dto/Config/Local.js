/**
 * Local configuration DTO for the plugin.
 * @see TeqFw_Core_Back_Config
 */

/**
 * @memberOf Fl64_Paypal_Back_Plugin_Dto_Config_Local
 */
class Dto {
    /**
     * @type {string}
     */
    clientId;

    /**
     * @type {string}
     */
    clientSecret;

    /**
     * @type {string}
     * @see Fl64_Paypal_Back_Enum_Mode
     */
    mode;
}

/**
 * @implements TeqFw_Core_Shared_Api_Factory
 */
export default class Fl64_Paypal_Back_Plugin_Dto_Config_Local {
    /**
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     * @param {typeof Fl64_Paypal_Back_Enum_Mode} MODE
     */
    constructor(
        {
            TeqFw_Core_Shared_Util_Cast$: cast,
            'Fl64_Paypal_Back_Enum_Mode.default': MODE,
        }
    ) {
        this.create = function (data) {
            const res = Object.assign(new Dto(), data);
            res.clientId = cast.string(data?.clientId);
            res.clientSecret = cast.string(data?.clientSecret);
            res.mode = cast.enum(data?.mode, MODE);
            return res;
        };
    }
}