import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

export default function StudentPasswordReset() {
    const { data, setData, post, processing, errors, reset } = useForm({
        student_id: '',
        parent_email: '',
        password: '',
        password_confirmation: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/student/reset-password', {
            onSuccess: () => {
                reset('password', 'password_confirmation');
            },
        });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="w-full max-w-md relative">
                <div className="absolute top-0 right-0 z-10 ">
                    <Link
                        href={route('teacher.password.reset')}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center gap-1"
                    >
                        Forgot Password Teachers
                        <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-md">
                    <div className="flex justify-center mb-6">
                        <Link href="/">
                            <img src="/images/logo.jpg" alt="Logo" className="w-16 h-16" />
                        </Link>
                    </div>

                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold">Reset Student Password</h2>
                        <p className="text-gray-600">Reset your password using your parent email</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-6">
                        <p className="text-sm text-blue-700">
                            For security, you need to verify your Student ID and provide your registered parent email address.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="student_id">Student ID *</Label>
                            <Input
                                id="student_id"
                                type="text"
                                value={data.student_id}
                                onChange={(e) => setData('student_id', e.target.value)}
                                placeholder="Enter your student ID"
                                required
                            />
                            {errors.student_id && <p className="text-sm text-red-500">{errors.student_id}</p>}
                            <p className="text-xs text-gray-500">Your unique student identification number</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="parent_email">Parent Email Address *</Label>
                            <Input
                                id="parent_email"
                                type="email"
                                value={data.parent_email}
                                onChange={(e) => setData('parent_email', e.target.value)}
                                placeholder="parent@example.com"
                                required
                            />
                            {errors.parent_email && <p className="text-sm text-red-500">{errors.parent_email}</p>}
                            <p className="text-xs text-gray-500">Must match the email registered with your account</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">New Password *</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="enter new password"
                                required
                                minLength={8}
                            />
                            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                            <p className="text-xs text-gray-500">Minimum 8 characters</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">Confirm New Password *</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="re-enter new password"
                                required
                                minLength={8}
                            />
                            {errors.password_confirmation && (
                                <p className="text-sm text-red-500">{errors.password_confirmation}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-black hover:bg-gray-800"
                            disabled={processing}
                        >
                            RESET PASSWORD
                        </Button>

                        <div className="text-center mt-4">
                            <Link
                                href="/"
                                className="text-sm text-gray-600 hover:text-gray-900"
                            >
                                ← Back to Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}