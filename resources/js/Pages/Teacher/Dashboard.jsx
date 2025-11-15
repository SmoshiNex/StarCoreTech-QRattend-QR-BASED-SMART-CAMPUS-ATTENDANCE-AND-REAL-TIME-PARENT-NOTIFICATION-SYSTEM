import { useState } from 'react';
import { Head } from '@inertiajs/react';
import Header from './DashboardUI/Header';
import WelcomeSection from './DashboardUI/WelcomeSection';
import StatsGrid from './DashboardUI/StatsGrid';
import TodayClasses from './DashboardUI/TodayClasses';

export default function TeacherDashboard({ teacher }) {
    const [stats] = useState({
        classesToday: 3,
        totalStudents: 115,
        presentToday: 107,
        absentToday: 8,
        classes: [
            {
                code: 'CS 101',
                name: 'Introduction to Programming',
                time: '8:00 AM - 10:00 AM',
                total: 45,
                present: 42,
                absent: 3,
            },
            {
                code: 'CS 201',
                name: 'Data Structure',
                time: '1:00 PM - 3:00 PM',
                total: 38,
                present: 35,
                absent: 3,
            },
            {
                code: 'CS 301',
                name: 'Algorithm Design',
                time: '3:00 PM - 5:00 PM',
                total: 32,
                present: 30,
                absent: 2,
            },
            {
                code: 'CS 401',
                name: 'Software Engineering',
                time: 'TBA',
                total: 0,
                present: 0,
                absent: 0,
            },
        ]
    });

    return (
        <>
            <Head title="Dashboard" />

            <div className="min-h-screen bg-gray-100">
                <Header />

                <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <WelcomeSection teacherName={teacher.first_name} />
                    <StatsGrid stats={stats} />
                    <TodayClasses classes={stats.classes} />
                </main>
            </div>
        </>
    );
}