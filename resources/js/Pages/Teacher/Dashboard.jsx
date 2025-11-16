import { useState } from 'react';
import { Head } from '@inertiajs/react';
import Header from './DashboardUI/Header';
import WelcomeSection from './DashboardUI/WelcomeSection';
import StatsGrid from './DashboardUI/StatsGrid';
import TodayClasses from './DashboardUI/TodayClasses';
import LiveAttendanceModal from './MyClassesUI/LiveAttendanceModal';

export default function TeacherDashboard({ teacher, stats }) {
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);

    const handleStartAttendance = (classItem) => {
        setSelectedClass(classItem);
        setIsAttendanceModalOpen(true);
    };

    return (
        <>
            <Head title="Dashboard" />

            <div className="min-h-screen bg-gray-100">
                <Header />

                <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <WelcomeSection teacherFirstName={teacher.first_name} teacherLastName={teacher.last_name}/>
                    <StatsGrid stats={stats} />
                    <TodayClasses classes={stats.classes} onStartAttendance={handleStartAttendance} />
                </main>
            </div>

            <LiveAttendanceModal
                isOpen={isAttendanceModalOpen}
                onClose={() => {
                    setIsAttendanceModalOpen(false);
                    setSelectedClass(null);
                }}
                classData={selectedClass}
            />
        </>
    );
}