import mongoose from "mongoose";
import { enums } from "../config/enums.js";

const { Schema } = mongoose;

const CampaignSchema = new Schema({
  pk: {
    type: String,
    required: true,
    index: true,
  },
  sk: {
    type: String,
    required: true,
  },
  campaignId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  owner: {
    type: String,
    required: true,
    index: true,
  },
  handler: {
    type: String,
    required: true,
    index: true,
  },
  profile: {
    id: String,
    owner: String,
    handler: String,
    image: String,
    contentUri: String,
  },
  contentUri: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    index: true,
    enum: enums.CAMPAIGN_STATUS_MONGODB,
  },
  image: {
    type: String,
  },
  featured: {
    type: Boolean,
    default: false,
    index: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point", "LineString", "Polygon"],
      required: true,
    },
    coordinates: {
      type: [],
      required: true,
    },
  },
  createdAt: {
    type: Date,
    required: true,
    index: true,
  },
  updatedAt: {
    type: Date,
    required: true,
    index: true,
  },
});

CampaignSchema.index({ location: "location" });

export const CampaignMongoDBModel = mongoose.model("campaigns", CampaignSchema);
