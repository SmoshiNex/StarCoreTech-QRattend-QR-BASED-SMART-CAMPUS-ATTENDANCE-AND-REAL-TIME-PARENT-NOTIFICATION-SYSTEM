import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import Header from './DashboardUI/Header';
import WelcomeSection from './DashboardUI/WelcomeSection';
import StatsGrid from './DashboardUI/StatsGrid';
import TodayClasses from './DashboardUI/TodayClasses';
import LiveAttendanceModal from './MyClassesUI/LiveAttendanceModal';

export default function TeacherDashboard({ teacher, stats }) {
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);

    // Auto-open modal if there's an active session
    useEffect(() => {
        if (stats.classes) {
            const activeClass = stats.classes.find(c => c.status === 'active' && c.active_session_id);
            if (activeClass && !isAttendanceModalOpen) {
                setSelectedClass(activeClass);
                setIsAttendanceModalOpen(true);
            }
        }
    }, [stats.classes]);

    // Check for minimized sessions and show indicator
    const hasActiveSession = stats.classes?.some(c => c.status === 'active' && c.active_session_id);

    const handleStartAttendance = (classItem) => {
        setSelectedClass(classItem);
        setIsAttendanceModalOpen(true);
    };

    return (
        <>
            <Head title="Dashboard" />

            <div className="min-h-screen bg-gray-100">
                <Header active="dashboard" />

                <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <WelcomeSection teacherFirstName={teacher.first_name} teacherLastName={teacher.last_name}/>
                    <StatsGrid stats={stats} />
                    <TodayClasses classes={stats.classes} onStartAttendance={handleStartAttendance} />
                </main>
            </div>

            <LiveAttendanceModal
                isOpen={isAttendanceModalOpen}
                onClose={(shouldClose) => {
                    // If shouldClose is false, it means minimize - keep selectedClass for restore
                    if (shouldClose === false) {
                        // Minimize - keep selectedClass so we can restore
                        setIsAttendanceModalOpen(false);
                        return;
                    }
                    // Full close - clear everything
                    if (shouldClose === true || shouldClose === undefined) {
                        setIsAttendanceModalOpen(false);
                        setSelectedClass(null);
                    }
                }}
                classData={selectedClass}
            />

        </>
    );
}