import { Head, useForm } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import { Card } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";

export default function RegisterClass({ class: classItem, auth }) {
    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        full_name: '',
        parent_email: '',
        password: '',
        password_confirmation: '',
    });

    // If user is already logged in, register directly
    const handleQuickRegister = () => {
        post(`/student/register-class/${classItem.id}`);
    };

    // For new students, register with form
    const handleRegister = (e) => {
        e.preventDefault();
        post(`/student/register-class/${classItem.id}`);
    };

    return (
        <>
            <Head title="Register for Class" />

            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8">
                    <div className="flex items-center mb-4">
                        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                            ← Back to Login
                        </Button>
                    </div>

                    <div className="text-center mb-6">
                        <div className="flex justify-center mb-3">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Class Registration</h1>
                        <p className="text-gray-600">Complete this form to enroll in the class</p>
                    </div>

                    <div className="bg-black text-white rounded-lg p-4 mb-6">
                        <p className="text-xs uppercase text-gray-400 mb-1">You are enrolling in</p>
                        <h2 className="text-lg font-bold mb-1">
                            {classItem.class_code} - {classItem.subject_name}
                        </h2>
                        <p className="text-sm text-gray-300">
                            Instructor: Prof. {classItem.teacher.last_name}
                        </p>
                        <p className="text-sm text-gray-300">{classItem.schedule}</p>
                    </div>

                    {auth?.student ? (
                        // Existing student - quick registration
                        <div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                <p className="text-green-800 font-medium">
                                    Welcome back, {auth.student.first_name}!
                                </p>
                                <p className="text-green-600 text-sm">
                                    Click below to register for this class
                                </p>
                            </div>
                            <div className="space-y-3">
                                <Button 
                                    className="w-full" 
                                    size="lg"
                                    onClick={handleQuickRegister}
                                    disabled={processing}
                                >
                                    {processing ? 'Enrolling...' : 'ENROLL IN CLASS'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        // New student - registration form
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <Label htmlFor="full_name">Full Name *</Label>
                                <Input
                                    id="full_name"
                                    placeholder="Juan Dela Cruz"
                                    value={data.full_name}
                                    onChange={e => setData('full_name', e.target.value)}
                                    required
                                />
                                {errors.full_name && (
                                    <p className="text-sm text-red-500 mt-1">{errors.full_name}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="student_id">Student ID *</Label>
                                <Input
                                    id="student_id"
                                    placeholder="2021-12345"
                                    value={data.student_id}
                                    onChange={e => setData('student_id', e.target.value)}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">This will be your username for logging in</p>
                                {errors.student_id && (
                                    <p className="text-sm text-red-500 mt-1">{errors.student_id}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="parent_email">Parent's/Guardian's Email *</Label>
                                <Input
                                    id="parent_email"
                                    type="email"
                                    placeholder="parent@example.com"
                                    value={data.parent_email}
                                    onChange={e => setData('parent_email', e.target.value)}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Attendance notifications will be sent to this email</p>
                                {errors.parent_email && (
                                    <p className="text-sm text-red-500 mt-1">{errors.parent_email}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="password">Create Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Create a secure password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                                {errors.password && (
                                    <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                                )}
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-600">
                                By submitting this form, you agree to be enrolled in {classItem.class_code} and allow the system to track your attendance and notify your parent/guardian.
                            </div>

                            <Button 
                                type="submit"
                                className="w-full" 
                                size="lg"
                                disabled={processing}
                            >
                                {processing ? 'Enrolling...' : 'ENROLL IN CLASS'}
                            </Button>
                        </form>
                    )}
                </Card>
            </div>
        </>
    );
}