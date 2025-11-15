import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "@inertiajs/react";

export default function LoginModal() {
  const [activeTab, setActiveTab] = useState("student");
  const [teacherEmailError, setTeacherEmailError] = useState("");
  const [studentIdError, setStudentIdError] = useState("");

  const validateStudentId = (studentId) => {
    const value = (studentId || "").trim();
    if (!value) {
      setStudentIdError("Student ID is required.");
      return false
    }

    const idPattern = /^\d{4}-\d{5}$/;
    if (!idPattern.test(value)) {
      setStudentIdError("Invalid Student ID format. Please use the format YYYY-NNNNN.");
      return false;
    }

    setStudentIdError("");
    return true;
  }

  
  const validateTeacherEmail = (email) => {
    const value = (email || "").trim();
    if (!value) {
      setTeacherEmailError("Email is required.");
      return false;
    }
    const hasDigits = /\d/.test(value);
    const isWmsu = !/@wmsu\.edu\.ph$/i.test(value);
    if (hasDigits) {
      setTeacherEmailError("Email cannot contain numbers, Please use your wmsu.edu.ph email address.");
      return false;
    }

    if (isWmsu) {
      setTeacherEmailError("Please use your WMSU email address.");
      return false;
    }
    setTeacherEmailError("");
    return true;
  };

  
  const { data: studentData, setData: setStudentData, post: studentPost } = useForm({
    student_id: "",
    password:"",
  });

  const { data: teacherData, setData: setTeacherData, post: teacherPost } = useForm({
    email: "",
    password: "",
  });

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    studentPost(route("student.login"));
  };

  const handleTeacherSubmit = (e) => {
    e.preventDefault();
    if (!validateTeacherEmail(teacherData.email)) return;
    teacherPost(route("teacher.login"));
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
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-6 p-1">
            <TabsTrigger 
              value="teacher" 
              className="text-base uppercase font-bold"
            >
              Teacher
            </TabsTrigger>
            <TabsTrigger 
              value="student" 
              className="text-base uppercase font-bold"
            >
              Student
            </TabsTrigger>
          </TabsList>

          <TabsContent value="teacher">
            <form onSubmit={handleTeacherSubmit} className="space-y-4">

              <Input
                type="email"
                placeholder="example@wmsu.edu.ph"
                value={teacherData.email}
                onChange={(e) => {
                  const v = e.target.value;
                  setTeacherData("email", v);
                  validateTeacherEmail(v);
                }}
                className="border rounded-lg p-3"
                required
              />
              {teacherEmailError && (
                <p className="text-sm text-red-600">{teacherEmailError}</p>
              )}
              <Input
                type="password"
                placeholder="password"
                value={teacherData.password}
                onChange={e => setTeacherData("password", e.target.value)}
                className="border rounded-lg p-3"
                required
              />
              <div className="text-right">
                <a href={route('teacher.password.reset')} className="text-sm text-gray-600 hover:text-gray-900">
                  Forgot password?
                </a>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-black text-white rounded-lg p-3 uppercase"
              >
                Login
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="student">
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Enter your student ID"
                value={studentData.student_id}
                onChange={e => {
                  const v = e.target.value;
                  setStudentData("student_id", v);
                  validateStudentId(v);
                }}
                className="border rounded-lg p-3"
                required
              />
              {studentIdError && (
                <p className="text-sm text-red-600">{studentIdError}</p>
              )}
              <Input
                type="password"
                placeholder="password"
                value={studentData.password}
                onChange={e => setStudentData("password", e.target.value)}
                className="border rounded-lg p-3"
                required
              />
              <Button 
                type="submit" 
                className="w-full bg-black text-white rounded-lg p-3 uppercase"
              >
                Login
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}