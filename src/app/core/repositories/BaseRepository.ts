import { Database } from 'sqlite';
import { ForcefullyOmit, ObjectWithKeys } from '../../types/UtilityTypes';

export type Statement = {
  sql: string;
  params?: unknown[];
};

export class BaseRepository<T extends ObjectWithKeys & { id: number }> {
  protected database: Database;
  protected tableName: string;
  protected booleanFields: string[] = [];

  public constructor(database: Database, tableName: string) {
    this.database = database;
    this.tableName = tableName;
    this.loadBooleanFields();
  }

  private async loadBooleanFields() {
    const result = await this.database.all<{ name: string; type: string }[]>(
      `PRAGMA table_info(${this.tableName});`
    );

    this.booleanFields = result
      .filter((column) => column.type.toUpperCase().includes('BOOLEAN'))
      .map((column) => column.name);
  }

  private convertToDatabaseValue(key: string, value: unknown): 0 | 1 | unknown {
    if (this.booleanFields.includes(key) && typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    return value;
  }

  private databaseValueToJS(key: string, value: unknown): boolean | unknown {
    if (
      this.booleanFields.includes(key) &&
      typeof value === 'number' &&
      (value === 0 || value === 1)
    ) {
      return value === 1;
    }
    return value;
  }

  public async getById(id: number): Promise<T | undefined> {
    const result = await this.database.get<T>(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );

    const booleanFields = {};

    if (result) {
      Object.keys(result).forEach((key) => {
        booleanFields[key] = this.databaseValueToJS(key, result[key]);
      });
    }

    return { ...result, ...booleanFields };
  }

  public async getAll(): Promise<T[]> {
    const results = await this.database.all<T[]>(
      `SELECT * FROM ${this.tableName} ORDER BY id ASC;`
    );

    results.forEach((result) => {
      const booleanFields = {};
      Object.keys(result).forEach((key) => {
        booleanFields[key] = this.databaseValueToJS(key, result[key]);
      });
      result = { ...result, ...booleanFields };
    });

    return results;
  }

  public async delete(id: number): Promise<boolean> {
    await this.database.run(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    return true;
  }

  public async create(data: ForcefullyOmit<T, 'id'>): Promise<T> {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data)
      .map(() => '?')
      .join(', ');

    const values = Object.keys(data).reduce((arr, key) => {
      arr.push(this.convertToDatabaseValue(key, data[key]));
      return arr;
    }, []);

    const result = await this.database.run(
      `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`,
      values
    );

    return { ...data, id: result.lastID || -1 } as T;
  }

  public async update(
    id: number,
    data: ForcefullyOmit<T, 'id'>
  ): Promise<boolean> {
    const setClause = Object.keys(data)
      .map((key) => `${key} = ?`)
      .join(', ');

    const values = Object.keys(data).reduce((arr, key) => {
      arr.push(this.convertToDatabaseValue(key, data[key]));
      return arr;
    }, []);

    await this.database.run(
      `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`,
      [...values, id]
    );

    return true;
  }

  protected async runTransaction<T>(
    transactionFn: () => Promise<T>
  ): Promise<T> {
    try {
      await this.database.run('BEGIN TRANSACTION;');
      const result = await transactionFn(); // Run the passed function inside the transaction
      await this.database.run('COMMIT;');
      return result;
    } catch (error) {
      await this.database.run('ROLLBACK;');
      this.handleError(error);
      throw error; // Rethrow the error after handling it
    }
  }

  private handleError(reason: unknown): never {
    if (reason instanceof Error) {
      throw new Error(`Operation failed - ${reason.message}`, {
        cause: reason,
      });
    }
    throw new Error(`Operation failed - Unknown error: ${String(reason)}`, {
      cause: reason,
    });
  }
}
