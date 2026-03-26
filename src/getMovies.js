const { getDbClient } = require('./utils/db');

exports.handler = async (event) => {
    const name = event.queryStringParameters?.name || "";
    const client = await getDbClient();
    
    try {
        const query = `
            SELECT m.movieId as movie_id, m.title, 
                   CASE WHEN r.id IS NOT NULL THEN true ELSE false END as is_rented
            FROM movies m
            LEFT JOIN rentals r ON m.movieId = r.movie_id AND r.returned_at IS NULL
            WHERE m.title ILIKE $1
            LIMIT 50;
        `;
        const res = await client.query(query, [`%${name}%`]);
        return { statusCode: 200, body: JSON.stringify(res.rows) };
    } catch (e) {
        return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
    } finally {
        await client.end();
    }
};