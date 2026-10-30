
import sqlite3
from pathlib import Path

# Database file location:
# SupplyPrescript/backend/database/supplyprescript.db
DATABASE_DIR = Path(__file__).resolve().parent
DATABASE_FILE = DATABASE_DIR / "supplyprescript.db"


def get_connection():
    """Create and return a SQLite database connection."""
    connection = sqlite3.connect(DATABASE_FILE)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def initialize_database():
    """Create the required tables if they do not already exist."""

    DATABASE_DIR.mkdir(parents=True, exist_ok=True)

    with get_connection() as connection:

        # User accounts and registration approvals
        connection.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL COLLATE NOCASE UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user'
                    CHECK (role IN ('admin', 'user')),
                status TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                reviewed_at TEXT,
                reviewed_by INTEGER,
                FOREIGN KEY (reviewed_by) REFERENCES users(id)
            )
        """)

        # Decisions submitted by users for Admin approval
        connection.execute("""
            CREATE TABLE IF NOT EXISTS decisions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                shipment_id TEXT NOT NULL,
                option_id TEXT NOT NULL,
                option_name TEXT NOT NULL,
                cost REAL NOT NULL,
                delay_days REAL NOT NULL,
                penalty REAL NOT NULL,
                penalty_avoided REAL NOT NULL,
                net_benefit REAL NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
                submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                reviewed_at TEXT,
                reviewed_by INTEGER,
                review_note TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (reviewed_by) REFERENCES users(id)
            )
        """)

        # Record important system actions
        connection.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                actor_user_id INTEGER,
                action TEXT NOT NULL,
                entity_type TEXT NOT NULL,
                entity_id TEXT,
                details TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (actor_user_id) REFERENCES users(id)
            )
        """)

        connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_users_status
            ON users(status)
        """)

        connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_decisions_status
            ON decisions(status)
        """)

        connection.execute("""
            CREATE INDEX IF NOT EXISTS idx_decisions_user
            ON decisions(user_id)
        """)

    return True
