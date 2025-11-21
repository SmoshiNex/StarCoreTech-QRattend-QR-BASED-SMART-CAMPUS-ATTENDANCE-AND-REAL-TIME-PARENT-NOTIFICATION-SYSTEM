import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { useForm } from '@inertiajs/react';

export default function CreateClassModal({ isOpen, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        class_code: '',
        subject_name: '',
        schedule: '',
        room: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/teacher/classes', {
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Class</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="class_code">Class Code</Label>
                        <Input
                            id="class_code"
                            placeholder="e.g., CS 101"
                            value={data.class_code}
                            onChange={e => setData('class_code', e.target.value)}
                        />
                        {errors.class_code && (
                            <p className="text-sm text-red-500">{errors.class_code}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="subject_name">Subject Name</Label>
                        <Input
                            id="subject_name"
                            placeholder="e.g., Introduction to Programming"
                            value={data.subject_name}
                            onChange={e => setData('subject_name', e.target.value)}
                        />
                        {errors.subject_name && (
                            <p className="text-sm text-red-500">{errors.subject_name}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="schedule">Schedule</Label>
                        <Input
                            id="schedule"
                            placeholder="e.g., MWF 8:00-10:00 AM"
                            value={data.schedule}
                            onChange={e => setData('schedule', e.target.value)}
                        />
                        {errors.schedule && (
                            <p className="text-sm text-red-500">{errors.schedule}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="room">Room (Optional)</Label>
                        <Input
                            id="room"
                            placeholder="e.g., Room 301"
                            value={data.room}
                            onChange={e => setData('room', e.target.value)}
                        />
                        {errors.room && (
                            <p className="text-sm text-red-500">{errors.room}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button className="bg-black hover:bg-gray-900 text-white" type="submit" disabled={processing}>
                            Create Class
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}