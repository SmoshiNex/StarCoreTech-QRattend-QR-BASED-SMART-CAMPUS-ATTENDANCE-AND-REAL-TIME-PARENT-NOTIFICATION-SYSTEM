import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "@inertiajs/react";

export default function LoginModal() {
  const [identifierError, setIdentifierError] = useState("");

  const validateIdentifier = (identifier) => {
    const value = (identifier || "").trim();
    if (!value) {
      setIdentifierError("Email or Student ID is required.");
      return false;
    }

    // Check if it's an email
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    
    if (isEmail) {
      // Validate WMSU email for teachers
      const isWmsu = /@wmsu\.edu\.ph$/i.test(value);
      if (!isWmsu) {
        setIdentifierError("Please use your WMSU email address.");
        return false;
      }
    } else {
      // Validate student ID format (optional - can be flexible)
      // Allow any format, backend will handle validation
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
          <p className="text-sm text-gray-600">Login with your email or student ID</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Email (teacher) or Student ID"
              value={loginData.identifier}
              onChange={(e) => {
                const v = e.target.value;
                setLoginData("identifier", v);
                validateIdentifier(v);
              }}
              className="border rounded-lg p-3"
              required
            />
            {(identifierError || loginErrors.identifier) && (
              <p className="text-sm text-red-600 mt-1">
                {identifierError || loginErrors.identifier}
              </p>
            )}
          </div>

          <div>
            <Input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={e => setLoginData("password", e.target.value)}
              className="border rounded-lg p-3"
              required
            />
            {loginErrors.password && (
              <p className="text-sm text-red-600 mt-1">{loginErrors.password}</p>
            )}
          </div>

          <div className="text-right">
            <a href={route('teacher.password.reset')} className="text-sm text-gray-600 hover:text-gray-900">
              Forgot password?
            </a>
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