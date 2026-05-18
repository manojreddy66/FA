/**
 * @name monthly-fluctuation-allowance
 * @description Returns success message after updating monthly fluctuation allowance data
 * @createdOn Apr 6th, 2026
 * @modifiedBy
 * @modifiedOn
 * @modificationSummary
 */

const {
  sendResponse,
  BadRequest,
  HTTP_RESPONSE_CODES,
} = require("utils/api_response_utils");
const {
  updateFluctuationAllowanceData,
} = require("./monthlyFluctuationAllowanceService");
const { API_ERROR_MESSAGE } = require("constants/customConstants");

/**
 * @description Lambda handler for post monthly fluctuation allowance API.
 * @param {Object} event: API event with request body:
   {
    "scenarioId": "uniqueScenarioId",
    "userEmail": "user@toyota.com",
    "applyTo": "ALL_GROUPS",
    "mode": "ALL_MONTHS",
    "data": {
      "fa": { "value": 10 }
    }
   }
 * @returns {Promise<Object>}: response with status code 200 and message:
  {
   "message": "Successfully updated data."
  }
 * In-valid input error with status 400:
  {
    "errorMessage": [<"ValidationError: validation error message">]
  }
 * Internal server error with status code 500:
  {
    "errorMessage": "Internal Server Error"
  }
 */
exports.handler = async (event) => {
  try {
    /**
     * @description Function to validate input and update monthly fluctuation allowance data.
     * @param {Object} event: Input parameters
     * @returns {Object} successRes - success message
     */
    const successRes = await updateFluctuationAllowanceData(event);
    console.log("result:", successRes);
    return sendResponse(HTTP_RESPONSE_CODES.SUCCESS, successRes);
  } catch (err) {
    console.log("Handler Error - Post Monthly Fluctuation Allowance API:", err);
    let errorMessage = API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR;
    let statusCode = HTTP_RESPONSE_CODES.INTERNAL_SERVER_ERROR;
    /**
     * @description If error is BadRequest, return 400 with validation messages
     */
    if (err instanceof BadRequest) {
      statusCode = HTTP_RESPONSE_CODES.BAD_REQUEST;
      errorMessage = err.message
        .split(/,(?=ValidationError:)/)
        .map((e) => e.trim());
      console.log(
        "Validation error messages - Post Monthly Fluctuation Allowance API: ",
        errorMessage
      );
    }
    return sendResponse(statusCode, { errorMessage: errorMessage });
  }
};
