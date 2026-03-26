const { getDbClient } = require('../utils/db');

exports.handler = async (event) => {
    const client = await getDbClient();
    const res = await client.query('SELECT 1 FROM movies WHERE movieId = $1', [event.movie_id]);
    await client.end();
    
    if (res.rowCount === 0) throw new Error("Movie is not available"); 
    return event; 
};