const { BaseService } = require("./BaseService");
const { Prisma } = require("@prisma/client");

class monthlyFaData extends BaseService {
  constructor(db) {
    super(db);
  }

  /**
   * @description Function to fetch Monthly Fluctuation Allowance data with active groups by scenarioId
   * @param {String} scenarioId - scenario id
   * @returns {Array} Monthly FA data with active group details for scenarioId
   */
  async getMonthlyFaData(scenarioId) {
    try {
      return await this.prisma.$queryRaw`
        SELECT
          gp.group_id AS "groupId",
          sgm.group_name AS "groupName",
          gp.vanning_center AS "vanningCenter",
          mfa.fa_month AS "month",
          mfa.monthly_fa_percent AS "fa",
          mfa.apply_to_all_months AS "isUniformAcrossMonths"
        FROM supply_planning.group_scenario_mapper sgm
        JOIN supply_planning.grouping gp
          ON gp.group_id = sgm.group_id
        JOIN supply_planning.monthly_fa mfa
          ON mfa.group_id = gp.group_id
          AND mfa.scenario_id = sgm.scenario_id
        WHERE sgm.scenario_id = ${scenarioId}::uuid
          AND sgm.is_active = TRUE
          AND gp.is_active = TRUE
        ORDER BY sgm.group_name, mfa.fa_month;
      `;
    } catch (error) {
      console.log("Error in getMonthlyFaData:", error);
      throw error;
    }
  }

  /**
   * @description Function to get active group IDs for a scenario
   * @param {String} scenarioId - scenario id
   * @returns {Array} active group IDs for scenario
   */
  async getActiveGroupIds(scenarioId) {
    try {
      return await this.prisma.$queryRaw`
        SELECT sgm.group_id AS "groupId"
        FROM supply_planning.group_scenario_mapper sgm
        JOIN supply_planning.grouping gp
          ON gp.group_id = sgm.group_id
        WHERE sgm.scenario_id = ${scenarioId}::uuid
          AND sgm.is_active = TRUE
          AND gp.is_active = TRUE
        ORDER BY sgm.group_id;
      `;
    } catch (error) {
      console.log("Error in getActiveGroupIds:", error);
      throw error;
    }
  }

  /**
   * @description Function to bulk upsert monthly FA data
   * @param {String} scenarioId - scenario id
   * @param {String} userEmail - user email
   * @param {Number} monthlyFa - monthly FA percent value
   * @param {Boolean} applyToAllMonths - apply to all months flag
   * @param {Array} rows - array of { groupId, monthYear, monthNumber }
   * @param {Object} tx - Prisma transaction client
   */
  async upsertMonthlyFaData(
    scenarioId,
    userEmail,
    monthlyFa,
    applyToAllMonths,
    rows,
    tx = this.prisma
  ) {
    try {
      if (!rows || rows.length === 0) {
        return 0;
      }

      // Deduplicate rows by the same ON CONFLICT key in one statement.
      const uniqueRows = Array.from(
        rows
          .reduce((acc, row) => {
            const key = `${row.groupId}|${row.monthNumber}`;
            acc.set(key, row);
            return acc;
          }, new Map())
          .values()
      );

      if (uniqueRows.length === 0) {
        return 0;
      }

      const valuesSql = Prisma.join(
        uniqueRows.map(
          (r) =>
            Prisma.sql`(
              ${r.groupId}::uuid,
              ${scenarioId}::uuid,
              ${r.monthNumber}::int,
              ${r.monthYear}::text,
              ${monthlyFa}::int,
              ${applyToAllMonths}::boolean,
              ${userEmail}::text
            )`
        )
      );
      const upsertSql = Prisma.sql`
        INSERT INTO supply_planning.monthly_fa (
          group_id,
          scenario_id,
          fa_month,
          month_year,
          monthly_fa_percent,
          apply_to_all_months,
          created_by
        )
        VALUES ${valuesSql}
        ON CONFLICT (scenario_id, group_id, fa_month)
        DO UPDATE SET
          monthly_fa_percent = EXCLUDED.monthly_fa_percent,
          apply_to_all_months = EXCLUDED.apply_to_all_months,
          updated_by = EXCLUDED.created_by,
          last_updated_timestamp = CURRENT_TIMESTAMP
      `;
      return await tx.$executeRaw(upsertSql);
    } catch (error) {
      console.log("Error in upsertMonthlyFaData:", error);
      throw error;
    }
  }

  /**
   * @description Check if Fluctuation Allowance (monthly_fa) has data for all active groups 
   * in the given scenario
   * @param {String} scenarioId - scenario UUID
   * @returns {boolean} true if data exists for all active groups
   */
  async isMonthlyFaDataComplete(scenarioId) {
    try {
      const result = await this.prisma.$queryRaw`
        SELECT NOT EXISTS (
          SELECT 1
          FROM supply_planning.group_scenario_mapper sgm
          JOIN supply_planning.grouping gp ON sgm.group_id = gp.group_id
          WHERE sgm.scenario_id = ${scenarioId}::uuid
            AND sgm.is_active = TRUE
            AND gp.is_active = TRUE
            AND NOT EXISTS (
              SELECT 1
              FROM supply_planning.monthly_fa mf
              WHERE mf.scenario_id = ${scenarioId}::uuid
                AND mf.group_id = sgm.group_id
            )
        ) AS is_complete;
      `;
      return result && result.length > 0 && result[0].is_complete === true;
    } catch (error) {
      console.log("Error in isMonthlyFaDataComplete:", error);
      throw error;
    }
  }

  /**
   * @description Get monthly FA data for a given scenario and group (all months)
   * @param {String} scenarioId - scenario UUID
   * @param {String} groupId - group UUID
   * @returns {Array} monthly_fa records with fa_month and monthly_fa_percent
   */
  async getMonthlyFaByScenarioAndGroup(scenarioId, groupId) {
    try {
      const result = await this.prisma.$queryRaw`
        SELECT *
        FROM supply_planning.monthly_fa
        WHERE scenario_id = ${scenarioId}::uuid
          AND group_id = ${groupId}::uuid;
      `;
      console.log("Monthly FA data fetched:", result.length, "rows");
      return result;
    } catch (error) {
      console.log("Error in getMonthlyFaByScenarioAndGroup:", error);
      throw error;
    }
  }
}

module.exports.monthlyFaData = monthlyFaData;
