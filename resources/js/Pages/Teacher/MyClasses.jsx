import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from "@/Components/ui/button";
import ClassCard from './MyClassesUI/ClassCard';
import CreateClassModal from './MyClassesUI/CreateClassModal';
import EditClassModal from './MyClassesUI/EditClassModal';
import DeleteClassModal from './MyClassesUI/DeleteClassModal';
import QRCodeModal from './MyClasses/QRCodeModal';
import ViewStudentsModal from './MyClasses/ViewStudentsModal';
import Header from './DashboardUI/Header';
import axios from 'axios';

export default function MyClasses({ classes }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [isViewStudentsModalOpen, setIsViewStudentsModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [enrolledStudents, setEnrolledStudents] = useState([]);

    const handleEdit = (classItem) => {
        setSelectedClass(classItem);
        setIsEditModalOpen(true);
    };

    const handleDelete = (classItem) => {
        setSelectedClass(classItem);
        setIsDeleteModalOpen(true);
    };

    const handleShowQR = (classItem) => {
        setSelectedClass(classItem);
        setIsQRModalOpen(true);
    };

    const handleViewStudents = async (classItem) => {
        setSelectedClass(classItem);
        try {
            const response = await axios.get(`/teacher/classes/${classItem.id}/students`);
            setEnrolledStudents(response.data);
            setIsViewStudentsModalOpen(true);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const confirmDelete = () => {
        router.delete(`/teacher/classes/${selectedClass.id}`, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedClass(null);
            },
        });
    };

    return (
        <>
            <Head title="My Classes" />
            <Header/>

            <div className="min-h-screen bg-gray-100 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">My Classes</h1>
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            + Create New Class
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {classes.map((classItem) => (
                            <ClassCard
                                key={classItem.id}
                                classItem={classItem}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onShowQR={handleShowQR}
                                onViewStudents={handleViewStudents}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <CreateClassModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <EditClassModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedClass(null);
                }}
                classItem={selectedClass}
            />

            <DeleteClassModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedClass(null);
                }}
                classItem={selectedClass}
                onConfirm={confirmDelete}
            />

            <QRCodeModal
                isOpen={isQRModalOpen}
                onClose={() => {
                    setIsQRModalOpen(false);
                    setSelectedClass(null);
                }}
                classItem={selectedClass}
            />

            <ViewStudentsModal
                isOpen={isViewStudentsModalOpen}
                onClose={() => {
                    setIsViewStudentsModalOpen(false);
                    setSelectedClass(null);
                    setEnrolledStudents([]);
                }}
                classItem={selectedClass}
                students={enrolledStudents}
            />
        </>
    );
}
