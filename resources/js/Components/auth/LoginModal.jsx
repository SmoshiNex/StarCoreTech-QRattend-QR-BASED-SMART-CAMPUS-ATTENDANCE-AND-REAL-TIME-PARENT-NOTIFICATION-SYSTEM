import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "@inertiajs/react";

export default function LoginModal() {
  const [activeTab, setActiveTab] = useState("student");
  
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
    teacherPost(route("teacher.login"));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div className="space-y-4 text-center">
          <img 
            src="/images/logo.jpg" 
            alt="Smart Campus Attendance" 
            className="mx-auto w-16 h-16"
          />
          <h1 className="text-2xl font-bold">Smart Campus Attendance</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
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
                onChange={e => setTeacherData("email", e.target.value)}
                className="border rounded-lg p-3"
                required
              />
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
                onChange={e => setStudentData("student_id", e.target.value)}
                className="border rounded-lg p-3"
                required
              />
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