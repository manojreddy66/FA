/**
 * @description this file contains post monthly fluctuation allowance service methods
 */

const { BadRequest } = require("utils/api_response_utils");
const { validateInput } = require("./validateRequest");
const {
  updateFluctuationAllowanceNStepStatus,
} = require("./monthlyFluctuationAllowance");
const { prepareResponse } = require("./utils");

/**
 * @description Function to validate request, update DB and return response
 * @param {Object} event - Lambda event
 * @returns {Promise<Object>} { message: "Successfully updated data." }
 */
async function updateFluctuationAllowanceData(event) {
  try {
    const body = event?.body ? JSON.parse(event.body) : {};
    console.log("requestBody:", body);
    /**
     * @description Function to validate input request body
     * @param {Object} body: API input request body
     * @returns {Object} errorMessages - Validation errors if any
     * & scenarioData - scenario data by scenarioId
     */
    const { errorMessages, scenarioData } = await validateInput(body);
    /* Check for validation errors */
    if (errorMessages.length > 0) {
      throw new BadRequest(errorMessages);
    }
    /**
     * @description Update fluctuation allowance data and scenario steps data
     * @param {Object} body - request body
     * @param {Object} scenarioData - scenario data for the given scenarioId
     */
    await updateFluctuationAllowanceNStepStatus(body, scenarioData);
    /**
     * @description Prepare and return response
     * @returns {Object} success response
     */
    return prepareResponse();
  } catch (err) {
    console.log("Error in updateFluctuationAllowanceData:", err);
    throw err;
  }
}

module.exports = {
  updateFluctuationAllowanceData,
};
