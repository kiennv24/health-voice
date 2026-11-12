package com.healthvoice.controller;

import com.healthvoice.entity.AudioRecord;
import com.healthvoice.exception.ResourceNotFoundException;
import com.healthvoice.repository.AudioRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

/**
 * Controller phát âm thanh trực tuyến (Streaming Audio Controller)
 * Cung cấp API /api/audio/stream/{recordId} hỗ trợ chuẩn HTTP 206 Partial
 * Content (Header Range: bytes=...)
 * Giúp Frontend tua nhanh audio mượt mà, không bị trễ mạng hay ngắt quãng.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class StreamingController {

    private final AudioRecordRepository audioRecordRepository;

    @Value("${storage.upload-dir:./uploads/audios}")
    private String audioStorageDir;

    /**
     * API Streaming theo Audio Record ID: /api/audio/stream/{recordId}
     */
    @GetMapping({ "/api/audio/stream/{recordId}", "/api/audios/{recordId}/stream" })
    public ResponseEntity<StreamingResponseBody> streamAudioByRecordId(
            @PathVariable Long recordId,
            @RequestHeader(value = HttpHeaders.RANGE, required = false) String rangeHeader) {

        AudioRecord record = audioRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("AudioRecord", "id", recordId));

        return buildStreamingResponse(record.getFilePath(), rangeHeader, Optional.of(record));
    }

    /**
     * API Streaming trực tiếp theo tên file: /api/stream/{fileName}
     */
    @GetMapping({ "/api/stream/{fileName:.+}", "/api/audio/file/{fileName:.+}" })
    public ResponseEntity<StreamingResponseBody> streamAudioByFileName(
            @PathVariable String fileName,
            @RequestHeader(value = HttpHeaders.RANGE, required = false) String rangeHeader) {

        Optional<AudioRecord> recordOpt = audioRecordRepository.findAll().stream()
                .filter(r -> fileName.equals(r.getFilePath()))
                .findFirst();

        return buildStreamingResponse(fileName, rangeHeader, recordOpt);
    }

    /**
     * Hàm điều hướng và phân tích Range Header để trả về HTTP 206 Partial Content
     */
    private ResponseEntity<StreamingResponseBody> buildStreamingResponse(
            String fileName,
            String rangeHeader,
            Optional<AudioRecord> recordOpt) {

        Path baseStorage = Paths.get(audioStorageDir).toAbsolutePath().normalize();
        File audioFile = baseStorage.resolve(fileName).toFile();

        if (!audioFile.exists() || !audioFile.isFile()) {
            log.warn("File audio không tồn tại: {}", audioFile.getAbsolutePath());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        long fileLength = audioFile.length();
        long rangeStart = 0;
        long rangeEnd = fileLength - 1;
        boolean isPartial = false;

        if (rangeHeader != null && rangeHeader.trim().startsWith("bytes=")) {
            String rangeValue = rangeHeader.trim().substring(6);
            String[] ranges = rangeValue.split("-");
            try {
                if (ranges.length > 0 && !ranges[0].isEmpty()) {
                    rangeStart = Long.parseLong(ranges[0].trim());
                }
                if (ranges.length > 1 && !ranges[1].isEmpty()) {
                    rangeEnd = Long.parseLong(ranges[1].trim());
                }
                isPartial = true;
            } catch (NumberFormatException e) {
                log.warn("Định dạng Range header không hợp lệ: {}", rangeHeader);
            }
        }

        if (rangeEnd > fileLength - 1) {
            rangeEnd = fileLength - 1;
        }

        if (rangeStart > rangeEnd) {
            rangeStart = 0;
        }

        long contentLength = rangeEnd - rangeStart + 1;
        final long finalStart = rangeStart;
        final long finalEnd = rangeEnd;
        final long finalContentLength = contentLength;

        // Tăng lượt nghe nếu phát từ đầu file (rangeStart == 0)
        if (rangeStart == 0 && recordOpt.isPresent()) {
            try {
                AudioRecord r = recordOpt.get();
                r.setListenCount((r.getListenCount() != null ? r.getListenCount() : 0L) + 1);
                audioRecordRepository.save(r);
            } catch (Exception e) {
                log.warn("Không thể cập nhật lượt nghe: {}", e.getMessage());
            }
        }

        StreamingResponseBody responseBody = (OutputStream outputStream) -> {
            try (InputStream is = new FileInputStream(audioFile)) {
                if (finalStart > 0) {
                    long skipped = is.skip(finalStart);
                    if (skipped < finalStart) {
                        log.warn("Bỏ qua {}/{} bytes", skipped, finalStart);
                    }
                }

                byte[] buffer = new byte[8192];
                long bytesRemaining = finalContentLength;

                while (bytesRemaining > 0) {
                    int bytesToRead = (int) Math.min(buffer.length, bytesRemaining);
                    int read = is.read(buffer, 0, bytesToRead);
                    if (read == -1)
                        break;

                    outputStream.write(buffer, 0, read);
                    bytesRemaining -= read;
                }
                outputStream.flush();
            }
        };

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.ACCEPT_RANGES, "bytes");
        headers.setContentType(MediaType.parseMediaType("audio/mpeg"));
        headers.set(HttpHeaders.CONTENT_LENGTH, String.valueOf(contentLength));

        if (isPartial) {
            headers.set(HttpHeaders.CONTENT_RANGE, String.format("bytes %d-%d/%d", finalStart, finalEnd, fileLength));
            return new ResponseEntity<>(responseBody, headers, HttpStatus.PARTIAL_CONTENT);
        } else {
            return new ResponseEntity<>(responseBody, headers, HttpStatus.OK);
        }
    }
}
