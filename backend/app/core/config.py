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
    # Cap on each chunk's response. With chunking (see llm_chunk_char_size) a
    # single chunk holds only a few errors, so this stays comfortably out of the
    # way; it is a safety cap, not a target.
    llm_max_output_tokens: int = 4096
    # Number of times to call the model when trying to get a valid JSON
    # response. Each attempt after the first re-prompts the model with a repair
    # hint. Raise it for less deterministic models that often need several tries.
    llm_max_attempts: int = 4
    # The report is split into chunks of at most this many characters (on
    # paragraph boundaries) and each chunk is extracted with its own small call,
    # then the results are merged. This keeps every response short so a big
    # report can't truncate the JSON. As a rule of thumb ~4 chars ≈ 1 token, so
    # 6000 chars ≈ 1500 input tokens per chunk. Set to 0 to disable chunking and
    # send the whole report in a single call.
    llm_chunk_char_size: int = 6000


settings = Settings()
