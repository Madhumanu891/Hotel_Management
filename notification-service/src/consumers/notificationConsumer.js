const {consumeEvents} = require('../../../shared/events/rabbitmq')
const {sendWelcomeEmail, sendPasswordResetEmail} = require('../services/emailService')
const logger = require('../utils/logger')

// Event handlers
// Each function recieves the event data published by auth-service


const handleUserRegistered = async(data)=>{
    logger.info('Processing user.registered event',{email:data.email})

    await sendWelcomeEmail({
        email:data.email,
        name: data.name || 'Guest',
    })

    logger.info('Welcome email sent',{email: data.email})
}


const handlePasswordReset= async(data)=>{
    logger.info('Processing user.passwordReset event', {email:data.email})

    await sendPasswordResetEmail({
        email: data.email,
        resetURL:data.resetURL,
    })

    logger.info('Password reset email sent',{email: data.email})
}


// startConsumers
// Called once when notification service starts
// Subscribes to all relevant events
const startConsumers = async()=>{
    await consumeEvents(
        'notification_queue',
        ['user.registered','user.passwordReset'],
        {
            'user.registered':handleUserRegistered,
            'user.passwordReset': handlePasswordReset,
        }
    )

    logger.info('Notification consumers started',{
        queue: 'notification_queue',
        events: ['user.registered', 'user.passwordReset'],
    })
}


module.exports={startConsumers}