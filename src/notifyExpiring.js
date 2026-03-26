const { getDbClient } = require('./utils/db');
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const sns = new SNSClient({ region: "us-east-1" });
const TOPIC_ARN = "arn:aws:sns:us-east-1:idusuario:rentals-expiring-soon";

exports.handler = async (event) => {
    const db = await getDbClient();
    const query = `
        SELECT r.user_id, m.title, r.expires_at 
        FROM rentals r JOIN movies m ON r.movie_id = m.movieId
        WHERE r.returned_at IS NULL 
        AND r.expires_at BETWEEN NOW() AND NOW() + INTERVAL '3 days'
    `;
    const res = await db.query(query);

    for (const rental of res.rows) {
        const dias = Math.ceil((new Date(rental.expires_at) - new Date()) / (1000 * 60 * 60 * 24));
        
        await sns.send(new PublishCommand({
            TopicArn: TOPIC_ARN,
            Message: `Tu renta de la película "${rental.title}" vence en ${dias} días.`,
            MessageAttributes: {
                "user_id": { DataType: "String", StringValue: rental.user_id.toString() }
            }
        }));
    }
    await db.end();
    return { notified: res.rowCount };
};