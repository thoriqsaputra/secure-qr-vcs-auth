import glob
import os

from sqlalchemy import text

from database import engine


def run_migrations():
    migrations = sorted(glob.glob(os.path.join(os.path.dirname(__file__), "migrations", "*.sql")))
    if not migrations:
        print("No migrations found.")
        return

    with engine.begin() as conn:
        for path in migrations:
            print(f"Applying migration: {os.path.basename(path)}")
            sql = open(path, "r", encoding="utf-8").read()
            conn.execute(text(sql))
    print("Migrations complete.")


if __name__ == "__main__":
    run_migrations()
