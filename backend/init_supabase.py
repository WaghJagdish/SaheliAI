import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv(".env.local")
db_url = os.getenv("DATABASE_URL")

async def init_db():
    print(f"Connecting to database at: {db_url}")
    # Replace asyncpg scheme with regular for the raw text wrapper, but SQLAlchemy handles it normally
    engine = create_async_engine(db_url, echo=True)
    
    try:
        async with engine.begin() as conn:
            print("Connected successfully! Checking if tables exist...")
            
            # Run schema
            print("Running schema.sql...")
            with open("../database/schema.sql", "r") as f:
                schema_sql = f.read()
            # Execute multiple statements
            await conn.execute(text(schema_sql))
            
            # Run demo seed data
            print("Running seed_demo.sql...")
            with open("../database/seed_demo.sql", "r", encoding="utf-8") as f:
                seed_sql = f.read()
            await conn.execute(text(seed_sql))
            
            print("Database setup complete!")
    except Exception as e:
        print(f"FAILED TO CONNECT OR EXECUTE: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_db())
