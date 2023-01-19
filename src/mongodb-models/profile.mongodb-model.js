import mongoose from "mongoose";
import { enums } from "../config/enums.js";

const { Schema } = mongoose;

const ProfileSchema = new Schema({
  pk: {
    type: String,
    required: true,
    index: true,
  },
  sk: {
    type: String,
    required: true,
  },
  profileId: {
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
  contentUri: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    index: true,
    enum: enums.PROFILE_STATUS_MONGODB,
  },
  image: {
    type: String,
  },
  bio: {
    type: String,
    maxlength: 160,
  },
  featured: {
    type: Boolean,
    default: false,
    index: true,
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

export const ProfileMongoDBModel = mongoose.model("profiles", ProfileSchema);
