/**
 * Repository for managing PayPal Payment records in the database.
 * @implements TeqFw_Db_Back_Api_RDb_Repository
 */
export default class Fl64_Paypal_Back_Store_RDb_Repo_Payment {
    /**
     * Constructor for PayPal Payment repository.
     *
     * @param {TeqFw_Db_Back_App_Crud} crud - CRUD engine for database operations.
     * @param {Fl64_Paypal_Back_Store_RDb_Schema_Payment} schema - Persistent DTO schema for PayPal Payment.
     */
    constructor(
        {
            TeqFw_Db_Back_App_Crud$: crud,
            Fl64_Paypal_Back_Store_RDb_Schema_Payment$: schema,
        }
    ) {
        /**
         * Creates a DTO object for PayPal Payment.
         *
         * @param {Fl64_Paypal_Back_Store_RDb_Schema_Payment.Dto|Object} [dto]
         * @returns {Fl64_Paypal_Back_Store_RDb_Schema_Payment.Dto}
         */
        this.createDto = (dto) => schema.createDto(dto);

        /**
         * Inserts a new payment entry into the database.
         *
         * @param {Object} params
         * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx]
         * @param {Fl64_Paypal_Back_Store_RDb_Schema_Payment.Dto} [params.dto]
         * @returns {Promise<{primaryKey: Object<string, string|number>}>}
         */
        this.createOne = async function ({trx, dto}) {
            return crud.createOne({schema, trx, dto});
        };

        /**
         * Deletes multiple payment entries matching the conditions.
         *
         * @param {Object} params
         * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx]
         * @param {Object} params.conditions
         * @returns {Promise<{deletedCount: number}>}
         */
        this.deleteMany = async function ({trx, conditions}) {
            return crud.deleteMany({schema, trx, conditions});
        };

        /**
         * Deletes a payment entry by its primary key.
         *
         * @param {Object} params
         * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx]
         * @param {Object} params.key
         * @returns {Promise<{deletedCount: number}>}
         */
        this.deleteOne = async function ({trx, key}) {
            return crud.deleteOne({schema, trx, key});
        };

        /**
         * Returns the schema of the PayPal Payment entity.
         *
         * @returns {Fl64_Paypal_Back_Store_RDb_Schema_Payment}
         */
        this.getSchema = () => schema;

        /**
         * Reads multiple payment entries based on conditions.
         *
         * @param {Object} params
         * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx]
         * @param {Object} [params.conditions]
         * @param {Object<string, 'asc'|'desc'>} [params.sorting]
         * @param {{limit: number, offset: number}} [params.pagination]
         * @returns {Promise<{records: Array<Fl64_Paypal_Back_Store_RDb_Schema_Payment.Dto>}>}
         */
        this.readMany = async function ({trx, conditions, sorting, pagination}) {
            return crud.readMany({schema, trx, conditions, sorting, pagination});
        };

        /**
         * Reads a single payment entry by primary key.
         *
         * @param {Object} params
         * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx]
         * @param {Object} params.key
         * @param {Array<string>} [params.select]
         * @returns {Promise<{record: Fl64_Paypal_Back_Store_RDb_Schema_Payment.Dto|null}>}
         */
        this.readOne = async function ({trx, key, select}) {
            return crud.readOne({schema, trx, key, select});
        };

        /**
         * Updates multiple payment entries based on conditions.
         *
         * @param {Object} params
         * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx]
         * @param {Object} params.conditions
         * @param {Object} params.updates
         * @returns {Promise<{updatedCount: number}>}
         */
        this.updateMany = async function ({trx, conditions, updates}) {
            return crud.updateMany({schema, trx, conditions, updates});
        };

        /**
         * Updates a single payment entry by its primary key.
         *
         * @param {Object} params
         * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx]
         * @param {Object} params.key
         * @param {Object} params.updates
         * @returns {Promise<{updatedCount: number}>}
         */
        this.updateOne = async function ({trx, key, updates}) {
            return crud.updateOne({schema, trx, key, updates});
        };
    }
}
