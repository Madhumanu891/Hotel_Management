const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: [true, "Property ID is required"],
      index: true, // Add index for faster queries
    },

    roomTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomType",
      required: [true, "Room ID is required"],
      index: true,
    },

    // Room number — unique within a property
    // e.g. "101", "202", "P1" (penthouse 1)
    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
      trim: true,
    },

    floor: {
      type: Number,
      default: 1,
    },

    //Current operational status
    status: {
      type: String,
      enum: ["available", "occupied", "maintenance", "out_of_service"],
      default: "available",
    },

    // Note explaining maintenance/out_of_service status
    maintenanceNote: {
      type: String,
    },

    // When was this room last cleaned?
    lastCleaned: {
      type: Date,
    },

    // Special features of this specific room
    // e.g. sea_view, garden_view, corner_room, connecting_room
    features: [{ type: String }],
  },
  { timestamps: true },
);

// Compound index to ensure unique room numbers within a property
roomSchema.index({ propertyId: 1, roomNumber: 1 }, { unique: true }); // Ensure a room number is unique within the same property
roomSchema.index({ propertyId: 1, status: 1 }); // Index for querying rooms by property and status
roomSchema.index({ roomTypeId: 1, status: 1 }); // Index for querying rooms by room type and status

module.exports = mongoose.model("Room", roomSchema);
