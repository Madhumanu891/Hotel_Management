const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { use } = require("react");

const guestProfileSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
    },
    nationality: {
      type: String,
    },
    idType: {
      type: String,
      enum: ["passport", "aadhar", "driving_license", "voter_id"],
    },
    idNumber: {
      type: String,
    },

    dateOfBirth: {
      type: Date,
    },

    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    loyaltyTier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      default: "bronze",
    },

    totalStays: {
      type: Number,
      default: 0,
    },

    totalSpent: {
      type: Number,
      default: 0,
    },

    preferences: {
      roomType: {
        type: String,
      },
      floor: {
        type: String, // 'high', 'low', 'no_preference'
      },
      dietary: {
        type: String, // ['vegetarian', 'vegan', 'halal']
      },
      smoking: {
        type: Boolean,
        default: false,
      },
    },
  },
  { _id: false },
);

// Staff Profile Schema
// Only Populated for staff users

const staffProfileSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String, // e.g. 'EMP-001 assigned by HR
    },
    department: {
      type: String, // "houseKeeping", 'reception', "restaurant"
    },
    designation: {
      type: String, // "senior Receptionist", "Head Chef"
    },

    salary: {
      type: Number, // Monthly Salary
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    emergencyContact: {
      name: {
        type: String,
      },
      phone: {
        type: String,
      },
    },
  },
  { _id: false },
);

// Main User Schema

const userSchema = new mongoose.Schema(
  {
    emai: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    role: {
      type: String,
      enum: [
        "super_admin",
        "hotel_manager",
        "receptionist",
        "housekeeping",
        "restaurant_staff",
        "hr_manager",
        "accountant",
        "guest",
      ],
      default: "guest",
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
    },

    refreshToken: {
      type: String,
      select: false,
    },

    guestProfile: {
      type: guestProfileSchema,
      default: () => ({}),
    },

    staffProfile: {
      type: staffProfileSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  },
);

// Indexes

// Unique index on email

userSchema.index({ email: 1 });

// fast staff lookup by property and role (e.g. find all receptionists for a hotel) used by HR and hotel manager
userSchema.index({ propertyId: 1, role: 1 });

// fast loyality tier queries for guest users (e.g. find all gold members) used by marketing and hotel manager
userSchema.index({ "guestProfile.loyaltyTier": 1 });

// VIRTUALS : isLocked
// A user is considered locked if they have 5 or more failed login attempts and the lockUntil time is in the future
// computed property that is not stored in the database but can be used in application logic
// e.g. if (user.isLocked) { // prevent login and show message about account being locked }

userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now()); // !! converts the expression to a boolean value
});

// PRE-SAVE HOOK: Auto-hash password
// This runs automatically before EVERY .save() call
//
// Important: check isModified() first!
// If we don't check, the already-hashed password gets hashed again.
// "abc" → "$2b$12$..." → "$2b$12$..." (correct password becomes unverifiable)

userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next(); // only hash if passwordHash field is new or changed

  this.passwordHash = await bcrypt.hash(this.passwordHash, 12); // hash with salt rounds = 12
  next();
});

// Instance method to compare password during login
// Usage: user.comparePassword("plaintextPassword")
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash); // returns true if match, false if not
};

// hanleFailedLoginAttempt instance method to increment login attempts and set lockUntil if necessary
userSchema.methods.handleFailedLoginAttempt = async function () {
  this.loginAttempts += 1;

  if (this.loginAttempts >= 5) {
    this.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // lock for 2 hours
    this.loginAttempts = 0; // reset attempts after locking
  }

  // validateBeforeSave: false — skip full schema validation (faster, safer for partial updates)
  await this.save({ validateBeforeSave: false });
};


// resetLoginAttempts instance method to reset attempts and lock status after successful login
userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined; // undefined removes the field from the document
    await this.save({ validateBeforeSave: false });
};


const User = mongoose.model("User", userSchema);

module.exports = User;