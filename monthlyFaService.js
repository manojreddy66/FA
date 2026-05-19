const { BaseService } = require("./BaseService");

/**
 * @description Mock service for Monthly Fluctuation Allowance API
 */
class monthlyFaData extends BaseService {
  constructor(db) {
    super(db);
  }

  /**
   * @description Function to fetch Monthly Fluctuation Allowance data by scenarioId
   */
  async getMonthlyFaData(scenarioId) {
    try {
      console.log(
        "*********query***********",
        `SELECT gp.group_id, sgm.group_name, gp.vanning_center, mfa.month, mfa.year, mfa.monthly_fa_percent, mfa.apply_to_all_months FROM supply_planning.group_scenario_mapper sgm JOIN supply_planning.grouping gp ON gp.group_id = sgm.group_id JOIN supply_planning.monthly_fa mfa ON mfa.group_id = gp.group_id AND mfa.scenario_id = sgm.scenario_id WHERE sgm.scenario_id = ${scenarioId}::uuid`
      );

      // Simulate DB error
      if (process.env.VALIDATION === "dberror") {
        throw new Error("getMonthlyFaData DB error");
      }

      // No data case
      if (process.env.VALIDATION === "nodata") {
        return [];
      }

      // Coverage case: one non-active-group row set + cross-year ranges
      if (process.env.VALIDATION === "crossyearnewgroup") {
        return [
          {
            groupId: "extra-group-uuid-3333-4444-5555-666677778888",
            groupName: "Group 3",
            vanningCenter: "TMMTX",
            year: 2027,
            month: 1,
            fa: 15,
            isUniformAcrossMonths: false,
          },
          {
            groupId: "extra-group-uuid-3333-4444-5555-666677778888",
            groupName: "Group 3",
            vanningCenter: "TMMTX",
            year: 2026,
            month: 12,
            fa: 14,
            isUniformAcrossMonths: false,
          },
        ];
      }

      // Default sample rows - 2 groups, Group 1 uniform (same fa), Group 2 non-uniform (different fa)
      return [
        {
          groupId: "0c1b2a3d-1111-2222-3333-444455556666",
          groupName: "Group 1",
          vanningCenter: "TMH",
          month: 3,
          fa: 14,
          isUniformAcrossMonths: true,
        },
        {
          groupId: "0c1b2a3d-1111-2222-3333-444455556666",
          groupName: "Group 1",
          vanningCenter: "TMH",
          month: 4,
          fa: 14,
          isUniformAcrossMonths: true,
        },
        {
          groupId: "0d1b2a3d-1111-2222-3333-444455557777",
          groupName: "Group 2",
          vanningCenter: "TMK",
          month: 3,
          fa: 14,
          isUniformAcrossMonths: false,
        },
        {
          groupId: "0d1b2a3d-1111-2222-3333-444455557777",
          groupName: "Group 2",
          vanningCenter: "TMK",
          month: 4,
          fa: 10,
          isUniformAcrossMonths: false,
        },
      ];
    } catch (error) {
      console.log("Error in getMonthlyFaData:", error);
      throw error;
    }
  }

  /**
   * @description Function to get active group IDs for a scenario
   */
  async getActiveGroupIds(scenarioId) {
    try {
      console.log(
        "*********query***********",
        `SELECT sgm.group_id AS "groupId" FROM supply_planning.group_scenario_mapper sgm JOIN supply_planning.grouping gp ON gp.group_id = sgm.group_id WHERE sgm.scenario_id = ${scenarioId}::uuid AND sgm.is_active = TRUE AND gp.is_active = TRUE ORDER BY sgm.group_id`
      );

      if (process.env.VALIDATION === "groupidserror") {
        throw new Error("getActiveGroupIds DB error");
      }

      return [
        { groupId: "0c1b2a3d-1111-2222-3333-444455556666" },
        { groupId: "0d1b2a3d-1111-2222-3333-444455557777" },
      ];
    } catch (error) {
      console.log("Error in getActiveGroupIds:", error);
      throw error;
    }
  }

  /**
   * @description Function to bulk upsert monthly FA data
   */
  async upsertMonthlyFaData(
    scenarioId,
    userEmail,
    monthlyFa,
    applyToAllMonths,
    rows,
    tx
  ) {
    try {
      console.log(
        "*********query***********",
        `upsert monthly_fa for scenario_id=${scenarioId}, updated_by=${userEmail}, fa=${monthlyFa}, rows=${(rows || []).length}`
      );

      if (process.env.VALIDATION === "upserterror") {
        throw new Error("upsertMonthlyFaData DB error");
      }

      return "success";
    } catch (error) {
      console.log("Error in upsertMonthlyFaData:", error);
      throw error;
    }
  }

  /**
   * @description Mock: Check if Monthly Fluctuation Allowance has data for the given scenario
   * @param {String} scenarioId - scenario UUID
   * @returns {boolean} true if data exists
   */
  async isMonthlyFaDataComplete(scenarioId) {
    try {
      console.log(
        "*********query***********",
        `SELECT COUNT(1) as count FROM supply_planning.monthly_fa WHERE scenario_id = ${scenarioId}::uuid`
      );
      if (process.env.COMPLETENESS === "nodata") {
        return false;
      }
      if (process.env.COMPLETENESS === "dberror") {
        throw new Error("isMonthlyFaDataComplete DB error");
      }
      return true;
    } catch (error) {
      console.log("Error in isMonthlyFaDataComplete:", error);
      throw error;
    }
  }

  /**
   * @description Mock: Get monthly FA data for a given scenario and group (all months)
   * @param {String} scenarioId - scenario UUID
   * @param {String} groupId - group UUID
   * @returns {Array} monthly_fa records
   */
  async getMonthlyFaByScenarioAndGroup(scenarioId, groupId) {
    try {
      console.log(
        "*********query***********",
        `SELECT * FROM supply_planning.monthly_fa WHERE scenario_id = ${scenarioId}::uuid AND group_id = ${groupId}::uuid`
      );
      if (process.env.EXECUTION === "monthlyfaerror") {
        throw new Error("getMonthlyFaByScenarioAndGroup DB error");
      }
      if (process.env.EXECUTION === "nodata") {
        return [];
      }
      return [
        { fa_month: 1, monthly_fa_percent: 14 },
        { fa_month: 2, monthly_fa_percent: 14 },
      ];
    } catch (error) {
      console.log("Error in getMonthlyFaByScenarioAndGroup:", error);
      throw error;
    }
  }
}

module.exports.monthlyFaData = monthlyFaData;