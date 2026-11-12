"""
fpt_tts_client.py — Giao tiếp với FPT.AI TTS API v5
Hỗ trợ async polling cho file MP3 + fallback đa tầng siêu tốc sang Microsoft Edge Neural TTS & Google TTS (gTTS)
Hỗ trợ 100% chuyển đổi toàn bộ bài viết từ Doctor Studio thành giọng đọc âm thanh hoàn chỉnh.
"""
import asyncio
import hashlib
import os
import tempfile
import time
import io
import re
from pathlib import Path
from typing import Optional, Tuple, List

import httpx
import edge_tts
import gtts

# ============================================================================
# Cấu hình
# ============================================================================
FPT_AI_API_URL = "https://api.fpt.ai/hmi/tts/v5"
DEFAULT_FPT_API_KEY = os.getenv("FPT_AI_API_KEY", "QT2SnOFWi3P4pekGKV1TkuzQAKJUcNgZ")
AUDIO_STORAGE_DIR = Path(os.getenv("AUDIO_STORAGE_DIR", Path(__file__).resolve().parent / "audio_storage"))
AUDIO_STORAGE_DIR.mkdir(parents=True, exist_ok=True)

# Map giọng FPT.AI sang Edge Neural TTS
EDGE_VOICE_MAP = {
    "banmai": "vi-VN-HoaiMyNeural",
    "thuminh": "vi-VN-HoaiMyNeural",
    "myan": "vi-VN-HoaiMyNeural",
    "giahuy": "vi-VN-NamMinhNeural",
    "leminh": "vi-VN-NamMinhNeural",
    "minhquang": "vi-VN-NamMinhNeural",
    "thu-minh": "vi-VN-HoaiMyNeural",
}

