class PenaltyStatisticsDetail {
  total: number;

  percentage: string;
}

export class PenaltyStatistics {
  total: number;

  scored: PenaltyStatisticsDetail;

  missed: PenaltyStatisticsDetail;
}
