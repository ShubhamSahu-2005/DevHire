import { producer, connectProducer } from "./kafka.js";;

export const TOPICS = {
    APPLICATION_SUBMITTED: "application-submitted",
    APPLICATION_STATUS_UPDATED: "application-status-update",

}

//Intialise producer
export const initProducer = async () => {
    await connectProducer();
}

//Publish Message to a Topic

export const publishMessage = async (topic, message) => {
    try {
        await producer.send({
            topic,
            messages: [
                {
                    value: JSON.stringify(message),
                }
            ]
        })
        console.log(`[KAFKA] Message sent to topic ${topic}`)

    } catch (error) {
        console.log(`[KAFKA] Failed to send message to topic ${topic} - Ignoring for now`)
        // throw error;

    }
}