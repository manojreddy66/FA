/**
 * @description DB operations to fetch Monthly Fluctuation Allowance data and scenario step status
 */

const { dbConnect } = require("prismaORM/index");
const { monthlyFaData } = require("prismaORM/services/monthlyFaService");
const {
  getScenarioStepStatusData,
} = require("utils/scenario_step_status_utils");

/**
 * @description Function to fetch monthly FA data and scenario step status
 * @param {String} scenarioId - scenario id from input
 * @param {String} userEmail - user email from input
 * @returns {Promise<Object>} monthlyFaData & scenarioStepStatusData
 */
async function getMonthlyFaNScenarioStepData(scenarioId, userEmail) {
  const rdb = await dbConnect();
  const monthlyFaDataService = new monthlyFaData(rdb);
  try {
    return await Promise.all([
      /**
       * @description Fetch monthly FA data for the given scenarioId
       * @param {String} scenarioId - scenario id from input
       * @returns {Object} monthlyFaData - monthly FA data
       */
      monthlyFaDataService.getMonthlyFaData(scenarioId),
      /**
       * @description Fetch scenario step status data for the given scenarioId
       * @param {String} scenarioId - scenario id from input
       * @param {String} userEmail - user email from input
       * @param {Object} rdb - database connection object
       * @returns {Object} scenarioStepStatusData - scenario steps data
       */
      getScenarioStepStatusData(scenarioId, userEmail, rdb),
    ]);
  } catch (error) {
    console.log("Error in getMonthlyFaNScenarioStepData:", error);
    throw error;
  }
}

module.exports = {
  getMonthlyFaNScenarioStepData,
};
