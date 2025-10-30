import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function StudentDashboard({ student }) {
    const handleLogout = () => {
        window.location.href = '/';
    };
    return (
        <>
            <Head title="Student Dashboard" />
            <div className="min-h-screen bg-gray-100">
                <nav className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Student Dashboard
                                </h2>
                            </div>
                            <div className="flex items-center">
                                <span className="text-gray-600 mr-4">
                                    Welcome, {student.first_name}
                                </span>
                                <Button variant="outline" onClick={handleLogout}>
                                    Log Out
                                </Button>
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="py-10">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">
                                <h3 className="text-lg font-medium mb-4">Your Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Student ID</p>
                                        <p className="font-medium">{student.student_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Full Name</p>
                                        <p className="font-medium">{`${student.first_name} ${student.last_name}`}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Course</p>
                                        <p className="font-medium">{student.course}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Year & Section</p>
                                        <p className="font-medium">{`${student.year_level}-${student.section}`}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}