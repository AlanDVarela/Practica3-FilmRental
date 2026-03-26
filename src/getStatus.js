const { getDbClient } = require('./utils/db');

exports.handler = async (event) => {
    const userId = event.pathParameters?.user_id;
    if (!userId) return { statusCode: 400, body: JSON.stringify({ error: "user_id es requerido" }) };

    const client = await getDbClient();
    try {
        const query = `
            SELECT r.id as rental_id, m.title, r.rented_at, r.expires_at 
            FROM rentals r 
            JOIN movies m ON r.movie_id = m.movieId 
            WHERE r.user_id = $1 AND r.returned_at IS NULL;
        `;
        const res = await client.query(query, [userId]);
        return { statusCode: 200, body: JSON.stringify(res.rows) };
    } catch (e) {
        return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
    } finally {
        await client.end();
    }
};