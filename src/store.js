import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
export class Store {
  constructor(directory) {
    mkdirSync(directory, { recursive: true }); this.directory = directory;
    this.db = new DatabaseSync(path.join(directory, 'acta.sqlite'));
    this.db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA foreign_keys=ON;');
    this.db.exec('CREATE TABLE IF NOT EXISTS cases (id TEXT PRIMARY KEY, body TEXT NOT NULL); CREATE TABLE IF NOT EXISTS records (id TEXT PRIMARY KEY, case_id TEXT NOT NULL REFERENCES cases(id), request_id TEXT NOT NULL UNIQUE, request_hash TEXT NOT NULL, body TEXT NOT NULL);');
  }
  get(id) { const row = this.db.prepare('SELECT body FROM cases WHERE id=?').get(id); return row ? JSON.parse(row.body) : null; }
  list() { return this.db.prepare('SELECT body FROM cases ORDER BY rowid DESC').all().map(r => JSON.parse(r.body)); }
  put(c) { this.db.prepare('INSERT INTO cases VALUES (?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body').run(c.id, JSON.stringify(c)); return c; }
  records(id) { return this.db.prepare('SELECT body FROM records WHERE case_id=? ORDER BY rowid').all(id).map(r => JSON.parse(r.body)); }
  retry(id) { return this.db.prepare('SELECT request_hash, body FROM records WHERE request_id=?').get(id); }
  save(c, record, requestId, requestHash) {
    this.db.exec('BEGIN IMMEDIATE');
    try { this.db.prepare('INSERT INTO records VALUES (?,?,?,?,?)').run(record.recordId, c.id, requestId, requestHash, JSON.stringify(record)); this.put(c); this.db.exec('COMMIT'); }
    catch (e) { this.db.exec('ROLLBACK'); throw e; }
  }
  close() { this.db.close(); }
}
