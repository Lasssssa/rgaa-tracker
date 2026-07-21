from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://postgres:postgres@db:5432/rgaa_tracker"

    # LLM used to extract errors from an uploaded audit PDF. The default
    # targets a self-hosted vLLM server, which exposes an OpenAI-compatible
    # API — so the OpenAI SDK is used as the client for it.
    vllm_base_url: str = "http://localhost:8000/v1"
    vllm_model: str = ""
    # vLLM ignores the key by default but the OpenAI client requires a
    # non-empty value.
    vllm_api_key: str = "EMPTY"
    # Set to true only if the vLLM server supports guided/structured JSON
    # (response_format json_schema). When false, we fall back to json_object
    # mode plus strict validation and one repair retry.
    llm_guided_json: bool = False
    # Cap on the extraction response. Kept modest so worst-case generation stays
    # short; a very large report with many errors could exceed it and truncate
    # the JSON — raise it (or add chunking) if so.
    llm_max_output_tokens: int = 4096


settings = Settings()
