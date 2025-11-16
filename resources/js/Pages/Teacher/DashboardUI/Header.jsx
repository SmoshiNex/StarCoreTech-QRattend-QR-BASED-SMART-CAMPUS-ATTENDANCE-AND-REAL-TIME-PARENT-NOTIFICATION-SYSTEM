import { Link } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";

export default function Header() {
    const handleLogout = () => {
        window.location.href = '/';
    };

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <img src="/images/logo.jpg" alt="Logo" className="h-10 w-10" />
                    <div>
                        <h2 className="font-semibold text-xl">Smart Campus Attendance</h2>
                        <p className="text-sm text-gray-500">Qr Attend Teacher Portal</p>
                    </div>
                </div>
                <nav className="flex items-center gap-6">
                    <Link href={route('teacher.dashboard')} className="text-gray-900 hover:text-gray-700">Dashboard</Link>
                    <Link href={route('teacher.classes')} className="text-gray-500 hover:text-gray-700">My Classes</Link>
                    <a href="#" className="text-gray-500 hover:text-gray-700">Reports</a>
                    <a href="#" className="text-gray-500 hover:text-gray-700">Notifications</a>
                    <Button variant="destructive" size="sm" onClick={handleLogout}>
                        Logout
                    </Button>
                </nav>
            </div>
        </header>
    );
}