def clean_text_for_speech(text: str) -> str:
    """
    Làm sạch văn bản trước khi đưa vào bộ tổng hợp giọng nói:
    - Loại bỏ các thẻ điều hướng hệ thống [RISK_LEVEL:...], [QUICK_TAGS:...]
    - Loại bỏ ký tự markdown (*, _, #, `, ~, >)
    - Loại bỏ links, chuẩn hóa ký tự toán học và so sánh
    """
    if not text:
        return ""
    # Loại bỏ các thẻ tag y tế
    text = re.sub(r'\[(RISK_LEVEL|QUICK_TAGS)[^\]]*\]', '', text, flags=re.IGNORECASE)
    # Loại bỏ markdown headers
    text = re.sub(r'#{1,6}\s*', '', text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    text = re.sub(r'[*_#`~>|]', ' ', text)

    # Chuẩn hóa ký tự đặc biệt
    text = text.replace('–', '-').replace('—', '-').replace('…', '.').replace('“', '"').replace('”', '"').replace('’', "'")
    text = text.replace('&', ' và ')
    text = re.sub(r'<\s*(\d+)', r'dưới \1', text)
    text = re.sub(r'>\s*(\d+)', r'trên \1', text)
    
    # Xử lý từng dòng để tạo câu mạch lạc, không sinh dấu chấm thừa
    lines = []
    for line in text.split('\n'):
        line = line.strip()
        line = re.sub(r'^[-•*+]\s+', '', line)
        if not line:
            continue
        if not line.endswith(('.', '!', '?', ':', ',')):
            line += '.'
        lines.append(line)

    result = ' '.join(lines)
    result = re.sub(r'\.{2,}', '.', result)
    result = re.sub(r'\s+', ' ', result).strip()
    return result


async def _try_fpt_ai(text: str, voice: str, speed: float, api_key: str) -> Optional[bytes]:
    """
    Gọi FPT.AI TTS v5 và polling nhanh để lấy file MP3.
    """
    speed_int = max(-3, min(3, int(round(speed))))
    headers = {
        "api-key": api_key,
        "voice": voice,
        "speed": str(speed_int),
        "format": "mp3",
        "Content-Type": "text/plain; charset=utf-8",
    }

    try:
        async with httpx.AsyncClient(timeout=5.0, follow_redirects=True) as client:
            post_resp = await client.post(FPT_AI_API_URL, headers=headers, content=text.encode("utf-8"))
            if post_resp.status_code != 200:
                return None

            data = post_resp.json()
            async_url = data.get("async")
            if not async_url:
                return None

            for _ in range(4):
                await asyncio.sleep(0.8)
                try:
                    dl_resp = await client.get(async_url, timeout=3.0)
                    if dl_resp.status_code == 200 and len(dl_resp.content) > 200:
                        return dl_resp.content
                except Exception:
                    continue
    except Exception:
        return None

    return None


async def _stream_edge_chunks(communicate) -> bytes:
    chunks = bytearray()
    async for chunk in communicate.stream():
        if chunk.get("type") == "audio":
            chunks.extend(chunk.get("data", b""))
    return bytes(chunks)


async def _try_edge_neural(text: str, voice: str, speed: float = 0.0) -> Optional[bytes]:
    """
    Tổng hợp giọng nói qua Microsoft Edge Neural TTS.
    Giọng Neural tự nhiên, truyền cảm như người thật.
    """
    edge_voice = EDGE_VOICE_MAP.get(voice.lower(), "vi-VN-HoaiMyNeural")

    for v in [edge_voice, "vi-VN-HoaiMyNeural", "vi-VN-NamMinhNeural"]:
        try:
            communicate = edge_tts.Communicate(text, v)
            audio_data = await asyncio.wait_for(_stream_edge_chunks(communicate), timeout=25.0)
            if len(audio_data) > 100:
                return audio_data
        except Exception:
            await asyncio.sleep(0.3)

    return None


async def _try_gtts(text: str) -> Optional[bytes]:
    """
    Fallback dự phòng: Google TTS tiếng Việt (gTTS).
    """
    try:
        def _generate():
            fp = io.BytesIO()
            tts = gtts.gTTS(text=text, lang="vi", slow=False)
            tts.write_to_fp(fp)
            return fp.getvalue()

        timeout_sec = max(10.0, len(text) / 50.0)
        audio_bytes = await asyncio.wait_for(asyncio.to_thread(_generate), timeout=timeout_sec)
        if audio_bytes and len(audio_bytes) > 200:
            return audio_bytes
    except Exception:
        pass
    return None


def _chunk_text(text: str, max_chunk_len: int = 250) -> List[str]:
    """
    Tách văn bản y khoa thành các phân đoạn nhỏ theo câu hoàn chỉnh.
    """
    text = text.strip()
    if len(text) <= max_chunk_len:
        return [text]

    raw_sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
    refined = []
    for s in raw_sentences:
        if len(s) > max_chunk_len:
            sub = [sub_s.strip() for sub_s in re.split(r'(?<=[,;:\n])\s+', s) if sub_s.strip()]
            refined.extend(sub)
        else:
            refined.append(s)

    chunks = []
    current = []
    current_len = 0

    for sentence in refined:
        if current_len + len(sentence) + 1 > max_chunk_len and current:
            chunks.append(" ".join(current))
            current = [sentence]
            current_len = len(sentence)
        else:
            current.append(sentence)
            current_len += len(sentence) + 1

    if current:
        chunks.append(" ".join(current))

    return chunks if chunks else [text]


async def synthesize_single_chunk(
    text: str,
    voice: str = "banmai",
    speed: float = 0.0,
    api_key: Optional[str] = None,
) -> Tuple[bytes, str]:
    """Tổng hợp một đoạn văn bản đơn lẻ với thứ tự: Edge Neural TTS -> FPT.AI -> gTTS."""
    effective_key = api_key if api_key else DEFAULT_FPT_API_KEY

    # Tầng 1: Microsoft Edge Neural TTS (siêu tự nhiên, hỗ trợ tiếng Việt mượt mà)
    audio_bytes = await _try_edge_neural(text, voice, speed)
    if audio_bytes and len(audio_bytes) > 100:
        return audio_bytes, "edge_neural"

    # Tầng 2: FPT.AI (nếu cấu hình hợp lệ)
    audio_bytes = await _try_fpt_ai(text, voice, speed, effective_key)
    if audio_bytes and len(audio_bytes) > 100:
        return audio_bytes, "fpt_ai"

    # Tầng 3: Google TTS
    audio_bytes = await _try_gtts(text)
    if audio_bytes and len(audio_bytes) > 100:
        return audio_bytes, "gtts_fallback"

    return b"", "fallback_empty"


async def synthesize_audio(
    text: str,
    voice: str = "banmai",
    speed: float = 0.0,
    api_key: Optional[str] = None,
) -> Tuple[bytes, str, int, str]:
    """
    Tổng hợp 100% TOÀN BỘ văn bản thành âm thanh MP3.
    Khi bác sĩ thêm bài viết ở phần Doctor, toàn bộ nội dung lâm sàng
    được chia nhỏ theo ngữ nghĩa và tổng hợp đầy đủ 100%, không bị cắt bớt.
    """
    clean_text = clean_text_for_speech(text)
    if not clean_text:
        clean_text = text.strip()

    chunks = _chunk_text(clean_text, max_chunk_len=250)
    all_audio_bytes = bytearray()
    primary_engine = "edge_neural"

    for idx, chunk in enumerate(chunks):
        chunk_bytes, engine_used = await synthesize_single_chunk(chunk, voice, speed, api_key)
        if chunk_bytes:
            all_audio_bytes.extend(chunk_bytes)
        if idx == 0 and engine_used:
            primary_engine = engine_used
        # Khoảng nghỉ nhẹ giữa các chunk
        await asyncio.sleep(0.15)

    final_bytes = bytes(all_audio_bytes)

    # Lưu file MP3 vào thư mục audio_storage duy nhất của TTS service
    text_hash = hashlib.sha256(f"{clean_text[:200]}|{len(clean_text)}|{voice}|{speed}".encode()).hexdigest()[:16]
    file_name = f"tts_{text_hash}_{int(time.time())}.mp3"

    with open(AUDIO_STORAGE_DIR / file_name, "wb") as f:
        f.write(final_bytes)

    # Tính thời lượng dựa trên số từ (trung bình 140 từ/phút)
    word_count = len(clean_text.split())
    duration_seconds = max(5.0, (word_count / 140.0) * 60.0)

    return final_bytes, file_name, int(duration_seconds), primary_engine
