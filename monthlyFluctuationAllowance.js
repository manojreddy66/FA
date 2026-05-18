/**
 * @description DB operations to bulk upsert fluctuation allowance data and update scenario step status
 */

const { dbConnect } = require("prismaORM/index");
const { monthlyFaData } = require("prismaORM/services/monthlyFaService");
const {
  scenarioStepStatusData,
} = require("prismaORM/services/scenarioStepStatusService");
const { scenariosData } = require("prismaORM/services/scenariosService");
const { VALID_STEP_NAMES } = require("constants/customConstants");
const { updateScenarioNStepStatus } = require("utils/common_utils");
const { parseMonthYear, buildScenarioMonths } = require("./utils");

/**
 * @description Function to update fluctuation allowance data and update scenario step status
 * @param {Object} body - request payload
 * @param {Object} scenarioData - scenario data for the given scenarioId
 * @returns {Promise<Object>} Response object
 */
async function updateFluctuationAllowanceNStepStatus(body, scenarioData) {
  const rdb = await dbConnect();
  const monthlyFaDataService = new monthlyFaData(rdb);
  const scenarioStepStatusService = new scenarioStepStatusData(rdb);
  const scenariosDataService = new scenariosData(rdb);
  try {
    /**
     * @description Parse scenario start and end month-year to Date objects
     */
    const startDate = parseMonthYear(scenarioData.start_month_year);
    const endDate = parseMonthYear(scenarioData.end_month_year);
    /**
     * @description Build months array from scenario timeframe
     */
    const monthsYears = buildScenarioMonths(startDate, endDate);
    /**
     * @description Get active groupIds for this scenario
     */
    const groupIds = await monthlyFaDataService.getActiveGroupIds(
      body.scenarioId
    );

    /**
     * @description Create array of objects for bulk upsert,
     * with all combinations of groupIds and monthsYears
     * @param groupIds: array of active groupIds for the scenario
     * @param monthsYears: array of month-year objects for the scenario timeframe
     * @returns {Array} Array of objects for bulk upsert
     */
    const bulkUpsertData = createBulkUpsertData(groupIds, monthsYears);

    await rdb.prisma.$transaction(async (tx) => {
      await Promise.all([
        /**
         * @description Bulk upsert monthly FA data for all groups and months
         */
        monthlyFaDataService.upsertMonthlyFaData(
          body.scenarioId,
          body.userEmail,
          body.data.fa.value,
          true,
          bulkUpsertData,
          tx
        ),
        /**
         * @description Function to upsert scenario step status to In Progress
         * and update scenario status if not already In Progress
         * @param {Object} body - request payload containing scenarioId and userEmail
         * @param {Object} scenarioData - scenario row for the given scenarioId
         * @param {*} scenarioStepName - Fluctuation Allowance step name
         * @param {Object} scenarioStepStatusService - scenarioStepStatusData service instance for DB operations on scenario_step_status table
         * @param {Object} scenariosDataService - scenariosData service instance for DB operations on scenarios table
         * @param {Object} tx - transaction object for DB operations
         */
        updateScenarioNStepStatus(
          body,
          scenarioData,
          VALID_STEP_NAMES[8],
          scenarioStepStatusService,
          scenariosDataService,
          tx
        ),
      ]);
    });
  } catch (err) {
    console.log("Error in updateFluctuationAllowanceNStepStatus:", err);
    throw err;
  }
}

/**
 * @description Create array of objects for bulk upsert,
 * with all combinations of groupIds and monthsYears
 * @param groupIds: array of active groupIds for the scenario
 * @param monthsYears: array of month-year objects for the scenario timeframe
 * @returns {Array} Array of objects for bulk upsert
 */
function createBulkUpsertData(groupIds, monthsYears) {
  const data = [];
  for (const group of groupIds) {
    for (const item of monthsYears) {
      data.push({
        groupId: group.groupId,
        monthYear: item.monthYear,
        monthNumber: item.monthNumber,
      });
    }
  }
  return data;
}

module.exports = {
  updateFluctuationAllowanceNStepStatus,
};
