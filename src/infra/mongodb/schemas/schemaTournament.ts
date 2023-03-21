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
