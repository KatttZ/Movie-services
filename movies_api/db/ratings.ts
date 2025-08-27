import { Database, OPEN_READONLY } from "sqlite3";

export const ratingsDB = new Database('./movies_api/db/ratings.db', OPEN_READONLY, (err: Error | null) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Database opened successfully');
    }
});
