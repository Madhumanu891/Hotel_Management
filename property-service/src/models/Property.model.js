const mongoose = require("mongoose");

// Image sub-schema
const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: "",
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

// Location sub-schema
const locationSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
      default: "India",
    },
    pincode: {
      type: String,
    },
    // GeoJSON format for location-based queries
    // Allows "find hotels within 10km of this point"
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
  },
  { _id: false },
);

// Policy sub-schema
const policySchema = new mongoose.Schema(
  {
    checkInTime: {
      type: String,
      default: "14:00", // 2PM
    },
    checkOutTime: {
      type: String,
      default: "11:00", // 11AM
    },
    cancellationHours: {
      type: Number,
      default: 24, // Free cancel up to 24h
    },
    cancellationPolicy: {
      type: String,
      enum: ["flexible", "moderate", "strict"],
      default: "moderate",
    },
    petsAllowed: {
      type: Boolean,
      default: false,
    },
    smokingAllowed: {
      type: Boolean,
      default: false,
    },
    extraBedAvailable: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

// Main Property Schema
const propertySchema = new mongoose.Schema(
  {
    // Basic info
    name: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    // URL-friendly version of name
    // "Taj Hotel Mumbai" → "taj-hotel-mumbai"
    // Used in URLs: /properties/taj-hotel-mumbai
    slug: {
      type: String,
      unique: true, // This automatically creates an index
      lowercase: true,
    },

    description: {
      type: String,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    starRating: {
      type: Number,
      required: [true, "Star rating is required"],
      min: [1, "Minimum star rating is 1"],
      max: [5, "Maximum star rating is 5"],
    },

    // Location with GPS coordinates for map display
    location: {
      type: locationSchema,
      required: true,
    },

    // List of available amenities
    amenities: [
      {
        type: String,
        enum: [
          "wifi",
          "pool",
          "gym",
          "spa",
          "parking",
          "restaurant",
          "bar",
          "laundry",
          "conference",
          "airport_shuttle",
          "room_service",
          "concierge",
          "business_center",
          "kids_club",
          "beach_access",
        ],
      },
    ],

    // Photo gallery — stored in Cloudinary
    images: [imageSchema],

    // Contact details
    contactInfo: {
      phone: {
        type: String,
      },
      email: {
        type: String,
        lowercase: true,
      },
      website: {
        type: String,
      },
    },

    // Hotel policies
    policies: {
      type: policySchema,
      default: () => ({}),
    },

    // Is this hotel visible to guests?
    isActive: {
      type: Boolean,
      default: true,
    },

    // Which hotel_manager runs this property
    managedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Average rating from guest reviews (updated when reviews come in)
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Indexes

// Geospatial index — enables "find hotels near me" queries
propertySchema.index({ "location.coordinates": "2dsphere" });

// Text search index — enables full-text search on name and description
propertySchema.index({ name: "text", description: "text" });

// Fast city-based queries (most common search)
propertySchema.index({ "location.city": 1, isActive: 1 });

// Fast manager lookup
propertySchema.index({ managedBy: 1 });

// Pre-save hook: auto-generate slug
// "Taj Hotel Mumbai" → "taj-hotel-mumbai"
// If slug already taken, append timestamp: "taj-hotel-mumbai-1234567890"
propertySchema.pre("save", async function () {
  if (!this.isModified("name")) return;

  // Convert name to slug
  let slug = this.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-")         // Replace spaces with hyphens
    .replace(/-+/g, "-");         // Remove multiple hyphens

  // Check if slug already exists
  const existing = await mongoose.model("Property").findOne({
    slug,
    _id: { $ne: this._id }, // Exclude current doc (for updates)
  });

  if (existing) {
    // Append timestamp to make slug unique
    slug = `${slug}-${Date.now()}`;
  }

  this.slug = slug;
});

// Virtual: primaryImage
// Returns the primary image URL (used in listings and thumbnails)
propertySchema.virtual("primaryImage").get(function () {
  if (!this.images || this.images.length === 0) return null;
  const primary = this.images.find((img) => img.isPrimary);
  return primary ? primary.url : this.images[0].url;
});

// Instance method: getPrimaryImage
propertySchema.methods.getPrimaryImage = function () {
  if (!this.images || this.images.length === 0) return null;
  const primary = this.images.find((img) => img.isPrimary);
  return primary ? primary.url : this.images[0].url;
};

module.exports = mongoose.model("Property", propertySchema);