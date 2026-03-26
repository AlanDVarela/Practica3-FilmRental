const { getDbClient } = require('../utils/db');

exports.handler = async (event) => {
    const client = await getDbClient();
    const res = await client.query('SELECT COUNT(*) as count FROM rentals WHERE user_id = $1 AND returned_at IS NULL', [event.user_id]);
    await client.end();
    
    if (parseInt(res.rows[0].count) >= 2) throw new Error("User has reached the rental limit");
    return event;
};