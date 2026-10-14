from redis.asyncio import Redis
from core.config import settings

redis_client = Redis.from_url(
    settings.REDIS_URL,
    decode_responses=True,
    protocol=2,
)


def get_redis() -> Redis:
    return redis_client
