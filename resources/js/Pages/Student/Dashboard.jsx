import { Head, router } from '@inertiajs/react';
import { User, QrCode, Clock } from 'lucide-react';
import { useState } from 'react';
import QRScannerModal from './QRScannerModal';
import CheckInSuccessModal from '@/Components/modals/CheckInSuccessModal';

export default function StudentDashboard({ student, enrolledClasses = 4, attendanceRate = 95 }) {
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [successModal, setSuccessModal] = useState({
        open: false,
        details: {},
    });

    const handleLogout = () => {
        router.post('/logout');
    };

    const handleScanSuccess = (details) => {
        setShowQRScanner(false);
        // Use details from API response (includes real scan time and student info)
        setSuccessModal({
            open: true,
            details: {
                ...details,
                // Fallback to student from props if not in details
                studentName: details.studentName || `${student.first_name} ${student.last_name}`,
                studentId: details.studentId || student.student_id,
            },
        });
    };

    const handleSuccessClose = () => {
        setSuccessModal({
            open: false,
            details: {},
        });
    };

    const handleScanToCheckIn = () => {
        setShowQRScanner(true);
    };

    const handleAttendanceHistory = () => {
        // Navigate to attendance history page
        alert('Attendance history feature coming soon!');
    };

    return (
        <>
            <Head title="Student Dashboard" />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src="/images/logo.jpg" alt="Logo" className="h-10 w-10 rounded-full" />
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">Smart Campus Attendance</h1>
                                <p className="text-xs text-gray-500">Qr Attend Student Portal</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-6 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-4xl mx-auto px-6 py-6 space-y-6">
                    {/* Welcome Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Welcome! {student.first_name} {student.last_name} </h2>
                                <p className="text-sm text-gray-500">Student ID: {student.student_id}</p>
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-600">
                            {new Date().toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <p className="text-sm text-gray-600 mb-2">Enrolled Classes</p>
                            <p className="text-4xl font-bold text-gray-900">{enrolledClasses}</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <p className="text-sm text-gray-600 mb-2">Attendance Rate</p>
                            <p className="text-4xl font-bold text-gray-900">{attendanceRate}%</p>
                        </div>
                    </div>

                    {/* QR Check-in Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
                            <QrCode className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Check In?</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Scan your teacher's QR code to mark your attendance
                        </p>
                        <button
                            onClick={handleScanToCheckIn}
                            className="w-full max-w-sm mx-auto px-6 py-4 bg-black text-white text-base font-semibold rounded-full hover:bg-gray-800 transition-colors"
                        >
                            SCAN TO CHECK-IN
                        </button>
                    </div>

                    {/* Attendance History */}
                    <button
                        onClick={handleAttendanceHistory}
                        className="w-full bg-white rounded-2xl border border-gray-200 p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <Clock className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-base font-semibold text-gray-900">Attendance History</h3>
                            <p className="text-sm text-gray-500">View your attendance records</p>
                        </div>
                    </button>
                </main>
            </div>

            <QRScannerModal
                open={showQRScanner}
                onClose={() => setShowQRScanner(false)}
                onSuccess={handleScanSuccess}
            />

            <CheckInSuccessModal
                open={successModal.open}
                onClose={handleSuccessClose}
                details={successModal.details}
                onBackToDashboard={handleSuccessClose}
            />
        </>
    );
}