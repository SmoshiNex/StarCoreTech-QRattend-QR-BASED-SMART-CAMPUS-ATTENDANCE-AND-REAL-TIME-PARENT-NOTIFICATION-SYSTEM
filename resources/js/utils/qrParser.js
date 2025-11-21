/**
 * Parse attendance details from API response
 */
export function parseAttendanceResponse(data) {
    if (!data || !data.success) {
        return null;
    }

    // Format class name: class_name OR (class_code - subject_name) OR subject_name OR class_code
    let className = data.class?.class_name;
    if (!className && data.class) {
        if (data.class.class_code && data.class.subject_name) {
            className = `${data.class.class_code} - ${data.class.subject_name}`;
        } else {
            className = data.class.subject_name || data.class.class_code || "Unknown Class";
        }
    }
    if (!className) {
        className = "Unknown Class";
    }
    // Use the formatted 12-hour time from the API, or format it ourselves
    let time = data.record?.checked_in_at_formatted;
    if (!time && data.record?.checked_in_at) {
        // If we have the raw time, format it to 12-hour format
        const timeStr = data.record.checked_in_at;
        if (timeStr.includes(':')) {
            const [hours, minutes, seconds] = timeStr.split(':');
            const hour24 = parseInt(hours, 10);
            const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
            const ampm = hour24 >= 12 ? 'PM' : 'AM';
            time = `${hour12}:${minutes}:${seconds || '00'} ${ampm}`;
        }
    }
    if (!time) {
        // Fallback to current time in 12-hour format
        time = new Date().toLocaleTimeString('en-US', { 
            hour: "2-digit", 
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });
    }
    // For now, always show PRESENT in the student success modal.
    // Late / Absent flows will be handled by dedicated modals later.
    const status = 'PRESENT';
    const studentName = data.student?.name || '';
    const studentId = data.student?.student_id || '';

    return {
        className,
        time,
        status,
        studentName,
        studentId,
    };
}

