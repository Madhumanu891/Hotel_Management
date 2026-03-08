const {connect} = require("../../../shared/events/rabbitmq")
const logger = require("../utils/logger")

const connectRabbitMQ = async ()=>{
     try {
        await connect()
        logger.info("RabbitMQ ready for auth service")

     } catch (error) {
        logger.error("RabbitMQ connection failed in auth service", {
            error: error.message
        })

        // don't crash the service, just log the error and continue
     }
}

module.exports = connectRabbitMQ