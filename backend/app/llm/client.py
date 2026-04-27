import httpx
from openai import AsyncOpenAI
from app.core.config import settings

_client: AsyncOpenAI | None = None


def get_llm_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(
            base_url=settings.llm_base_url,
            api_key=settings.llm_api_key,
            timeout=settings.llm_timeout,
            http_client=httpx.AsyncClient(trust_env=settings.llm_trust_env),
        )
    return _client
