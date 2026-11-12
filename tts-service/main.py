"""
main.py — HealthVoice TTS Microservice (FastAPI)
Cổng: 8000
Tích hợp: FPT.AI TTS v5 + Microsoft Edge Neural TTS
Bộ chuẩn hóa văn bản y tế chuyên biệt cho tiếng Việt
"""
import hashlib
import os
import time
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from models import (
    SynthesizeRequest,
    SynthesizeResponse,
    LexiconReloadRequest,
    LexiconReloadResponse,
    HealthResponse,
)
from medical_normalizer import normalize_medical_text, reload_lexicon
from fpt_tts_client import synthesize_audio, AUDIO_STORAGE_DIR

# ============================================================================
# Khởi tạo ứng dụng FastAPI
# ============================================================================
app = FastAPI(
    title="HealthVoice TTS Microservice",
    description="Python FastAPI TTS Service tích hợp FPT.AI + Edge Neural cho hệ thống tư vấn sức khỏe",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — cho phép Spring Boot backend và React frontend giao tiếp
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # React Vite dev
        "http://localhost:8080",   # Spring Boot
        "http://localhost:3000",
        "*",                       # Docker/production sẽ được cấu hình riêng
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Phục vụ file MP3 đã tổng hợp qua HTTP static
app.mount("/audio", StaticFiles(directory=str(AUDIO_STORAGE_DIR)), name="audio")


# ============================================================================
# Endpoints
# ============================================================================

@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Kiểm tra trạng thái dịch vụ TTS."""
    try:
        import edge_tts as _et
        edge_ok = True
    except ImportError:
        edge_ok = False

    return HealthResponse(
        status="UP",
        version="2.0.0",
        tts_engine="FPT.AI + Edge Neural Fallback",
        fpt_ai_available=True,
        edge_tts_available=edge_ok,
    )


@app.post("/api/v1/tts/synthesize", response_model=SynthesizeResponse, tags=["TTS"])
async def synthesize_text(request: SynthesizeRequest):
    """
    Tổng hợp giọng nói từ văn bản y tế.
    - Chuẩn hóa văn bản trước khi tổng hợp (nếu normalize=True)
    - Ưu tiên FPT.AI, fallback sang Edge Neural nếu gặp rate limit
    - Trả về URL để stream file MP3
    """
    start_ms = int(time.time() * 1000)

    # Chuẩn hóa văn bản y tế
    if request.normalize:
        normalized_text = normalize_medical_text(request.text)
    else:
        normalized_text = request.text.strip()

    if not normalized_text:
        raise HTTPException(status_code=400, detail="Văn bản sau chuẩn hóa bị rỗng.")

    # Tổng hợp âm thanh
    try:
        audio_bytes, file_name, duration_seconds, engine_used = await synthesize_audio(
            text=normalized_text,
            voice=request.voice,
            speed=request.speed,
            api_key=request.api_key,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi tổng hợp giọng nói: {str(e)}")

    latency_ms = int(time.time() * 1000) - start_ms
    audio_url = f"/audio/{file_name}"

    return SynthesizeResponse(
        success=True,
        audio_url=audio_url,
        normalized_text=normalized_text,
        original_text=request.text,
        voice=request.voice,
        latency_ms=latency_ms,
        file_size_bytes=len(audio_bytes),
        duration_seconds=float(duration_seconds),
        engine=engine_used,
        is_cached=False,
    )


@app.post("/api/v1/tts/normalize-only", tags=["TTS"])
async def normalize_only(request: dict):
    """
    Chỉ chuẩn hóa văn bản y tế, không tổng hợp giọng nói.
    Dùng để xem trước kết quả chuẩn hóa trong Doctor Portal.
    """
    text = request.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="Văn bản không được để trống.")
    normalized = normalize_medical_text(text)
    return {"original": text, "normalized": normalized}


@app.post("/api/v1/lexicon/reload", response_model=LexiconReloadResponse, tags=["Lexicon"])
async def reload_medical_lexicon(request: LexiconReloadRequest):
    """
    Nạp lại từ điển phát âm y khoa từ database (được gọi bởi Spring Boot).
    Admin cập nhật lexicon trong DB → Spring Boot gọi endpoint này → Normalizer cập nhật runtime.
    """
    entries = [(e.raw_term, e.phonetic_replacement) for e in request.entries]
    loaded_count = reload_lexicon(entries)
    return LexiconReloadResponse(
        success=True,
        loaded_count=loaded_count,
        message=f"Đã nạp {loaded_count} mục từ điển phát âm y khoa thành công.",
    )


@app.get("/api/v1/audio/{file_name}", tags=["Audio"])
async def stream_audio(file_name: str):
    """Stream file MP3 đã tổng hợp."""
    file_path = AUDIO_STORAGE_DIR / file_name
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="File âm thanh không tồn tại.")
    return FileResponse(
        path=str(file_path),
        media_type="audio/mpeg",
        filename=file_name,
        headers={"Accept-Ranges": "bytes"},
    )


@app.get("/", tags=["System"])
async def root():
    return {
        "service": "HealthVoice TTS Microservice",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "synthesize": "POST /api/v1/tts/synthesize",
            "normalize": "POST /api/v1/tts/normalize-only",
            "lexicon_reload": "POST /api/v1/lexicon/reload",
            "audio_stream": "GET /api/v1/audio/{file_name}",
        }
    }


# ============================================================================
# Entry point
# ============================================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )

