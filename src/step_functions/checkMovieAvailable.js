const { getDbClient } = require('../utils/db');

exports.handler = async (event) => {
    const client = await getDbClient();
    const res = await client.query('SELECT 1 FROM rentals WHERE movie_id = $1 AND returned_at IS NULL', [event.movie_id]);
    await client.end();
    
    if (res.rowCount > 0) throw new Error("Movie is not available");
    return event;
};