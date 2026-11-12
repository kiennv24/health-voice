"""
Pydantic schemas cho HealthVoice TTS Microservice
"""
from pydantic import BaseModel, Field
from typing import Optional, List


class SynthesizeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=50000, description="Văn bản cần tổng hợp giọng nói đầy đủ 100%")
    voice: str = Field(default="banmai", description="Mã giọng đọc: banmai, thuminh, leminh, giahuy, myan, minhquang")
    speed: float = Field(default=0.0, ge=-3.0, le=3.0, description="Tốc độ đọc: -3 (chậm nhất) đến +3 (nhanh nhất)")
    api_key: Optional[str] = Field(default=None, description="FPT.AI API Key tùy chỉnh")
    normalize: bool = Field(default=True, description="Có chuẩn hóa văn bản y tế trước khi tổng hợp không")


class SynthesizeResponse(BaseModel):
    success: bool
    audio_url: str
    normalized_text: str
    original_text: str
    voice: str
    latency_ms: int
    file_size_bytes: int
    duration_seconds: float
    engine: str  # "fpt_ai" hoặc "edge_neural"
    is_cached: bool = False


class LexiconEntry(BaseModel):
    raw_term: str
    phonetic_replacement: str
    category: str = "THUAT_NGU"


class LexiconReloadRequest(BaseModel):
    entries: List[LexiconEntry]


class LexiconReloadResponse(BaseModel):
    success: bool
    loaded_count: int
    message: str


class HealthResponse(BaseModel):
    status: str
    version: str
    tts_engine: str
    fpt_ai_available: bool
    edge_tts_available: bool

