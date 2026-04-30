-- 用 DuckDB 直接查 CSV，找各門架尖峰時段最低車速。
--
-- 執行：
--   duckdb -c ".read peak_jams.sql"

WITH gantry_peaks AS (
  SELECT
    gantryId,
    freeway,
    direction,
    windowStart,
    avgSpeedKph,
    count
  FROM read_csv_auto('../data.csv')
  WHERE vehicleClass = 'S'
)
SELECT
  gantryId,
  freeway,
  direction,
  windowStart AS peakWindow,
  avgSpeedKph AS slowestKph,
  count AS vehicleCount
FROM (
  SELECT
    *,
    ROW_NUMBER() OVER (PARTITION BY gantryId ORDER BY avgSpeedKph ASC) AS rk
  FROM gantry_peaks
)
WHERE rk = 1
ORDER BY slowestKph ASC;
