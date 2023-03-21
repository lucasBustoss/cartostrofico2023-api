class TotalGoalsStatistics {
  home: number;

  away: number;

  total: number;
}

class AverageGoalsStatistics {
  home: string;

  away: string;

  total: string;
}

class MinuteGoalsStatisticsDetail {
  total: number | null;

  percentage: string | null;
}

class MinuteGoalsStatistics {
  '0-15': MinuteGoalsStatisticsDetail;

  '16-30': MinuteGoalsStatisticsDetail;

  '31-45': MinuteGoalsStatisticsDetail;

  '46-60': MinuteGoalsStatisticsDetail;

  '61-75': MinuteGoalsStatisticsDetail;

  '76-90': MinuteGoalsStatisticsDetail;

  '91-105': MinuteGoalsStatisticsDetail;

  '106-120': MinuteGoalsStatisticsDetail;
}

class GoalsDetailStatistics {
  total: TotalGoalsStatistics;

  average: AverageGoalsStatistics;

  minute: MinuteGoalsStatistics;
}

export class GoalsStatistics {
  for: GoalsDetailStatistics;

  against: GoalsDetailStatistics;
}
