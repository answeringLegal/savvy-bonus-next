// Desc: This file initializes the database and creates the tables if they don't exist
import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'bonusblast.db');
const db = new sqlite3.Database(
  dbPath,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the bonusblast database.');
  }
);

export const initDb = () => {
  db.serialize(() => {
    db.run(
      'CREATE TABLE IF NOT EXISTS general_settings (name TEXT PRIMARY KEY, value TEXT, description TEXT, data_type TEXT)'
    );

    // insert default settings
    db.run(
      'INSERT OR IGNORE INTO general_settings (name, value, description, data_type) VALUES ("Deal Value", "100", "The value of each deal", "number")'
    );
    // default theme
    db.run(
      'INSERT OR IGNORE INTO general_settings (name, value, description, data_type) VALUES ("Theme", "default", "The theme of the app", "string")'
    );

    db.run(
      'CREATE TABLE IF NOT EXISTS user_profiles (id INTEGER PRIMARY KEY, first_name TEXT, last_name TEXT, hs_id TEXT, avatar TEXT, nickname TEXT, song TEXT)'
    );
    db.run(
      'CREATE TABLE IF NOT EXISTS bonus_splits (id INTEGER PRIMARY KEY, place INTEGER NOT NULL UNIQUE, percentage REAL)'
    );
    // insert default splits places 1-8 for 100% of the pot
    db.run(
      'INSERT OR IGNORE INTO bonus_splits (place, percentage) VALUES (1, 0.3)'
    );
    db.run(
      'INSERT OR IGNORE INTO bonus_splits (place, percentage) VALUES (2, 0.2)'
    );
    db.run(
      'INSERT OR IGNORE INTO bonus_splits (place, percentage) VALUES (3, 0.15)'
    );
    db.run(
      'INSERT OR IGNORE INTO bonus_splits (place, percentage) VALUES (4, 0.1)'
    );
    db.run(
      'INSERT OR IGNORE INTO bonus_splits (place, percentage) VALUES (5, 0.08)'
    );
    db.run(
      'INSERT OR IGNORE INTO bonus_splits (place, percentage) VALUES (6, 0.07)'
    );
    db.run(
      'INSERT OR IGNORE INTO bonus_splits (place, percentage) VALUES (7, 0.05)'
    );
    db.run(
      'INSERT OR IGNORE INTO bonus_splits (place, percentage) VALUES (8, 0.05)'
    );
  });
};

initDb();
