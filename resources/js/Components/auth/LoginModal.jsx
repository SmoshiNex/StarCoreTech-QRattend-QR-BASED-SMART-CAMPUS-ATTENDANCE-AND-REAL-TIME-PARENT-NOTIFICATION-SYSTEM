import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm } from "@inertiajs/react";

export default function LoginModal() {
  const [activeTab, setActiveTab] = useState("student");
  
  const { data: studentData, setData: setStudentData, post: studentPost } = useForm({
    student_id: "",
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter">Welcome Back</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student" className="text-base">
              Student
            </TabsTrigger>
            <TabsTrigger value="teacher" className="text-base">
              Teacher
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID</Label>
                <Input
                  id="student_id"
                  placeholder="Enter your student ID"
                  type="text"
                  value={studentData.student_id}
                  onChange={e => setStudentData("student_id", e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  Use your unique student ID to access attendance
                </p>
              </div>
              <Button type="submit" className="w-full">
                Sign in as Student
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="teacher">
            <form onSubmit={handleTeacherSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  placeholder="teacher@wmsu.edu.ph"
                  type="email"
                  value={teacherData.email}
                  onChange={e => setTeacherData("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={teacherData.password}
                  onChange={e => setTeacherData("password", e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Sign in as Teacher
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}