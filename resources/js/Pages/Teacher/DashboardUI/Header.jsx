import { Link } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";

const navItemClass = (isActive) =>
    `text-sm transition-colors ${
        isActive ? 'text-gray-900 font-semibold' : 'text-gray-500 hover:text-gray-700'
    }`;

export default function Header({ active = 'dashboard' }) {
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
                    <Link
                        href={route('teacher.dashboard')}
                        className={navItemClass(active === 'dashboard')}
                    >
                        Dashboard
                    </Link>
                    <Link
                        href={route('teacher.classes')}
                        className={navItemClass(active === 'classes')}
                    >
                        My Classes
                    </Link>
                    <Link
                        href={route('teacher.reports')}
                        className={navItemClass(active === 'reports')}
                    >
                        Reports
                    </Link>
                    <a
                        href="#"
                        className={navItemClass(active === 'notifications')}
                    >
                        Notifications
                    </a>
                    <Button variant="destructive" size="sm" onClick={handleLogout}>
                        Logout
                    </Button>
                </nav>
            </div>
        </header>
    );
}