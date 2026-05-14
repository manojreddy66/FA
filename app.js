/**
 * @name monthly-fluctuation-allowance
 * @description Returns Monthly Fluctuation Allowance data by scenarioId
 * @createdOn Apr 2nd, 2026
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
  getMonthlyFluctuationAllowance,
} = require("./monthlyFluctuationAllowanceService");
const { API_ERROR_MESSAGE } = require("constants/customConstants");

/**
 * @description Lambda handler for Monthly Fluctuation Allowance GET API.
 * @param {Object} event: API event with query params:
    {
    "scenarioId": "uniqueScenarioId",
    "userEmail": "user@toyota.com"
    }
 * @returns {Promise<Object>}: response sample is detailed below.
 * Success response with status code 200:
 * {
    "scenarioId": "uniqueScenarioId",
    "data": [
      {
        "groupId": "uuid",
        "groupName": "Group 1",
        "vanningCenter": "TMH",
        "fluctuationAllowance": {
          "isUniformAcrossMonths": true,
          "ranges": [
            { "month": 3, "fa": 14 }
          ]
        }
      }
    ],
    "scenarioSteps": { ... }
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
     * @description Function to validate input and fetch monthly fluctuation allowance response.
     * @param {Object} event: Input parameters
     * @returns {Object} faResponse - monthly fluctuation allowance details
     */
    const faResponse = await getMonthlyFluctuationAllowance(event);
    return sendResponse(HTTP_RESPONSE_CODES.SUCCESS, faResponse);
  } catch (error) {
    console.log("Handler Error - Monthly Fluctuation Allowance Get:", error);
    let errorMessage = API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR;
    let statusCode = HTTP_RESPONSE_CODES.INTERNAL_SERVER_ERROR;
    /**
     * @description If error is BadRequest, return 400 with validation messages
     */
    if (error instanceof BadRequest) {
      statusCode = HTTP_RESPONSE_CODES.BAD_REQUEST;
      errorMessage = error.message
        .split(/,(?=ValidationError:)/)
        .map((e) => e.trim());
      console.log(
        "Validation error messages - Monthly Fluctuation Allowance Get: ",
        errorMessage
      );
    }
    return sendResponse(statusCode, { errorMessage: errorMessage });
  }
};
