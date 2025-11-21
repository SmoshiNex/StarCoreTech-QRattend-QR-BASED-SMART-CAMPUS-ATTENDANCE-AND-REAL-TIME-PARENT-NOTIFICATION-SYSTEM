import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function CheckInSuccessModal({
    open,
    onClose,
    details = {},
    onBackToDashboard,
}) {
    const {
        className = "—",
        time = "—",
        status = "PRESENT",
        studentName = "",
        studentId = "",
    } = details;

    const handleBackClick = () => {
        if (onBackToDashboard) {
            onBackToDashboard();
        }
        onClose?.();
    };

    // Format time display - show in 12-hour format (e.g., "2:30:45 PM")
    const displayTime = time && time !== "—" ? time : new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
    });

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-[92vw] max-w-sm sm:max-w-md rounded-2xl p-0">
                <DialogHeader className="space-y-4 px-5 pt-6 sm:px-6 text-center">
                    <div className="flex justify-center">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                        <DialogTitle className="text-2xl font-bold text-gray-900">Success!</DialogTitle>
                        <p className="text-emerald-600 font-semibold text-base">You are marked PRESENT</p>
                        <p className="text-sm text-gray-500">
                            Your attendance has been recorded successfully.
                        </p>
                    </div>
                </DialogHeader>

                <div className="px-5 sm:px-6 pb-5">
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-3">
                        {/* Student Name and ID */}
                        {(studentName || studentId) && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                <span className="text-sm font-medium text-gray-600">Student</span>
                                <div className="text-right">
                                    {studentName && (
                                        <span className="text-sm font-semibold text-gray-900 block">{studentName}</span>
                                    )}
                                    {studentId && (
                                        <span className="text-xs text-gray-500">{studentId}</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Class Name */}
                        <div className="flex items-center justify-between py-2 border-b border-gray-200">
                            <span className="text-sm font-medium text-gray-600">Class</span>
                            <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%] break-words">
                                {className}
                            </span>
                        </div>

                        {/* Scan Time - Real timestamp in 12-hour format */}
                        <div className="flex items-center justify-between py-2 border-b border-gray-200">
                            <span className="text-sm font-medium text-gray-600">Time</span>
                            <span className="text-sm font-semibold text-gray-900 text-right">{displayTime}</span>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm font-medium text-gray-600">Status</span>
                            <span
                                className="text-xs font-semibold px-3 py-1.5 rounded-full"
                                style={{ 
                                    backgroundColor: status === 'PRESENT' ? "#B9F8CF" : status === 'LATE' ? "#FFF085" : "#FFC9C9",
                                    color: "#064e3b"
                                }}
                            >
                                {status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="px-5 sm:px-6 pb-5">
                    <Button 
                        className="w-full" 
                        onClick={handleBackClick}
                    >
                        Back to Dashboard
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}


