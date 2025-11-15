import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Link } from '@inertiajs/react';

export default function TeacherPasswordReset() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        password_confirmation: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/teacher/reset-password', {
            onSuccess: () => {
                reset('password', 'password_confirmation');
            },
        });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="w-full max-w-md">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <div className="flex justify-center mb-6">
                        <Link href="/">
                            <img src="/logo.png" alt="Logo" className="w-16 h-16" />
                        </Link>
                    </div>

                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold">Reset Teacher Password</h2>
                        <p className="text-gray-600">Fill out the form below to reset your password</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-6">
                        <p className="text-sm text-blue-700">
                            For security, you need to verify your WMSU email address used for login.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">WMSU Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="example@wmsu.edu.ph"
                                required
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                            <p className="text-xs text-gray-500">Must be your registered WMSU email address</p>
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
                                href="/teacher/login"
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