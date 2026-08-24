"""TJ Smart Guide backend package."""

# Seed the verified official knowledge layer before the FastAPI lifespan runs.
# The operation is a no-op when DATABASE_URL is not configured.
try:
    from .official_bootstrap import seed_official_articles

    seed_official_articles()
except Exception:
    # Startup must remain resilient if the database is temporarily unavailable.
    pass
