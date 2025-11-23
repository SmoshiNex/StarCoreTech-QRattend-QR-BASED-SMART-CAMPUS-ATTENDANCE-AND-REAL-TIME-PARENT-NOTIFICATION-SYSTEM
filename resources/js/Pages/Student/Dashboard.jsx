import { Head, router } from '@inertiajs/react';
import { User, QrCode, Clock, Bell, Menu, X, BookOpen } from 'lucide-react';
import { useState } from 'react';
import QRScannerModal from './QRScannerModal';
import CheckInSuccessModal from '@/Components/modals/CheckInSuccessModal';

export default function StudentDashboard({ student, enrolledClasses = 4, attendanceRate = 95 }) {
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
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
        setSidebarOpen(false);
        router.visit('/student/attendance-history');
    };

    const handleNotifications = () => {
        setSidebarOpen(false);
        router.visit('/student/notifications');
    };

    const handleMyClasses = () => {
        setSidebarOpen(false);
        router.visit('/student/my-classes');
    };

    return (
        <>
            <Head title="Student Dashboard" />
            <div className="min-h-screen bg-gray-50">
                {/* Sidebar Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <div
                    className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <div className="flex flex-col h-full">
                        {/* Sidebar Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <img src="/images/logo.jpg" alt="Logo" className="h-8 w-8 rounded-full" />
                                <div>
                                    <h2 className="text-sm font-bold text-gray-900">Menu</h2>
                                </div>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Sidebar Navigation */}
                        <nav className="flex-1 p-4 space-y-2">
                            <button
                                onClick={handleAttendanceHistory}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                            >
                                <Clock className="w-5 h-5 text-gray-600" />
                                <span className="text-sm font-medium text-gray-900">Attendance History</span>
                            </button>

                            <button
                                onClick={handleNotifications}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                            >
                                <Bell className="w-5 h-5 text-gray-600" />
                                <span className="text-sm font-medium text-gray-900">Notifications</span>
                            </button>

                            <button
                                onClick={handleMyClasses}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                            >
                                <BookOpen className="w-5 h-5 text-gray-600" />
                                <span className="text-sm font-medium text-gray-900">My Classes</span>
                            </button>
                        </nav>

                        {/* Sidebar Footer */}
                        <div className="p-4 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    setSidebarOpen(false);
                                    handleLogout();
                                }}
                                className="w-full px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <Menu className="w-6 h-6 text-gray-600" />
                            </button>
                            <img src="/images/logo.jpg" alt="Logo" className="h-10 w-10 rounded-full" />
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">Smart Campus Attendance</h1>
                                <p className="text-xs text-gray-500">Qr Attend Student Portal</p>
                            </div>
                        </div>
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
                        <button
                            onClick={handleMyClasses}
                            className="bg-white rounded-2xl border border-gray-200 p-6 hover:bg-gray-50 transition-colors text-left"
                        >
                            <p className="text-sm text-gray-600 mb-2">Enrolled Classes</p>
                            <p className="text-4xl font-bold text-gray-900">{enrolledClasses}</p>
                            <p className="text-xs text-gray-500 mt-2">Tap to view →</p>
                        </button>
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