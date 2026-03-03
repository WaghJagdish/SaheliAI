import asyncio
import asyncpg

db_url = "postgresql://postgres:Jagdish%402006@localhost:5432/saheli_ai"

async def check_db():
    print(f"Connecting to {db_url}...")
    try:
        conn = await asyncpg.connect(db_url)
        print("Connected! Re-running schema and seed...")
        
        with open("../database/schema.sql", "r", encoding="utf-8") as f:
            schema_sql = f.read()
        await conn.execute(schema_sql)
        print("Schema loaded!")
        
        with open("../database/seed_demo.sql", "r", encoding="utf-8") as f:
            seed_sql = f.read()
        await conn.execute(seed_sql)
        print("Seed data loaded!")
        
        print("DONE RUNNING BOTH FILES!")
    except Exception as e:
        print(f"ERROR OCCURRED: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(check_db())
