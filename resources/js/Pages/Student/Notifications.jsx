import { Head, router, Link } from '@inertiajs/react';
import { Bell, CheckCircle, XCircle, Clock, Mail, ArrowLeft } from 'lucide-react';

export default function StudentNotifications({ notifications, student }) {
    const getTypeIcon = (type) => {
        switch (type) {
            case 'attendance':
                return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />;
            case 'email_sent':
                return <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />;
            case 'email_failed':
                return <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />;
            default:
                return <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />;
        }
    };

    const getStatusBadge = (status) => {
        const baseClasses = "px-2 py-1 rounded-full text-xs font-semibold";
        if (status === 'success') {
            return `${baseClasses} bg-green-100 text-green-700`;
        } else if (status === 'failed') {
            return `${baseClasses} bg-red-100 text-red-700`;
        }
        return `${baseClasses} bg-yellow-100 text-yellow-700`;
    };

    const unreadCount = notifications.data?.filter(n => !n.read_at)?.length || 0;

    return (
        <>
            <Head title="Notifications" />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <Link
                                href="/student/dashboard"
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </Link>
                            <div className="min-w-0">
                                <h1 className="text-base sm:text-lg font-bold text-gray-900">Notifications</h1>
                                <p className="text-xs text-gray-500 truncate">
                                    {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
                    {notifications.data && notifications.data.length > 0 ? (
                        <div className="space-y-3 sm:space-y-4">
                            {notifications.data.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`border rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-colors ${
                                        notification.read_at
                                            ? 'bg-gray-50 border-gray-200'
                                            : 'bg-white border-gray-300 shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="mt-0.5 sm:mt-1 flex-shrink-0">
                                            {getTypeIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={`font-semibold text-base sm:text-lg ${notification.read_at ? 'text-gray-600' : 'text-gray-900'} break-words`}>
                                                        {notification.title}
                                                    </h3>
                                                    <p className={`text-xs sm:text-sm mt-1 sm:mt-2 ${notification.read_at ? 'text-gray-500' : 'text-gray-700'} break-words`}>
                                                        {notification.message}
                                                    </p>
                                                    {notification.metadata && notification.metadata.class_name && (
                                                        <div className="mt-2 sm:mt-3 text-xs text-gray-500 break-words">
                                                            <span>Class: {notification.metadata.class_name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className={getStatusBadge(notification.status)}>
                                                        {notification.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4 text-xs text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3 flex-shrink-0" />
                                                    <span className="break-words">{new Date(notification.created_at).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No Notifications
                            </h3>
                            <p className="text-sm text-gray-500">
                                You don't have any notifications yet.
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {notifications.links && notifications.links.length > 3 && (
                        <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-1 sm:gap-2">
                            {notifications.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => link.url && router.visit(link.url)}
                                    disabled={!link.url}
                                    className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                        link.active
                                            ? 'bg-black text-white'
                                            : link.url
                                            ? 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}

