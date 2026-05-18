/**
 * @description this file contains post fluctuation allowance common utils
 */

/**
 * @description Function to prepare success response for post fluctuation allowance api
 * @returns {Object} response - success response
 */
function prepareResponse() {
  return {
    message: "Successfully updated data.",
  };
}

/**
 * @description Parse "YYYYMM" string to a Date object (first day of that month)
 * @param {String} monthYear - e.g. "202502"
 * @returns {Date} Date object
 */
function parseMonthYear(monthYear) {
  const year = Number.parseInt(monthYear.substring(0, 4), 10);
  const month = Number.parseInt(monthYear.substring(4, 6), 10);
  return new Date(Date.UTC(year, month - 1, 1));
}

/**
 * @description Build a list of {monthYear, monthNumber} between startDate and endDate (inclusive).
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {{monthYear:string, monthNumber:number}[]}
 */
function buildScenarioMonths(startDate, endDate) {
  const monthsYears = [];
  const cursor = new Date(
    Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1)
  );
  const end = new Date(
    Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1)
  );
  let monthIndex = 1;
  while (cursor.getTime() <= end.getTime()) {
    const month = cursor.getUTCMonth() + 1;
    const year = cursor.getUTCFullYear();
    monthsYears.push({
      monthYear: `${year}${String(month).padStart(2, "0")}`,
      monthNumber: monthIndex,
    });
    monthIndex += 1;
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return monthsYears;
}

module.exports = {
  prepareResponse,
  parseMonthYear,
  buildScenarioMonths,
};
