import { Button } from "@/Components/ui/button";
import { Card } from "@/Components/ui/card";

export default function ClassCard({ classItem }) {
    return (
        <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold">{classItem.code}</h3>
                    <p className="text-gray-600">{classItem.name}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {classItem.time}
                    </div>
                </div>
                <Button variant="outline" className="hover:bg-black hover:text-white">
                    Start Attendance
                </Button>
            </div>
            <div className="flex gap-6">
                <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-bold">{classItem.total}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">Present</p>
                    <p className="font-bold">{classItem.present}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">Absent</p>
                    <p className="font-bold">{classItem.absent}</p>
                </div>
            </div>
        </Card>
    );
}