export default function CameraView({ videoRef, isScanning, error }) {
    return (
        <div className="w-full flex justify-center">
            <div className="w-full max-w-[16rem] sm:max-w-sm aspect-square bg-black rounded-2xl flex items-center justify-center overflow-hidden relative border border-gray-200 shadow-inner">
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                />
                {!isScanning && !error && (
                    <span className="absolute text-xs text-gray-300">
                        Camera preview
                    </span>
                )}
                {error && (
                    <span className="absolute text-xs text-red-300 text-center px-4">
                        {error}
                    </span>
                )}
            </div>
        </div>
    );
}

