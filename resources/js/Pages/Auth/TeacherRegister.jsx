import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function TeacherRegister() {
    const { data, setData, post, processing, errors, setError, clearErrors, reset } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        department: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        clearErrors();

        // Frontend Validation for WMSU Email
        const isWmsu = /@wmsu\.edu\.ph$/i.test(data.email);
        if (!isWmsu) {
            setError('email', 'Please use your official @wmsu.edu.ph email address.');
            return;
        }

        post(route('teacher.register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Teacher Registration" />

            <div className="mb-4 text-center">
                <h2 className="text-xl font-bold text-gray-800">Teacher Registration</h2>
                <p className="text-sm text-gray-600">Create your account using your WMSU email</p>
            </div>

            <form onSubmit={submit}>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="first_name" value="First Name" />
                        <TextInput
                            id="first_name"
                            name="first_name"
                            value={data.first_name}
                            className="mt-1 block w-full"
                            autoComplete="given-name"
                            isFocused={true}
                            onChange={(e) => setData('first_name', e.target.value)}
                            required
                        />
                        <InputError message={errors.first_name} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="last_name" value="Last Name" />
                        <TextInput
                            id="last_name"
                            name="last_name"
                            value={data.last_name}
                            className="mt-1 block w-full"
                            autoComplete="family-name"
                            onChange={(e) => setData('last_name', e.target.value)}
                            required
                        />
                        <InputError message={errors.last_name} className="mt-2" />
                    </div>
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="department" value="Department" />
                    <TextInput
                        id="department"
                        name="department"
                        value={data.department}
                        className="mt-1 block w-full"
                        autoComplete="organization"
                        placeholder="e.g. CCS, CET, CAS"
                        onChange={(e) => setData('department', e.target.value)}
                        required
                    />
                    <InputError message={errors.department} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="WMSU Email Address" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="email"
                        placeholder="username@wmsu.edu.ph"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Already registered?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Register Teacher
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}