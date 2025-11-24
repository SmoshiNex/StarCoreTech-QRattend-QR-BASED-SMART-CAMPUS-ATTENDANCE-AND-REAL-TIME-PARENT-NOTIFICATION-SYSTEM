import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, Link } from "@inertiajs/react";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export default function LoginModal() {
  const [identifierError, setIdentifierError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validateIdentifier = (identifier) => {
    const value = (identifier || "").trim();
    if (!value) {
      setIdentifierError("Email or Student ID is required.");
      return false;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    
    if (isEmail) {
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
      onError: () => {},
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50/50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-100 p-6 sm:p-8 space-y-6">
        
        <div className="space-y-2 text-center">
          <div className="inline-block p-3 rounded-full bg-gray-50 mb-2">
              <img 
                src="/images/logo.jpg" 
                alt="Smart Campus Attendance" 
                className="w-12 h-12 rounded-full object-cover"
              />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome Back</h1>
          <p className="text-sm text-gray-500">Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Input
              type="text"
              placeholder="Student ID or Teacher Email (@wmsu.edu.ph)"
              value={loginData.identifier}
              onChange={(e) => {
                const v = e.target.value;
                setLoginData("identifier", v);
                if (v.includes('@')) validateIdentifier(v);
                else setIdentifierError("");
              }}
              onBlur={(e) => validateIdentifier(e.target.value)}
              className="h-11 border-gray-200 focus:border-black focus:ring-black rounded-lg"
              required
            />
            {(identifierError || loginErrors.identifier) && (
              <p className="text-xs text-red-600 font-medium ml-1">
                {identifierError || loginErrors.identifier}
              </p>
            )}
          </div>

          <div className="relative space-y-1">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={loginData.password}
              onChange={e => setLoginData("password", e.target.value)}
              className="h-11 border-gray-200 focus:border-black focus:ring-black rounded-lg pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
            {loginErrors.password && (
               <p className="text-xs text-red-600 font-medium ml-1">{loginErrors.password}</p>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <Link
                href={route('student.password.reset')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
                Forgot Password?
            </Link>
          </div>

          {loginErrors.message && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center font-medium">
                {loginErrors.message}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-11 bg-black hover:bg-gray-800 text-white rounded-lg font-medium transition-all shadow-sm disabled:opacity-70 mt-2"
            disabled={loginProcessing}
          >
            {loginProcessing ? "Logging in..." : "Sign In"}
          </Button>
          
          <div className="pt-4 text-center border-t border-gray-100 mt-6">
            <Link
                href={route('teacher.register')}
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black font-medium transition-colors"
            >
                <UserPlus className="w-4 h-4" />
                <span>Create Instructor Account</span>
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}