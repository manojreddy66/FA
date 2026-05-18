/**
 * @description this file contains request validation methods
 */

const { dbConnect } = require("prismaORM/index");
const { scenariosData } = require("prismaORM/services/scenariosService");
const {
  getValidationSchema,
} = require("schemaValidator/supplyPlanning/fluctuationAllowance/postMonthlyFluctuationAllowanceSchema");
const {
  emptyInputCheck,
  checkForNonEditableScenario,
} = require("utils/common_utils");
const { BadRequest } = require("utils/api_response_utils");

/**
 * @description Function to validate input request body
 * @param {Object} payload: API input request body
 * @returns {Promise<Object>} errorMessages - Validation errors if any
 * & scenarioData - scenario data by scenarioId
 */
async function validateInput(payload) {
  const errorMessages = [];
  /**
   * @description Function to check if request body is empty
   * @param {Object} payload: Input request
   */
  emptyInputCheck(payload);
  /**
   * @description Validate request body using Joi schema
   */
  validateParams(payload, errorMessages);
  let scenarioData = null;
  /**
   * @description If Joi validation passed, perform DB validation
   */
  if (errorMessages.length === 0) {
    /**
     * @description Validate scenario exists (DB validation)
     */
    scenarioData = await checkForInvalidScenario(payload);
    /**
     * @description If scenario exists, validate that all simulations are in draft status
     */
    await checkForNonEditableScenario(payload);
  }
  return { errorMessages: [...new Set(errorMessages)], scenarioData };
}

/**
 * @description Function to validate request params using Joi schema
 * @param {Object} payload - request body
 * @param {Array} errorMessages - array to collect validation errors
 */
function validateParams(payload, errorMessages) {
  const schema = getValidationSchema();
  const { error } = schema.validate(payload, { abortEarly: false });
  if (error?.details?.length) {
    error.details.forEach((e) => errorMessages.push(e.message));
  }
}

/**
 * @description Function to check if a scenario exists
 * @param {Object} payload - request body
 * @returns {Promise<Object>} scenario row if exists else throws error
 */
async function checkForInvalidScenario(payload) {
  const rdb = await dbConnect();
  const scenariosService = new scenariosData(rdb);
  try {
    /**
     * @description Get scenario data by scenarioId
     */
    const scenarioData = await scenariosService.getScenarioDataById(
      payload.scenarioId
    );
    /**
     * @description If scenario doesn't exist, throw validation error
     */
    if (!scenarioData || scenarioData.length === 0) {
      throw new BadRequest("ValidationError: Scenario doesn't exist.");
    }
    return scenarioData[0];
  } catch (err) {
    console.log("Error in checkForInvalidScenario:", err);
    throw err;
  }
}

module.exports = {
  validateInput,
};
