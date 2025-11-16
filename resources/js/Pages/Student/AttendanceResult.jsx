import { Head, router } from '@inertiajs/react';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export default function AttendanceResult({ success, status, message, class: classData, record }) {
    const handleBackToDashboard = () => {
        router.visit(route('student.dashboard'));
    };

    const handleTryAgain = () => {
        window.location.reload();
    };

    const getStatusConfig = () => {
        switch (status) {
            case 'present':
                return {
                    icon: CheckCircle,
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    iconColor: 'text-green-600',
                    titleColor: 'text-green-900',
                    title: 'Success!',
                    subtitle: 'You are marked PRESENT',
                    badgeColor: 'bg-green-100 text-green-700',
                };
            case 'late':
                return {
                    icon: AlertCircle,
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    iconColor: 'text-yellow-600',
                    titleColor: 'text-yellow-900',
                    title: 'Checked In',
                    subtitle: 'You are marked LATE',
                    badgeColor: 'bg-yellow-100 text-yellow-700',
                };
            default:
                return {
                    icon: XCircle,
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    iconColor: 'text-red-600',
                    titleColor: 'text-red-900',
                    title: 'Error',
                    subtitle: 'QR Code Invalid',
                    badgeColor: 'bg-red-100 text-red-700',
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <>
            <Head title="Attendance Check-in" />
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full">
                    {/* Status Card */}
                    <div className={`${config.bgColor} border ${config.borderColor} rounded-2xl p-8 text-center shadow-lg`}>
                        {/* Icon */}
                        <div className={`inline-flex items-center justify-center w-20 h-20 ${config.iconColor} bg-white rounded-full mb-4 shadow-md`}>
                            <Icon className="w-10 h-10" />
                        </div>

                        {/* Title */}
                        <h1 className={`text-2xl font-bold ${config.titleColor} mb-2`}>
                            {config.title}
                        </h1>
                        <p className={`text-lg font-semibold ${config.iconColor} mb-6`}>
                            {config.subtitle}
                        </p>

                        {/* Message */}
                        {message && (
                            <p className="text-sm text-gray-700 mb-6">
                                {message}
                            </p>
                        )}

                        {/* Class Info */}
                        {classData && (
                            <div className="bg-white rounded-lg p-4 mb-6 text-left">
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-xs text-gray-500">Class:</p>
                                        <p className="font-semibold text-gray-900">{classData.class_code}</p>
                                    </div>
                                    {record && (
                                        <>
                                            <div>
                                                <p className="text-xs text-gray-500">Time:</p>
                                                <p className="font-medium text-gray-900">{record.checked_in_at}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Status:</p>
                                                <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${config.badgeColor}`}>
                                                    {record.status.toUpperCase()}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleBackToDashboard}
                                className="w-full py-3 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-colors"
                            >
                                Back to Dashboard
                            </button>
                            
                            {status === 'error' && (
                                <button
                                    onClick={handleTryAgain}
                                    className="w-full py-3 bg-white text-gray-700 font-semibold rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
                                >
                                    Try Again
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Footer Note */}
                    {success && record && (
                        <p className="text-center text-sm text-gray-500 mt-6">
                            Your attendance has been recorded successfully.
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}
