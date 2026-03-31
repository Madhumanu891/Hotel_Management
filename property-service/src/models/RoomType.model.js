const mongoose = require("mongoose");

const roomTypeSchema = new mongoose.Schema({
  // Which hotel this room type belongs to
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: [true, "Property ID is required"],
    index: true,
  },

  name: {
    type: String,
    required: [true, "Room type is required"],
    trim: true,

    //e.g. "Standard Room", "Deluxe Room", "Junior Suite", "Presidential Suite"
  },

  //Bse price per night in INR
  basePrice: {
    type: Number,
    required: [true, "Base price is required"],
    min: [0, "Base price cannot be negative"],
  },

  //   Weekend price multiplier
  // e.g. 1.25 means 25% more expensive on weekends
  weekendMultiplier: {
    type: Number,
    default: 1.0,
    min: [1.0, "Weekend price multiplier cannot be less than 1.0"],
    max: [3.0, "Weekend price multiplier cannot be more than 3.0"],
  },

  //   Maximum guests allowed
  maxOccupancy: {
    type: Number,
    required: [true, "Max occupancy is required"],
    min: [1, "Max occupancy must be at least 1"],
  },

  // Bed configuration description
  // e.g. "1 King Bed", "2 Queen Beds", "3 Single Beds"
  bedConfiguration:{
    type:String,
  },

//   Room size in square feet
size:{
  type: Number,
  min:[0,'Size cannot be negative'],
},

// Room - specific amenities
amenites:[{type:String}],

// Photo gallery for this room type
images:[{
  url: {
    type: String,
    required: true,
  },
  publicId:{
    type:String,
    publicId:true
  }
}],

// Is this room type currently bookable?
isActive:{
  type:Boolean,
  default:true,
},
},{timestamps:true});


// Indexes
roomTypeSchema.index({propertyId:1, isActive:1})
roomTypeSchema.index({propertyId:1, basePrice:1})


// Instance method: calculate price for specific date
// Weekends (sat + Sun) cost more due to the weekendMultiplier
roomTypeSchema.methods.getPriceForDate= function(date){
  const d= new Date(date)
  const day=d.getDay()
  const isWeekend=day===0 || day ===6
  return isWeekend
  ? Math.round(this.basePrice* this.weekendMultiplier)
  : this.basePrice;
}

// Instance method: calculate total price for date range
roomTypeSchema.methods.calculateTotalPrice=function(checkIn, checkOut){
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const nights=Math.ceil((end-start)/(1000*60*60*24))

  let total=0
  for(let i=0; i<nights; i++){
    const date=new Date(start)
    date.setDate(date.getDate()+i)
    total+=this.getPriceForDate(date)
  }

  const taxAmount= Math.round(total*0.18) // Assuming 18% tax
  const totalAmount=total+taxAmount

  return {
    nights,
    basePrice: total,
    taxAmount,
    totalAmount,
    currency:'INR'
  }
}


module.exports=mongoose.model('RoomType', roomTypeSchema)
