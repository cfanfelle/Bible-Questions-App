import { DatabaseSync } from 'node:sqlite';

/** Small compatibility wrapper around Node/Electron's built-in SQLite engine. */
export default class Database extends DatabaseSync {
  pragma(statement: string) { this.exec(`PRAGMA ${statement}`); }
  transaction<T extends unknown[], R>(operation: (...args: T) => R) {
    return (...args: T): R => {
      this.exec('BEGIN IMMEDIATE');
      try {
        const result = operation(...args);
        this.exec('COMMIT');
        return result;
      } catch (error) {
        this.exec('ROLLBACK');
        throw error;
      }
    };
  }
}
