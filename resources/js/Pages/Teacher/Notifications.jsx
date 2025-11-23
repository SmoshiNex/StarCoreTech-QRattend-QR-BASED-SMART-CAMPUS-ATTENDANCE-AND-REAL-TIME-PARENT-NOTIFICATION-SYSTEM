import { Head, router, Link } from '@inertiajs/react';
import { Bell, CheckCircle, XCircle, Clock, Mail, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import Header from './DashboardUI/Header';

export default function TeacherNotifications({ notifications, teacher }) {
    const [markingAsRead, setMarkingAsRead] = useState(false);

    const getTypeIcon = (type) => {
        switch (type) {
            case 'attendance':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'email_sent':
                return <Mail className="w-5 h-5 text-blue-500" />;
            case 'email_failed':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Bell className="w-5 h-5 text-gray-500" />;
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

    const handleMarkAsRead = async (id) => {
        try {
            await fetch(`/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                credentials: 'include',
            });
            router.reload();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        setMarkingAsRead(true);
        try {
            await fetch('/notifications/read-all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({ user_type: 'teacher' }),
                credentials: 'include',
            });
            router.reload();
        } catch (error) {
            console.error('Error marking all as read:', error);
        } finally {
            setMarkingAsRead(false);
        }
    };

    const unreadCount = notifications.data?.filter(n => !n.read_at)?.length || 0;

    return (
        <>
            <Head title="Notifications" />
            <div className="min-h-screen bg-gray-100">
                <Header active="notifications" />

                <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                                </p>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    disabled={markingAsRead}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                    <span>Mark all as read</span>
                                </button>
                            )}
                        </div>

                        {notifications.data && notifications.data.length > 0 ? (
                            <div className="space-y-4">
                                {notifications.data.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`border rounded-lg p-4 transition-colors ${
                                            notification.read_at
                                                ? 'bg-gray-50 border-gray-200'
                                                : 'bg-white border-gray-300 shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1">
                                                {getTypeIcon(notification.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className={`font-semibold ${notification.read_at ? 'text-gray-600' : 'text-gray-900'}`}>
                                                            {notification.title}
                                                        </h3>
                                                        <p className={`text-sm mt-1 ${notification.read_at ? 'text-gray-500' : 'text-gray-700'}`}>
                                                            {notification.message}
                                                        </p>
                                                        {notification.metadata && (
                                                            <div className="mt-2 text-xs text-gray-500">
                                                                {notification.metadata.class_name && (
                                                                    <span>Class: {notification.metadata.class_name}</span>
                                                                )}
                                                                {notification.metadata.student_name && (
                                                                    <span className="ml-4">Student: {notification.metadata.student_name}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={getStatusBadge(notification.status)}>
                                                            {notification.status}
                                                        </span>
                                                        {!notification.read_at && (
                                                            <button
                                                                onClick={() => handleMarkAsRead(notification.id)}
                                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                                title="Mark as read"
                                                            >
                                                                <CheckCircle className="w-4 h-4 text-gray-400" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{new Date(notification.created_at).toLocaleString()}</span>
                                                    </div>
                                                    {notification.read_at && (
                                                        <span className="text-green-600">Read</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
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
                            <div className="mt-6 flex justify-center gap-2">
                                {notifications.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => link.url && router.visit(link.url)}
                                        disabled={!link.url}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                    </div>
                </main>
            </div>
        </>
    );
}

