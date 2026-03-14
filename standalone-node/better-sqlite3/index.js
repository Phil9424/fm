const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js/dist/sql-asm.js");

let sqlModulePromise = null;

function getSqlModule() {
  if (!sqlModulePromise) {
    sqlModulePromise = initSqlJs();
  }
  return sqlModulePromise;
}

function normalizeParams(values) {
  if (values === undefined) {
    return undefined;
  }
  if (Array.isArray(values)) {
    return values;
  }
  if (values && typeof values === "object" && !(values instanceof Uint8Array)) {
    const mapped = {};
    Object.entries(values).forEach(([key, value]) => {
      mapped[key] = value;
      if (!key.startsWith("@") && !key.startsWith(":") && !key.startsWith("$")) {
        mapped[`@${key}`] = value;
        mapped[`:${key}`] = value;
        mapped[`$${key}`] = value;
      }
    });
    return mapped;
  }
  return [values];
}

function looksMutating(sql) {
  return /^\s*(INSERT|UPDATE|DELETE|REPLACE|CREATE|DROP|ALTER|VACUUM|PRAGMA|BEGIN|COMMIT|ROLLBACK)/i.test(sql);
}

class Statement {
  constructor(database, sql) {
    this.database = database;
    this.sql = sql;
  }

  normalizeArgs(args) {
    if (!args.length) {
      return undefined;
    }
    if (args.length === 1) {
      return normalizeParams(args[0]);
    }
    return normalizeParams(args);
  }

  createStatement(args) {
    const stmt = this.database._db.prepare(this.sql);
    const params = this.normalizeArgs(args);
    if (params !== undefined) {
      stmt.bind(params);
    }
    return stmt;
  }

  get(...args) {
    const stmt = this.createStatement(args);
    try {
      if (!stmt.step()) {
        return undefined;
      }
      return stmt.getAsObject();
    } finally {
      stmt.free();
    }
  }

  all(...args) {
    const stmt = this.createStatement(args);
    try {
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      return rows;
    } finally {
      stmt.free();
    }
  }

  run(...args) {
    const params = this.normalizeArgs(args);
    this.database._db.run(this.sql, params);
    if (looksMutating(this.sql) && this.database._transactionDepth === 0) {
      this.database.persist();
    }
    return {
      changes: typeof this.database._db.getRowsModified === "function" ? this.database._db.getRowsModified() : 0,
    };
  }
}

class SqlJsBetterSqlite3 {
  static async open(filename, options = {}) {
    const SQL = await getSqlModule();
    return new SqlJsBetterSqlite3(filename, options, SQL);
  }

  constructor(filename, options = {}, SQL) {
    this.filename = filename;
    this.options = options;
    this.SQL = SQL;
    this._transactionDepth = 0;
    this._isMemory = filename === ":memory:" || options.memory === true;

    if (!this._isMemory && fs.existsSync(filename)) {
      const data = fs.readFileSync(filename);
      this._db = data.length ? new SQL.Database(data) : new SQL.Database();
    } else {
      this._db = new SQL.Database();
    }
  }

  prepare(sql) {
    return new Statement(this, sql);
  }

  exec(sql) {
    this._db.run(sql);
    if (looksMutating(sql) && this._transactionDepth === 0) {
      this.persist();
    }
    return [];
  }

  pragma(value) {
    try {
      this.exec(`PRAGMA ${value}`);
    } catch (_error) {
      // sql.js ignores some file-backed pragmas; the game can continue without them.
    }
    return [];
  }

  transaction(callback) {
    return (...args) => {
      this._db.run("BEGIN");
      this._transactionDepth += 1;
      try {
        const result = callback(...args);
        this._db.run("COMMIT");
        this._transactionDepth = Math.max(0, this._transactionDepth - 1);
        if (this._transactionDepth === 0) {
          this.persist();
        }
        return result;
      } catch (error) {
        try {
          this._db.run("ROLLBACK");
        } catch (_rollbackError) {
          // Ignore secondary rollback failures.
        }
        this._transactionDepth = Math.max(0, this._transactionDepth - 1);
        throw error;
      }
    };
  }

  persist() {
    if (this._isMemory || !this.filename) {
      return;
    }
    fs.mkdirSync(path.dirname(this.filename), { recursive: true });
    fs.writeFileSync(this.filename, Buffer.from(this._db.export()));
  }

  close() {
    this.persist();
    this._db.close();
  }
}

module.exports = SqlJsBetterSqlite3;
