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
        const constraints = {
            video: { facingMode: { ideal: "environment" } },
            audio: false,
        };

        if (navigator.mediaDevices?.getUserMedia) {
            return navigator.mediaDevices.getUserMedia(constraints);
        }

        const legacyGetUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;

        if (legacyGetUserMedia) {
            return new Promise((resolve, reject) =>
                legacyGetUserMedia.call(navigator, constraints, resolve, reject)
            );
        }

        throw new Error("UNSUPPORTED_BROWSER");
    };

    const startCamera = async () => {
        if (
            typeof navigator === "undefined" ||
            !navigator.mediaDevices ||
            typeof navigator.mediaDevices.getUserMedia !== "function"
        ) {
            setError(
                "Camera access is not available in this browser. Try using Chrome or Safari on your phone."
            );
            setIsScanning(false);
            return;
        }

        try {
            const stream = await requestCameraStream();

            if (!videoRef.current) {
                return;
            }
            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            setError("");
            setIsScanning(true);
            startScanning();
        } catch (err) {
            console.error("Error accessing camera:", err);

            if (err.message === "UNSUPPORTED_BROWSER") {
                setError("Camera scanning is not supported on this browser.");
            } else if (err.name === "NotAllowedError") {
                setError("Camera permission was denied. Please allow camera access and retry.");
            } else if (!window.isSecureContext) {
                setError(
                    "Camera access requires a secure connection. Use https:// for your LAN IP or mark it as a secure origin in Chrome."
                );
            } else {
                setError("Unable to access the camera. Please check permissions in your browser settings.");
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

