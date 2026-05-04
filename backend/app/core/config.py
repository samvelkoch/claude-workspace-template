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

    # MS SQL Server (SM database) — пустые = demo mode
    mssql_server: str = ""
    mssql_port: str = "1433"
    mssql_database: str = ""
    mssql_user: str = ""
    mssql_password: str = ""
    mssql_driver: str = "ODBC Driver 18 for SQL Server"
    mssql_tables: str = ""  # comma-separated, e.g. "sm.transactions,sm.clients"

    @property
    def has_db(self) -> bool:
        return bool(self.mssql_server and self.mssql_database and self.mssql_user)

    @property
    def db_tables_list(self) -> list[str]:
        return [t.strip() for t in self.mssql_tables.split(",") if t.strip()]


settings = Settings()
