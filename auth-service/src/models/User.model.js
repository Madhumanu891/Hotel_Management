const mongoose=require("mongoose")
const bcrypt= require("bcryptjs")

const guestProfileSchema = new mongoose.Schema({
    phone:{
        type: String,
    },
     nationality:{
        type: String,
    },
    idType : {
        type : String,
        enum : ['passport', 'aadhar', 'driving_license', 'voter_id']
    },
    idNumber : {
        type : String
    },
    
    dateOfBirth : {
        type : Date,
    },

    loyaltyPoints : {
        type : Number,
        default : 0
    },
    loyaltyTier : {
        type : String,
        enum : ['bronze', 'silver', 'gold', 'platinum'],
        default : 'bronze'
    },


    totalStays : {
        type : Number,
        default : 0
    },

    totalSpent : {
        type : Number,
        default : 0
    },

    preferences : {
        roomType : {
            type : String,
        },
        floor : {
            type : String,     // 'high', 'low', 'no_preference'
        },
        dietary : {
            type : String,          // ['vegetarian', 'vegan', 'halal']
        },
        smoking : {
            type : Boolean,
            default : false
        },
    }
},{_id: false})


// Staff Profile Schema
// Only Populated for staff users

const staffProfileSchema = new mongoose.Schema({

    employeeId : {
        type : String,     // e.g. 'EMP-001 assigned by HR
     },
     department : {
        type : String,    // "houseKeeping", 'reception', "restaurant"
     },
     designation : {
        type : String,   // "senior Receptionist", "Head Chef"
     },

     salary : {
        type : Number,  // Monthly Salary
     },

     joiningDate : {
        type : Date,
        default : Date.now
     },

     emergencyContact : {
        name : {
            type : String,
        },
        phone : {
            type : String,
        },
     },
},{_id: false})


// Main User Schema

const userSchema = new mongoose.Schema(
    {
        emai: {
            type : String,
            required : [true, "Email is required"],
            unique : true,
            lowercase : true,
            trim : true,
            match : [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
        },

        passwordHash : {
            type :String,
            required :  [true, "Password is required"],
            select : false,
        },

        role : {
            type : String,
            enum : [
                'super_admin',
                'hotel_manager',
                'receptionist',
                'housekeeping',
                'restaurant_staff',
                'hr_manager',
                'accountant',
                'guest'
            ],
            default : 'guest'
        },
        propertyId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Property',
            default : null
        },
    }
)