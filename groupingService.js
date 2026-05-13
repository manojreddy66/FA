const { BaseService } = require("./BaseService");
const { Prisma } = require("@prisma/client");

class groupingData extends BaseService {
  constructor(db) {
    super(db);
  }

  /**
   * @description Function to fetch groups data by scenarioId
   * Joins group_scenario_mapper, grouping, group_namc_line_series_mapper and namc_line_subseries
   * @param {String} scenarioId - scenario id
   * @returns {Array} groups data rows with groupScenarioMapId, groupName, vanningCenter, subSeries
   */
  async getGroupsDataByScenarioId(scenarioId) {
    try {
      return await this.prisma.$queryRaw`
        SELECT
          gp.group_id as "groupId",
          sgm.grp_scenario_mp_id as "groupScenarioMapId",
          sgm.group_name AS "groupName",
          gp.vanning_center AS "vanningCenter",
          nls.sub_series_description AS "subSeries"
        FROM supply_planning.group_scenario_mapper sgm
        JOIN supply_planning.grouping gp
          ON gp.group_id = sgm.group_id
        JOIN supply_planning.group_namc_line_series_mapper nlsm
          ON nlsm.group_id = gp.group_id
        JOIN supply_planning.namc_line_subseries nls
          ON nls.namc_line_series_id = nlsm.namc_line_series_id
        WHERE sgm.scenario_id = ${scenarioId}::uuid
          AND sgm.is_active = TRUE
          AND gp.is_active = TRUE
          AND nlsm.is_active = TRUE
          AND nls.is_active = TRUE;
      `;
    } catch (err) {
      console.log("Error in getGroupsDataByScenarioId:", err);
      throw err;
    }
  }

  /**
   * @description Check if every sub-series has at least one valid mapped group in the scenario
   * @param {String} scenarioId - scenario UUID
   * @param {Array} subSeriesList - expected sub-series description strings
   * @returns {boolean} true if all sub-series have groups
   */
  async isGroupsDataComplete(scenarioId, subSeriesList) {
    try {
      if (!subSeriesList || subSeriesList.length === 0) return false;

      const result = await this.prisma.$queryRaw`
        SELECT NOT EXISTS (
          SELECT 1
          FROM unnest(${subSeriesList}::text[]) AS inp(sub_series_description)
          WHERE NOT EXISTS (
            SELECT 1
            FROM supply_planning.group_scenario_mapper gsm
            INNER JOIN supply_planning.grouping g
              ON g.group_id = gsm.group_id
            INNER JOIN supply_planning.group_namc_line_series_mapper gnlsm
              ON gnlsm.group_id = g.group_id
            INNER JOIN supply_planning.namc_line_subseries nls
              ON nls.namc_line_series_id = gnlsm.namc_line_series_id
            WHERE gsm.scenario_id = ${scenarioId}::uuid
              AND nls.sub_series_description = inp.sub_series_description
              AND gsm.is_active = true
              AND g.is_active = true
              AND gnlsm.is_active = true
              AND nls.is_active = true
              AND g.effective_in <= CURRENT_DATE
              AND (g.effective_out IS NULL OR g.effective_out >= CURRENT_DATE)
          )
        ) AS is_complete;
      `;
      return result && result.length > 0 && result[0].is_complete === true;
    } catch (error) {
      console.log("Error in isGroupsDataComplete:", error);
      throw error;
    }
  }

  /**
   * @description Function to find reusable group by exact config
   * @param {String} namc - namc value
   * @param {String} line - line value
   * @param {String} vanningCenter - vanning center
   * @param {Array} subSeriesList - list of sub-series descriptions
   * @param {Object} tx - prisma transaction client
   * @returns {Array} matched grouping rows
   */
  async findReusableGroupId(
    namc,
    line,
    vanningCenter,
    subSeriesList,
    tx = this.prisma
  ) {
    try {
      return await tx.$queryRaw(
        Prisma.sql`
          SELECT
            g.group_id as "groupId"
          FROM
            supply_planning.grouping g
          INNER JOIN
            supply_planning.group_namc_line_series_mapper gnlsm
            ON g.group_id = gnlsm.group_id
          INNER JOIN
            supply_planning.namc_line_subseries nls
            ON gnlsm.namc_line_series_id = nls.namc_line_series_id
          WHERE
            nls.namc = ${namc}
            AND nls.line = ${line}
            AND g.vanning_center = ${vanningCenter}
            AND nls.sub_series_description IN (${Prisma.join(subSeriesList)})
            AND g.is_active = TRUE
            AND gnlsm.is_active = TRUE
            AND nls.is_active = TRUE
          GROUP BY
            g.group_id
          HAVING
            COUNT(DISTINCT nls.sub_series_description) = ${subSeriesList.length}
          ORDER BY
            MAX(g.last_updated_timestamp) DESC
          LIMIT 1;
        `
      );
    } catch (err) {
      console.log("Error in findReusableGroupId:", err);
      throw err;
    }
  }

  /**
   * @description Function to insert a new grouping row and return groupId
   * @param {String} vanningCenter - vanning center
   * @param {String} userEmail - user email for audit
   * @param {Object} tx - prisma transaction client
   * @returns {Array} inserted grouping row with groupId
   */
  async insertGroupingData(vanningCenter, userEmail, tx = this.prisma) {
    try {
      return await tx.$queryRaw`
        INSERT INTO supply_planning.grouping (
          vanning_center,
          effective_in,
          is_active,
          created_by
        )
        VALUES (
          ${vanningCenter}::text,
          NOW()::date,
          TRUE,
          ${userEmail}::text
        )
        RETURNING group_id as "groupId";
      `;
    } catch (err) {
      console.log("Error in insertGroupingData:", err);
      throw err;
    }
  }
}

module.exports.groupingData = groupingData;
