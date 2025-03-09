/**
 * Plugin constants (hardcoded configuration) for backend code.
 */
export default class Fl64_Paypal_Back_Defaults {
    /** @type {TeqFw_Web_Back_Defaults} */
    MOD_WEB;

    LOCALE = 'en';

    NAME;

    /** @type {Fl64_Paypal_Shared_Defaults} */
    SHARED;

    /**
     * @param {Fl64_Paypal_Shared_Defaults} SHARED
     * @param {TeqFw_Web_Back_Defaults} MOD_WEB
     */
    constructor(
        {
            Fl64_Paypal_Shared_Defaults$: SHARED,
            TeqFw_Web_Back_Defaults$: MOD_WEB,
        }
    ) {
        this.MOD_WEB = MOD_WEB;
        this.SHARED = SHARED;

        this.NAME = SHARED.NAME;
        Object.freeze(this);
    }
}
