import hashlib
import json

from redis.asyncio import Redis


async def create_cache_key(
    redis: Redis,
    resource: str,
    params: dict,
    version_key: str,
) -> str:

    cache_parameters = json.dumps(
        params,
        sort_keys=True,
        separators=(",", ":"),
    )

    cache_digest = hashlib.sha256(cache_parameters.encode()).hexdigest()

    cache_version = await redis.get(version_key) or "0"

    return f"{resource}:{cache_version}:{cache_digest}"


async def _invalidate_list_cache(redis: Redis, key: str) -> None:
    await redis.incr(key)
