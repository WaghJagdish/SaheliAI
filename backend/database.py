"""
database.py — Async SQLAlchemy setup with session management.
Skips DB engine creation when DEMO_MODE=true so the backend
starts cleanly without PostgreSQL.
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from config import settings


class Base(DeclarativeBase):
    pass


if settings.DEMO_MODE:
    # No database needed in demo mode — routers use hardcoded seed data
    engine = None
    AsyncSessionLocal = None

    async def get_db():  # type: ignore[misc]
        yield None  # Routes check DEMO_MODE before using the session

    async def init_db():
        pass  # No-op in demo mode

else:
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
    )

    AsyncSessionLocal = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
        autocommit=False,
    )

    async def get_db() -> AsyncSession:  # type: ignore[misc]
        async with AsyncSessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    async def init_db():
        """Create all tables (only used in development; production uses schema.sql)."""
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

