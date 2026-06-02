"""
database.py — SQLite persistence layer for MAB Pirates.
"""

import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Optional

DB_PATH = Path(__file__).parent.parent / "pirates.db"


def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def create_tables():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS uploads (
            id TEXT PRIMARY KEY,
            student_name TEXT NOT NULL,
            student_id TEXT NOT NULL,
            filename TEXT NOT NULL,
            filepath TEXT NOT NULL,
            file_hash TEXT NOT NULL,
            quest TEXT,
            uploaded_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS runs (
            id TEXT PRIMARY KEY,
            upload_id TEXT NOT NULL,
            student_name TEXT NOT NULL,
            student_id TEXT NOT NULL,
            total_gold REAL NOT NULL,
            regret REAL,
            choices TEXT,
            rewards TEXT,
            status TEXT NOT NULL,
            error_msg TEXT,
            ran_at TEXT NOT NULL,
            FOREIGN KEY (upload_id) REFERENCES uploads(id)
        );
    """)
    conn.commit()
    conn.close()


def save_upload(upload_id, student_name, student_id, filename, filepath, file_hash, quest=None):
    conn = get_db()
    conn.execute(
        """INSERT INTO uploads (id, student_name, student_id, filename, filepath, file_hash, quest, uploaded_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (upload_id, student_name, student_id, filename, filepath, file_hash, quest, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()
    return upload_id


def save_run_result(run_id, upload_id, student_name, student_id, total_gold, regret,
                    choices, rewards, status, error_msg):
    conn = get_db()
    conn.execute(
        """INSERT OR REPLACE INTO runs
           (id, upload_id, student_name, student_id, total_gold, regret, choices, rewards, status, error_msg, ran_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            run_id, upload_id, student_name, student_id, total_gold, regret,
            json.dumps(choices), json.dumps(rewards),
            status, error_msg, datetime.utcnow().isoformat()
        ),
    )
    conn.commit()
    conn.close()


def get_leaderboard():
    """Best run per student, ranked by total_gold and earliest submission."""
    conn = get_db()
    rows = conn.execute("""
        SELECT student_name, student_id,
               MAX(total_gold) as best_gold,
               MIN(regret) as best_regret,
               COUNT(*) as total_runs,
               MAX(ran_at) as last_run,
               MIN(ran_at) as first_success
        FROM runs
        WHERE status = 'success'
        GROUP BY student_id
        ORDER BY best_gold DESC, first_success ASC
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_student_runs(student_id: str):
    conn = get_db()
    rows = conn.execute("""
        SELECT r.id, r.upload_id, r.total_gold, r.regret,
               r.status, r.error_msg, r.ran_at, u.filename
        FROM runs r
        JOIN uploads u ON r.upload_id = u.id
        WHERE r.student_id = ?
        ORDER BY r.ran_at DESC
    """, (student_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_student_uploads(student_id: str):
    conn = get_db()
    rows = conn.execute("""
        SELECT id, filename, file_hash, uploaded_at FROM uploads
        WHERE student_id = ?
        ORDER BY uploaded_at DESC
    """, (student_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_run_details(run_id: str):
    conn = get_db()
    row = conn.execute("SELECT * FROM runs WHERE id = ?", (run_id,)).fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d["choices"] = json.loads(d["choices"] or "[]")
    d["rewards"] = json.loads(d["rewards"] or "[]")
    return d


def get_run_by_upload(upload_id: str):
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM runs WHERE upload_id = ? ORDER BY ran_at DESC LIMIT 1",
        (upload_id,)
    ).fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d["choices"] = json.loads(d["choices"] or "[]")
    d["rewards"] = json.loads(d["rewards"] or "[]")
    return d


def get_all_uploads_for_mentor():
    conn = get_db()
    rows = conn.execute("""
        SELECT u.id, u.student_name, u.student_id, u.filename, u.uploaded_at,
               r.total_gold, r.regret, r.status, r.ran_at
        FROM uploads u
        LEFT JOIN runs r ON r.upload_id = u.id
        ORDER BY u.uploaded_at DESC
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_upload_by_id(upload_id: str):
    conn = get_db()
    row = conn.execute("SELECT * FROM uploads WHERE id = ?", (upload_id,)).fetchone()
    conn.close()
    return dict(row) if row else None
