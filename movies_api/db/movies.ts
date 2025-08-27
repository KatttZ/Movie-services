import { Database, OPEN_READONLY } from "sqlite3";

export const moviesDB = new Database('./movies_api/db/movies.db', OPEN_READONLY, (err: Error | null) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Database opened successfully');
  }
});

