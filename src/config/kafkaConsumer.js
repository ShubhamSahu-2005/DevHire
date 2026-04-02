import { consumer, connectConsumer } from "./kafka.js";
import { TOPICS } from "./kafkaProducer.js";
import { sendEmail } from "../utils/email.js";
import db from "./db.js";
import { users } from "./schema.js";
import { eq } from "drizzle-orm";

export const initConsumer = async () => {
    await connectConsumer();
    //Subscribe to Topics
    await consumer.subscribe({
        topics: [
            TOPICS.APPLICATION_SUBMITTED,
            TOPICS.APPLICATION_STATUS_UPDATED,
        ],
        fromBeginning: false
    });

    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            try {
                const data = JSON.parse(message.value.toString());
                console.log(`[KAFKA] Received message on topic ${topic}`);
                if (topic === TOPICS.APPLICATION_SUBMITTED) {
                    const { companyId, developerName, jobTitle } = data;
                    const [company] = await db.select().from(users).where(eq(users.id, companyId));
                    if (company) {
                        await sendEmail({
                            to: company.email,
                            subject: `New Application -${jobTitle}`,
                            html: `
                            <h2>New Application Recieved</h2>
                            <p><strong>${developerName}</strong> has applied for <strong> ${jobTitle}</strong>.</p>
                            <p>Login to DevHire to review their application</p>
                            
                            `,

                        })
                    }
                }
                //handle Status Update
                if (topic === TOPICS.APPLICATION_STATUS_UPDATED) {
                    const { developerId, jobTitle, status, companyName } = data;
                    //Get Dev email
                    const [developer] = await db.select().from(users).where(eq(users.id, developerId));
                    if (developer) {
                        const isAccepted = status === "Accepted";
                        await sendEmail({
                            to: developer.email,
                            subject: `Application ${isAccepted ? "Accepted" : "Rejected"}--${jobTitle}`,
                            html: `
              <h2>Application Update</h2>
              <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been <strong>${status}</strong>.</p>
              ${isAccepted
                                    ? "<p>Congratulations! The company will reach out to you soon.</p>"
                                    : "<p>Keep applying — the right opportunity is out there!</p>"
                                }
            `,

                        })
                    }
                }



            } catch (error) {
                console.log("[Kafka] Error processing Message", err)

            }
        }

    })
    console.log("[KAFKA] Consumer Running And Listening For Messages")

}

