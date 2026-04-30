#!/usr/bin/env Rscript
# 繪製指定測站當日 24 小時 PM2.5 走勢
#
# 執行：
#   Rscript plot_pm25.R 沙鹿 2026-04-28

suppressPackageStartupMessages({
  library(readr)
  library(dplyr)
  library(ggplot2)
  library(lubridate)
})

args <- commandArgs(trailingOnly = TRUE)
site <- if (length(args) >= 1) args[[1]] else "沙鹿"
date <- if (length(args) >= 2) as.Date(args[[2]]) else as.Date("2026-04-28")

raw <- read_csv("../data.csv", show_col_types = FALSE)

df <- raw %>%
  mutate(ts = ymd_hms(datetime)) %>%
  filter(siteName == site, as.Date(ts) == date)

p <- ggplot(df, aes(x = ts, y = pm25)) +
  geom_line(linewidth = 1) +
  geom_point(size = 2) +
  labs(
    title = sprintf("%s 測站 PM2.5 走勢 — %s", site, format(date)),
    x = "時間",
    y = expression(PM[2.5] ~ "(" * mu * "g/m" ^ 3 * ")")
  ) +
  theme_minimal(base_size = 13)

ggsave(sprintf("pm25_%s_%s.png", site, format(date)), p, width = 8, height = 4, dpi = 150)
cat(sprintf("已輸出 pm25_%s_%s.png\n", site, format(date)))
