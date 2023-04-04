import { Tournament } from '@/models/Tournament';
import mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  logoPng: {
    type: String,
    required: true,
  },
  logoSvg: {
    type: String,
    required: true,
  },
  coach: {
    type: String,
    required: true,
  },
  teamId: {
    type: Number,
    required: true,
  },
  eliminated: {
    type: Boolean,
    required: true,
    default: false,
  },
  position: {
    type: Number,
    required: true,
    default: 1,
  },
  points: {
    type: Number,
    required: false,
  },
});

const AwardSchema = new mongoose.Schema({
  position: {
    type: Number,
    required: true,
  },
  award: {
    type: String,
    required: true,
  },
});

const CorrespondentRoundSchema = new mongoose.Schema({
  phase: {
    type: String,
    required: true,
  },
  round: {
    type: Number,
    required: true,
  },
  correspondent: {
    type: Number,
    required: true,
  },
  played: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const ParameterSchema = new mongoose.Schema({
  drawOffset: {
    type: Number,
    required: true,
    default: 0,
  },
  relegationQuantity: {
    type: Number,
    default: 4,
  },
  classificationQuantity: {
    type: Number,
    default: 4,
  },
  playoffType: {
    type: String,
    default: 'draw',
  },
  pointsPerWin: {
    type: Number,
    required: true,
    default: 3,
  },
  pointsPerDraw: {
    type: Number,
    default: 3,
  },
  correspondentRounds: {
    type: [CorrespondentRoundSchema],
    default: 3,
  },
});

const TournamentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      default: uuid(),
    },
    name: {
      type: String,
      required: true,
    },
    participants: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
    },
    type: {
      type: String,
      required: true,
    },
    ownerId: {
      type: String,
      required: true,
    },
    currentRound: {
      type: Number,
      required: true,
      default: 0,
    },
    currentPhase: {
      type: String,
      required: false,
    },
    finished: {
      type: Boolean,
      required: true,
      default: false,
    },
    startDate: {
      type: Date,
    },
    drawDate: {
      type: Date,
    },
    awards: [AwardSchema],
    parameters: ParameterSchema,
    teams: {
      type: [TeamSchema],
      required: true,
      default: [],
    },
    matches: {
      type: [],
      required: true,
      default: [],
    },
    matchesPlayoffs: {
      type: [],
      required: false,
      default: null,
    },
    standing: {
      type: [],
      required: true,
      default: [],
    },
    updatedAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      required: true,
      default: () => Date.now(),
    },
  },
  {
    timestamps: true,
  },
);

const schema = mongoose.model<Tournament>('Tournaments', TournamentSchema);

export { schema as TournamentSchema };
