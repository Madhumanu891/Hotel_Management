const mongoose=require("mongoose")
const logger =require("../utils/logger")

let retryCount = 0
const MAX_RETRIES = 5
const RETRY_DELAY=5000

const connectDB= async()=>{
    const MONGO_URI = process.env.MONGO_URI

    if(!MONGO_URI){
        logger.error("MONGO_URI is not defined in environment variables")
            process.exit(1);
    }

    try {
        
        const conn=await mongoose.connect(MONGO_URI, {
            maxPoolSize:10,

            serverSelectionTimeoutMS:5000,

            socketTimeoutMS:45000,
        })

        retryCount=0

        logger.info("MongoDB connected successfully", {
            host : conn.connection.host,
            database:conn.connection.name,
            port: conn.connection.port
        })


    } catch (error) {
        retryCount++

        logger.error("MongoDb connection failed",{
            error:error.message,
            attempt: retryCount,
            maxRetries:MAX_RETRIES
        })

        // Wait before retrying
        if(retryCount>=MAX_RETRIES){
            logger.error("Max retries reached. Stopping service.")
            process.exit(1)
        }

        // Wait and retry
        logger.info(`Retrying MongoDB connection in ${RETRY_DELAY/1000} seconds...`)
        setTimeout(connectDB, RETRY_DELAY)
    }
}

// handle MongoDB connection events
mongoose.connection.on("disconnected",()=>{
    logger.warn("MongoDB disconnected. Attempting to reconnect...")
    setTimeout(connectDB, RETRY_DELAY)
})

mongoose.connection.on("error", (err)=>{
    logger.error("MongoDB error", { error: err.message })
})

module.exports=connectDB