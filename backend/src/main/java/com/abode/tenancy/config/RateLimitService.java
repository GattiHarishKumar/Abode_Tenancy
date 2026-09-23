package com.abode.tenancy.config;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private static final int MAX_REQUESTS_PER_MINUTE = 10;
    private static final long WINDOW_MS = 60_000L;

    private final Map<String, RequestWindow> rateLimitMap = new ConcurrentHashMap<>();

    public boolean tryAcquire(String clientKey) {
        long now = System.currentTimeMillis();
        rateLimitMap.entrySet().removeIf(entry -> now - entry.getValue().windowStart > WINDOW_MS * 5);

        RequestWindow window = rateLimitMap.compute(clientKey, (k, v) -> {
            if (v == null || (now - v.windowStart) > WINDOW_MS) {
                return new RequestWindow(now, 1);
            }
            v.requestCount++;
            return v;
        });

        return window.requestCount <= MAX_REQUESTS_PER_MINUTE;
    }

    private static class RequestWindow {
        long windowStart;
        int requestCount;

        RequestWindow(long windowStart, int requestCount) {
            this.windowStart = windowStart;
            this.requestCount = requestCount;
        }
    }
}

