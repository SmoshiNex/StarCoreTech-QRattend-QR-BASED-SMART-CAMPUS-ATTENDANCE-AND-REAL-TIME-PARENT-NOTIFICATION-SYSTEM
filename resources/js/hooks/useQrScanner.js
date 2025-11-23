import { useEffect, useMemo, useRef, useState } from "react";
import jsQR from "jsqr";

export function useQrScanner(open, onDetected) {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const scanIntervalRef = useRef(null);
    const animationFrameRef = useRef(null);
    const canvasRef = useRef(
        typeof document !== "undefined" ? document.createElement("canvas") : null
    );

    const [error, setError] = useState("");
    const [isScanning, setIsScanning] = useState(false);

    const supportsBarcodeDetector = useMemo(() => {
        return typeof window !== "undefined" && "BarcodeDetector" in window;
    }, []);

    const requestCameraStream = async () => {
        // Try multiple constraint configurations for better browser compatibility
        const constraints = [
            { video: { facingMode: { ideal: "environment" } }, audio: false },
            { video: { facingMode: "environment" }, audio: false },
            { video: { facingMode: { exact: "environment" } }, audio: false },
            { video: true, audio: false }, // Fallback to any camera
        ];

        // Modern API (Chrome, Firefox, Edge, Safari 11+)
        if (navigator.mediaDevices?.getUserMedia) {
            for (const constraint of constraints) {
                try {
                    return await navigator.mediaDevices.getUserMedia(constraint);
                } catch (err) {
                    // If it's not a constraint error, throw it
                    if (err.name !== 'OverconstrainedError' && err.name !== 'ConstraintNotSatisfiedError') {
                        throw err;
                    }
                    // Otherwise, try next constraint
                    continue;
                }
            }
        }

        // Legacy API (older browsers)
        const legacyGetUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;

        if (legacyGetUserMedia) {
            return new Promise((resolve, reject) => {
                // Try with ideal constraint first
                legacyGetUserMedia.call(navigator, constraints[0], resolve, (err) => {
                    // If that fails, try with simple video: true
                    legacyGetUserMedia.call(navigator, constraints[3], resolve, reject);
                });
            });
        }

        throw new Error("UNSUPPORTED_BROWSER");
    };

    const startCamera = async () => {
        // Check for secure context (required for camera access)
        // Note: localhost and 127.0.0.1 are considered secure contexts
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname === '[::1]';
        
        // Warn about insecure context but still try to access camera
        // Some browsers may allow camera access on local IPs
        if (typeof window !== "undefined" && !window.isSecureContext && !isLocalhost) {
            // Show warning but continue - some browsers allow it
            console.warn('Accessing camera on non-secure context. This may not work in all browsers.');
        }

        // Try to get camera access with better browser compatibility
        try {
            const stream = await requestCameraStream();

            if (!videoRef.current) {
                return;
            }
            
            // Handle different browser implementations
            if (videoRef.current.srcObject !== undefined) {
                videoRef.current.srcObject = stream;
            } else if (videoRef.current.mozSrcObject !== undefined) {
                videoRef.current.mozSrcObject = stream;
            } else if (window.URL && window.URL.createObjectURL) {
                videoRef.current.src = window.URL.createObjectURL(stream);
            } else if (window.webkitURL && window.webkitURL.createObjectURL) {
                videoRef.current.src = window.webkitURL.createObjectURL(stream);
            } else {
                setError("Your browser does not support camera access.");
                setIsScanning(false);
                return;
            }

            streamRef.current = stream;
            
            // Play video with error handling
            try {
                await videoRef.current.play();
            } catch (playError) {
                console.error("Error playing video:", playError);
                setError("Unable to start camera. Please check permissions.");
                setIsScanning(false);
                return;
            }
            
            setError("");
            setIsScanning(true);
            startScanning();
        } catch (err) {
            console.error("Error accessing camera:", err);

            // Check if error is due to insecure context
            if (!window.isSecureContext && !isLocalhost) {
                setError(
                    "Camera requires HTTPS. Solutions:\n\n" +
                    "1. Use https://localhost:8000\n" +
                    "2. Enable insecure origins in Chrome:\n" +
                    "   chrome://flags/#unsafely-treat-insecure-origin-as-secure\n" +
                    "   Add: http://your.ip.of.the.phone\n\n" +
                    "3. Access via localhost instead of IP"
                );
            } else if (err.message === "UNSUPPORTED_BROWSER") {
                setError("Camera scanning is not supported on this browser. Please use a modern browser like Chrome, Firefox, Safari, or Edge.");
            } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                setError("Camera permission was denied. Please allow camera access in your browser settings and try again.");
            } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                setError("No camera found. Please ensure a camera is connected and try again.");
            } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
                setError("Camera is already in use by another application. Please close other apps using the camera.");
            } else if (err.name === "OverconstrainedError" || err.name === "ConstraintNotSatisfiedError") {
                setError("Camera constraints could not be satisfied. Trying with different settings...");
                // Retry with less specific constraints
                try {
                    const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    if (videoRef.current) {
                        videoRef.current.srcObject = fallbackStream;
                        streamRef.current = fallbackStream;
                        await videoRef.current.play();
                        setError("");
                        setIsScanning(true);
                        startScanning();
                        return;
                    }
                } catch (fallbackErr) {
                    setError("Unable to access the camera. Please check your browser settings.");
                }
            } else {
                setError("Unable to access the camera. Please check permissions in your browser settings and ensure you're using HTTPS.");
            }
            setIsScanning(false);
        }
    };

    const startScanning = () => {
        if (supportsBarcodeDetector) {
            const detector = new window.BarcodeDetector({ formats: ["qr_code"] });

            scanIntervalRef.current = window.setInterval(async () => {
                if (!videoRef.current) {
                    return;
                }

                try {
                    const barcodes = await detector.detect(videoRef.current);
                    if (barcodes.length > 0) {
                        const raw = barcodes[0].rawValue;
                        handleDetected(raw);
                    }
                } catch (err) {
                    console.error("Error detecting QR code:", err);
                }
            }, 400);
        } else {
            const canvas = canvasRef.current;
            if (!canvas) {
                setError("Unable to initialise camera canvas.");
                return;
            }
            const context = canvas.getContext("2d");

            const scanFrame = () => {
                if (!videoRef.current || !context) {
                    animationFrameRef.current = requestAnimationFrame(scanFrame);
                    return;
                }

                const video = videoRef.current;
                if (video.readyState !== video.HAVE_ENOUGH_DATA) {
                    animationFrameRef.current = requestAnimationFrame(scanFrame);
                    return;
                }

                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, canvas.width, canvas.height);

                if (code?.data) {
                    handleDetected(code.data);
                    return;
                }

                animationFrameRef.current = requestAnimationFrame(scanFrame);
            };

            animationFrameRef.current = requestAnimationFrame(scanFrame);
        }
    };

    const stopCamera = () => {
        if (scanIntervalRef.current) {
            window.clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }
        if (animationFrameRef.current) {
            window.cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        setIsScanning(false);
    };

    const handleDetected = async (value) => {
        stopCamera();
        setIsScanning(false);

        if (!value || typeof value !== "string" || value.trim().length === 0) {
            setError("This QR code is not a valid attendance link.");
            return;
        }

        // Extract session ID from URL (format: /attendance/scan/{sessionId})
        let sessionId = null;
        try {
            const url = new URL(value, window.location.origin);
            const pathParts = url.pathname.split('/');
            const scanIndex = pathParts.indexOf('attendance');
            if (scanIndex !== -1 && pathParts[scanIndex + 1] === 'scan' && pathParts[scanIndex + 2]) {
                sessionId = pathParts[scanIndex + 2];
            }
        } catch {
            // If URL parsing fails, try direct path matching
            const match = value.match(/\/attendance\/scan\/(\d+)/);
            if (match) {
                sessionId = match[1];
            }
        }

        if (!sessionId) {
            setError("This QR code is not a valid attendance link.");
            return;
        }

        // Call the API to save attendance record
        // Send client's current time for accurate timestamp display
        try {
            setError("");
            // Send local time in ISO format - this preserves the actual local time
            const now = new Date();
            // Format as YYYY-MM-DDTHH:mm:ss (local time, not UTC)
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const clientTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
            const response = await fetch(`/attendance/scan/${sessionId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-Client-Time': clientTime, // Send phone's current local time
                },
                credentials: 'include',
            });

            const contentType = response.headers.get('content-type') || '';
            const isJson = contentType.includes('application/json');

            if (!response.ok) {
                if (isJson) {
                    const errorData = await response.json().catch(() => ({}));
                    setError(errorData.message || "Failed to check in. Please try again.");
                } else {
                    setError("Failed to check in. Please try again.");
                }
                return;
            }

            // Parse JSON response
            if (isJson) {
                const data = await response.json();
                if (data.success) {
                    onDetected?.(data);
                } else {
                    setError(data.message || "Check-in failed.");
                }
            } else {
                // If it's an Inertia redirect (HTML), show default success
                onDetected?.({
                    success: true,
                    status: 'present',
                    class: { class_name: 'Class' },
                    record: { checked_in_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
                });
            }
        } catch (err) {
            console.error("Error checking in:", err);
            setError("Network error. Please check your connection and try again.");
        }
    };

    useEffect(() => {
        if (open) {
            startCamera();
        } else {
            stopCamera();
            setError("");
        }

        return () => {
            stopCamera();
        };
    }, [open]);

    return {
        videoRef,
        error,
        isScanning,
    };
}

