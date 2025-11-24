import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, Link } from "@inertiajs/react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginModal() {
  const [identifierError, setIdentifierError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validateIdentifier = (identifier) => {
    const value = (identifier || "").trim();
    if (!value) {
      setIdentifierError("Email or Student ID is required.");
      return false;
    }

    // Check if it's an email (basic check)
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    
    if (isEmail) {
      // STRICT VALIDATION: Must be wmsu.edu.ph for teachers
      const isWmsu = /@wmsu\.edu\.ph$/i.test(value);
      
      if (!isWmsu) {
        setIdentifierError("Only official @wmsu.edu.ph emails are allowed for teachers.");
        return false;
      }
    } 

    setIdentifierError("");
    return true;
  };

  const {
    data: loginData,
    setData: setLoginData,
    post: loginPost,
    processing: loginProcessing,
    errors: loginErrors,
  } = useForm({
    identifier: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateIdentifier(loginData.identifier)) return;
    
    loginPost(route("unified.login"), {
      preserveScroll: true,
      onError: () => {
        // Keep validation errors visible
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div className="space-y-4 text-center">
          <img 
            src="/images/logo.jpg" 
            alt="Smart Campus Attendance" 
            className="mx-auto w-16 h-16 rounded-full"
          />
          <h1 className="text-2xl font-bold">Smart Campus Attendance QRattend</h1>
          <p className="text-sm text-gray-600">Login with your WMSU Email or Student ID</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Teacher Email (@wmsu.edu.ph) or Student ID"
              value={loginData.identifier}
              onChange={(e) => {
                const v = e.target.value;
                setLoginData("identifier", v);
                // Optional: Validate as they type or just on blur/submit to be less annoying
                if (v.includes('@')) validateIdentifier(v);
                else setIdentifierError(""); // Clear error if they might be typing a student ID
              }}
              onBlur={(e) => validateIdentifier(e.target.value)}
              className="border rounded-lg p-3"
              required
            />
            {(identifierError || loginErrors.identifier) && (
              <p className="text-sm text-red-600 mt-1">
                {identifierError || loginErrors.identifier}
              </p>
            )}
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={loginData.password}
              onChange={e => setLoginData("password", e.target.value)}
              className="border rounded-lg p-3 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link
                href={route('student.password.reset')}
                className="text-blue-600 hover:text-blue-800 font-semibold"
            >
                Forgot Password?
            </Link>

            <Link
                href={route('teacher.register')}
                className="text-blue-600 hover:text-blue-800 font-semibold"
            >
                Create Teacher Account
            </Link>
          </div>

          {loginErrors.message && (
            <p className="text-sm text-red-600 text-center">{loginErrors.message}</p>
          )}

          <Button 
            type="submit" 
            className="w-full bg-black text-white rounded-lg p-3 uppercase disabled:opacity-70"
            disabled={loginProcessing}
          >
            {loginProcessing ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}