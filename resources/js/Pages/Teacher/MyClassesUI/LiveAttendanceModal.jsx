import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { QRCodeSVG } from 'qrcode.react';
import { Clock, Users, UserCheck, UserX, AlertTriangle } from 'lucide-react';
import { router } from '@inertiajs/react';
import axios from 'axios';

export default function LiveAttendanceModal({ isOpen, onClose, classData }) {
    const [session, setSession] = useState(null);
    const [records, setRecords] = useState([]);
    const [stats, setStats] = useState({ total: 0, present: 0, late: 0 });
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const isStarting = useRef(false);

    // Start attendance session
    const startSession = async (duration) => {
        if (!classData || isStarting.current) return;
        
        isStarting.current = true;
        setLoading(true);
        try {
            const response = await axios.post(route('teacher.attendance.start', classData.id), {
                duration_minutes: duration,
            });
            setSession(response.data.session);
            fetchLiveData(response.data.session.id);
        } catch (error) {
            console.error('Error starting session:', error);
            alert('Failed to start attendance session');
        } finally {
            setLoading(false);
            isStarting.current = false;
        }
    };

    // Fetch live attendance data
    const fetchLiveData = async (sessionId) => {
        try {
            const response = await axios.get(route('teacher.attendance.live', sessionId));
            setRecords(response.data.records);
            setStats(response.data.stats);
            setSession(response.data.session);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
    };

    // End session
    const endSession = async () => {
        try {
            await axios.post(route('teacher.attendance.end', session.id));
            setSession(null);
            setRecords([]);
            setStats({ total: 0, present: 0, late: 0 });
            setTimeRemaining(0);
            setShowEndConfirm(false);
            onClose();
            // Reload page to refresh dashboard stats
            router.reload();
        } catch (error) {
            console.error('Error ending session:', error);
            alert('Failed to end session');
        }
    };

    // Calculate time remaining for on-time check-in
    useEffect(() => {
        if (!session) return;

        const interval = setInterval(() => {
            const now = new Date();
            const startedAt = new Date(session.started_at);
            const onTimeDeadline = new Date(startedAt.getTime() + session.duration_minutes * 60 * 1000);
            const diff = Math.max(0, Math.floor((onTimeDeadline - now) / 1000));
            setTimeRemaining(diff);

            // Refresh data every 5 seconds
            if (Math.floor(diff) % 5 === 0) {
                fetchLiveData(session.id);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [session]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSession(null);
            setRecords([]);
            setStats({ total: 0, present: 0, late: 0 });
            setTimeRemaining(0);
            setShowEndConfirm(false);
            isStarting.current = false;
        }
    }, [isOpen]);

    // Format time remaining
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const qrCodeUrl = session 
        ? `${window.location.origin}/attendance/scan/${session.id}`
        : '';

    if (!classData) return null;

    return (
        <>
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Live Attendance Session</DialogTitle>
                    <p className="text-sm text-gray-500">{classData.class_code} - {classData.subject_name}</p>
                    {session && (
                        <p className="text-xs text-gray-400">
                            {new Date(session.started_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </p>
                    )}
                </DialogHeader>

                {!session ? (
                    // Start Session Form
                    <div className="space-y-4 py-6">
                        <h3 className="text-lg font-semibold">Start Attendance Session</h3>
                        <p className="text-sm text-gray-600">Enter time allowed for students to check in as PRESENT:</p>
                        
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                                    Duration (minutes)
                                </label>
                                <input
                                    type="number"
                                    id="duration"
                                    min="1"
                                    max="60"
                                    defaultValue={15}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                    placeholder="Enter minutes (1-60)"
                                />
                            </div>
                            
                            <button
                                onClick={() => {
                                    const input = document.getElementById('duration');
                                    const duration = parseInt(input.value) || 15;
                                    if (duration < 1 || duration > 60) {
                                        alert('Please enter a duration between 1 and 60 minutes');
                                        return;
                                    }
                                    startSession(duration);
                                }}
                                disabled={loading}
                                className="w-full px-6 py-4 bg-black text-white text-base font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Starting...' : 'Start Attendance Session'}
                            </button>
                        </div>
                        
                        <div className="border-t pt-4">
                            <p className="text-xs text-gray-500 mb-2">Quick presets:</p>
                            <div className="grid grid-cols-3 gap-2">
                                {[5, 10, 15].map((duration) => (
                                    <button
                                        key={duration}
                                        onClick={() => {
                                            document.getElementById('duration').value = duration;
                                        }}
                                        className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        {duration} min
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Live Session View
                    <div className="space-y-6">
                        {/* Timer */}
                        <div className="bg-black text-white rounded-lg p-6 text-center">
                            <Clock className="w-8 h-8 mx-auto mb-2" />
                            <div className="text-4xl font-bold">{formatTime(timeRemaining)}</div>
                            <p className="text-sm text-gray-300 mt-1">Time Remaining</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-gray-100 rounded-lg p-4 text-center">
                                <Users className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                                <div className="text-2xl font-bold">{stats.total}</div>
                                <p className="text-xs text-gray-600">Total</p>
                            </div>
                            <div className="bg-green-100 rounded-lg p-4 text-center">
                                <UserCheck className="w-5 h-5 mx-auto mb-1 text-green-600" />
                                <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                                <p className="text-xs text-gray-600">Present</p>
                            </div>
                            <div className="bg-yellow-100 rounded-lg p-4 text-center">
                                <UserX className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
                                <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                                <p className="text-xs text-gray-600">Late</p>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="bg-gray-50 rounded-lg p-6 text-center">
                            <p className="text-sm text-gray-600 mb-4">Students scan this QR code to check in</p>
                            <div className="inline-block bg-white p-4 rounded-lg border-2 border-gray-200">
                                <QRCodeSVG value={qrCodeUrl} size={200} level="H" />
                            </div>
                        </div>

                        {/* Live Check-ins */}
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Live Check-ins ({records.length})
                            </h3>
                            <div className="bg-white border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                                {records.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        No check-ins yet
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {records.map((record) => (
                                            <div key={record.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <UserCheck className={`w-5 h-5 ${record.status === 'present' ? 'text-green-500' : 'text-yellow-500'}`} />
                                                    <div>
                                                        <p className="font-medium text-sm">{record.student_name}</p>
                                                        <p className="text-xs text-gray-500">{record.student_id}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-600">{record.checked_in_at}</p>
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                                        record.status === 'present' 
                                                            ? 'bg-green-100 text-green-700' 
                                                            : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {record.status.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* End Session Button */}
                        <button
                            onClick={() => setShowEndConfirm(true)}
                            className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                        >
                            End Session
                        </button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
        
        {/* End Session Confirmation Modal - Outside Dialog for proper z-index */}
        {showEndConfirm && (
            <>
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
                    onClick={() => setShowEndConfirm(false)}
                />
                <div className="fixed inset-0 flex items-center justify-center z-[10000] pointer-events-none">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl pointer-events-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">End Attendance Session?</h3>
                                <p className="text-sm text-gray-500">This action cannot be undone</p>
                            </div>
                        </div>
                        
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to end this attendance session? Students will no longer be able to check in.
                        </p>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowEndConfirm(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={endSession}
                                className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                            >
                                End Session
                            </button>
                        </div>
                    </div>
                </div>
            </>
        )}
    </>)
}
