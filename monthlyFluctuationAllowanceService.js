/**
 * @description this file contains Monthly Fluctuation Allowance service methods
 */

const { validateInput } = require("./validateRequest");
const { prepareResponse } = require("./utils");
const {
  getMonthlyFaNScenarioStepData,
} = require("./monthlyFluctuationAllowance");
const { BadRequest } = require("utils/api_response_utils");

/**
 * @description Function to validate request, fetch data and return response
 * @param {Object} event - Lambda event
 * @returns {Promise<Object>} formatted monthly fluctuation allowance response
 */
async function getMonthlyFluctuationAllowance(event) {
  try {
    const queryParams = event?.queryStringParameters || {};
    console.log("queryParams:", queryParams);
    /**
     * @description Function to validate input query parameters
     * @param {Object} queryParams: API input query parameters
     * @returns {Array} errorMessages - Validation errors if any
     */
    const errorMessages = await validateInput(queryParams);
    /**
     * @description Check for validation errors
     */
    if (errorMessages.length > 0) {
      throw new BadRequest(errorMessages);
    }
    /* Extract input params */
    const { scenarioId, userEmail } = queryParams;
    /**
     * @description Function to fetch monthly FA data and scenario step status
     * @param {String} scenarioId - scenario id from input
     * @param {String} userEmail - user email from input
     * @returns {Array} monthlyFaData & scenarioStepStatusData
     */
    const [monthlyFaData, scenarioStepStatusData] =
      await getMonthlyFaNScenarioStepData(scenarioId, userEmail);
    /**
     * @description Prepare and return formatted response
     * @param {String} scenarioId - scenario id from input
     * @param {Array} monthlyFaData - monthly fluctuation allowance data for given scenarioId
     * @param {Object} scenarioStepStatusData - scenario steps with statuses
     * @returns {Object} monthly fa data & scenario steps with statues
     */
    return prepareResponse(scenarioId, monthlyFaData, scenarioStepStatusData);
  } catch (error) {
    console.log("Error in getMonthlyFluctuationAllowance:", error);
    throw error;
  }
}

module.exports = {
  getMonthlyFluctuationAllowance,
};
