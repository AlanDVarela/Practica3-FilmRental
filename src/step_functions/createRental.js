const { getDbClient } = require('../utils/db');

exports.handler = async (event) => {
    const client = await getDbClient();
    const query = `INSERT INTO rentals (movie_id, user_id) VALUES ($1, $2) RETURNING id, rented_at, expires_at`;
    const res = await client.query(query, [event.movie_id, event.user_id]);
    await client.end();
    
    return { status: "SUCCESS", rental_id: res.rows[0].id };
};