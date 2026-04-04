import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId: "devhire",
    brokers: [process.env.KAFKA_BROKER],
    retry: {
        initialRetryTime: 3000,
        retries: 15
    }
})
export const producer = kafka.producer();
export const consumer = kafka.consumer({
    groupId: "devhire-group"
});

export const connectProducer = async () => {
    await producer.connect();
    console.log("[KAFKA] Producer Connected");

}
export const connectConsumer = async () => {
    await consumer.connect();
    console.log("[KAFKA] Consumer Connected");

}
export default kafka;