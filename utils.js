/**
 * @description this file contains Monthly Fluctuation Allowance common utils
 */

/**
 * @description Function to prepare success response
 * @param {String} scenarioId - scenario id from input
 * @param {Array} monthlyFaData - monthly FA data for given scenarioId
 * @param {Object} scenarioStepStatusData - formatted scenario step status
 * @returns {Object} response - formatted response
 */
function prepareResponse(scenarioId, monthlyFaData, scenarioStepStatusData) {
  return {
    scenarioId,
    data: formatMonthlyFaData(monthlyFaData),
    scenarioSteps: scenarioStepStatusData,
  };
}

/**
 * @description Function to group flat DB rows by groupId and format into nested response structure
 * @param {Array} monthlyFaData - raw DB rows with groupId, groupName, vanningCenter, month, year, fa, isUniformAcrossMonths
 * @returns {Array} formatted data grouped by groupId
 */
function formatMonthlyFaData(monthlyFaData) {
  const groupMap = new Map();
  /**
   * @description Iterate through monthlyFaData rows, group by groupId
   */
  for (const row of monthlyFaData) {
    let group = groupMap.get(row.groupId);
    /**
     * @description If group for the current row's groupId doesn't exist,
     * create a new group object and add to groupMap.
     */
    if (!group) {
      group = {
        groupId: row.groupId,
        groupName: row.groupName,
        vanningCenter: row.vanningCenter,
        isUniformAcrossMonths: row.isUniformAcrossMonths,
        fluctuationAllowance: {
          ranges: [],
        },
      };
      groupMap.set(row.groupId, group);
    }
    /**
     * @description Push month, year and FA details into fluctuationAllowance.ranges array for each group
     */
    const ranges = group.fluctuationAllowance.ranges;
    ranges.push({
      month: row.month,
      fa: row.fa,
    });
  }
  /**
   * @description Convert the grouped data in groupMap into the desired response format -
   * an array of groups with their fluctuation allowance details
   */
  return Array.from(groupMap.values()).map((group) => ({
    groupId: group.groupId,
    groupName: group.groupName,
    vanningCenter: group.vanningCenter,
    fluctuationAllowance: {
      isUniformAcrossMonths: group.isUniformAcrossMonths,
      ranges: group.fluctuationAllowance.ranges,
    },
  }));
}

module.exports = {
  prepareResponse,
};
