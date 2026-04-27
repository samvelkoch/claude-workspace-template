from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)

    llm_base_url: str
    llm_api_key: str
    llm_model: str = "Qwen/Qwen3.5-122B-A10B-GPTQ-Int4"
    llm_timeout: int = 120
    llm_trust_env: bool = False
    t2d_public_url: str = "http://localhost:8000"
    sessions_path: str = "/tmp/t2d_br_sessions.json"
    charts_dir: str = "/tmp/t2d_br_charts"


settings = Settings()
