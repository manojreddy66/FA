/**
 * @description this file contains request validation methods
 */

const { dbConnect } = require("prismaORM/index");
const { scenariosData } = require("prismaORM/services/scenariosService");
const {
  getValidationSchema,
} = require("schemaValidator/supplyPlanning/fluctuationAllowance/getMonthlyFluctuationAllowanceSchema");

/**
 * @description Function to validate input query parameters
 * @param {Object} requestParams: API input query parameters
 * @returns {Promise<Array>} errorMessages - Validation errors if any
 */
async function validateInput(requestParams) {
  const errorMessages = [];
  /**
   * @description Validate query params using Joi schema
   */
  validateParams(requestParams, errorMessages);
  /**
   * @description If Joi validation passed, perform DB validations
   */
  if (errorMessages.length === 0) {
    /**
     * @description Validate scenario exists (DB validation)
     */
    await checkForInvalidScenarioId(requestParams, errorMessages);
  }
  return errorMessages;
}

/**
 * @description Function to validate request params using Joi schema
 * @param {Object} requestParams - query parameters
 * @param {Array} errorMessages - array to collect validation errors
 */
function validateParams(requestParams, errorMessages) {
  const schema = getValidationSchema();
  const { error } = schema.validate(requestParams, { abortEarly: false });
  if (error?.details?.length) {
    error.details.forEach((e) => errorMessages.push(e.message));
  }
}

/**
 * @description Function to check if a scenario exists
 * @param {Object} requestParams - query parameters
 * @param {Array} errorMessages - array to collect validation errors
 * @returns {Promise<boolean>}
 */
async function checkForInvalidScenarioId(requestParams, errorMessages) {
  const rdb = await dbConnect();
  const scenariosService = new scenariosData(rdb);
  try {
    /**
     * @description Get scenario data by scenarioId
     */
    const scenarioData = await scenariosService.getScenarioDataById(
      requestParams.scenarioId
    );
    /**
     * @description If provided scenarioId doesn't exist, add validation error
     */
    if (!scenarioData || scenarioData.length === 0) {
      errorMessages.push("ValidationError: Scenario doesn't exist.");
    }
  } catch (err) {
    console.log("Error in checkForInvalidScenarioId:", err);
    throw err;
  }
}

module.exports = {
  validateInput,
};
