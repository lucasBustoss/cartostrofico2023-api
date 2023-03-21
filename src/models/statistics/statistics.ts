import { FixtureStatistics } from '@/models/statistics/fixtureStatistics';
import { GoalsStatistics } from '@/models/statistics/goalsStatistics';
import { CleanSheetStatistics } from '@/models/statistics/cleanSheetStatistics';
import { FailedToScoreStatistics } from '@/models/statistics/failedToScoreStatistics';
import { PenaltyStatistics } from '@/models/statistics/penaltyStatistics';
import { LineupStatistics } from '@/models/statistics/lineupStatistics';

export class Statistics {
  form: string;

  updatedAt: Date;

  fixtures: FixtureStatistics;

  goals: GoalsStatistics;

  cleanSheet: CleanSheetStatistics;

  failedToScore: FailedToScoreStatistics;

  penalty: PenaltyStatistics;

  lineups: LineupStatistics[];
}
