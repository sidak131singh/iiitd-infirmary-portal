# Student Portal APIs Documentation

## Overview
This document describes all the APIs created for the Student Portal functionality, including fetching appointments, booking appointments, managing appointments, and updating student profiles.

---

## API Endpoints

### 1. Get Available Doctors
**Endpoint:** `GET /api/doctors`  
**Authentication:** Required (any authenticated user)  
**Description:** Fetches list of all available doctors in the system.

#### Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "doctor-id-1",
      "name": "Dr. John Smith",
      "email": "john.smith@iiitd.ac.in"
    },
    {
      "id": "doctor-id-2",
      "name": "Dr. Sarah Johnson",
      "email": "sarah.johnson@iiitd.ac.in"
    }
  ]
}
```

---

### 2. Get All Appointments
**Endpoint:** `GET /api/student/appointments`  
**Authentication:** Required (STUDENT role)  
**Description:** Fetches all appointments for the authenticated student with optional filtering.

#### Query Parameters:
- `status` (optional): Filter by appointment status (PENDING, CONFIRMED, COMPLETED, CANCELLED)
- `upcoming` (optional): Set to 'true' to fetch only upcoming appointments

#### Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "appointment-id",
      "date": "2025-10-15T10:00:00.000Z",
      "timeSlot": "10:00 AM - 10:30 AM",
      "reason": "Regular checkup",
      "status": "PENDING",
      "studentId": "student-id",
      "doctorId": "doctor-id",
      "doctor": {
        "id": "doctor-id",
        "name": "Dr. John Smith",
        "email": "doctor@iiitd.ac.in"
      }
    }
  ]
}
```

---

---

### 2. Get All Appointments
**Endpoint:** `GET /api/student/appointments`  
**Authentication:** Required (STUDENT role)  
**Description:** Fetches all appointments for the authenticated student with optional filtering.

#### Query Parameters:
- `status` (optional): Filter by appointment status (PENDING, CONFIRMED, COMPLETED, CANCELLED)
- `upcoming` (optional): Set to 'true' to fetch only upcoming appointments

#### Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "appointment-id",
      "date": "2025-10-15T10:00:00.000Z",
      "timeSlot": "10:00 AM - 10:30 AM",
      "reason": "Regular checkup",
      "status": "PENDING",
      "studentId": "student-id",
      "doctorId": "doctor-id",
      "doctor": {
        "id": "doctor-id",
        "name": "Dr. John Smith",
        "email": "doctor@iiitd.ac.in"
      }
    }
  ]
}
```

---

### 3. Book Appointment
**Endpoint:** `POST /api/student/appointments`  
**Authentication:** Required (STUDENT role)  
**Description:** Books a new appointment with a doctor.

#### Request Body:
```json
{
  "doctorId": "doctor-id",
  "date": "2025-10-15T10:00:00.000Z",
  "timeSlot": "10:00 AM - 10:30 AM",
  "reason": "Regular checkup"
}
```

#### Validations:
- All fields are required
- Date must be in the future
- Doctor must exist and have DOCTOR role
- Time slot must not be already booked

#### Response (Success - 201):
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "id": "appointment-id",
    "date": "2025-10-15T10:00:00.000Z",
    "timeSlot": "10:00 AM - 10:30 AM",
    "reason": "Regular checkup",
    "status": "PENDING",
    "doctor": {
      "id": "doctor-id",
      "name": "Dr. John Smith",
      "email": "doctor@iiitd.ac.in"
    }
  }
}
```

#### Response (Error - 409):
```json
{
  "error": "This time slot is already booked. Please choose another time."
}
```

---

### 3. Book Appointment
**Endpoint:** `POST /api/student/appointments`  
**Authentication:** Required (STUDENT role)  
**Description:** Books a new appointment with a doctor.

#### Request Body:
```json
{
  "doctorId": "doctor-id",
  "date": "2025-10-15T10:00:00.000Z",
  "timeSlot": "10:00 AM - 10:30 AM",
  "reason": "Regular checkup"
}
```

#### Validations:
- All fields are required
- Date must be in the future
- Doctor must exist and have DOCTOR role
- Time slot must not be already booked

#### Response (Success - 201):
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "id": "appointment-id",
    "date": "2025-10-15T10:00:00.000Z",
    "timeSlot": "10:00 AM - 10:30 AM",
    "reason": "Regular checkup",
    "status": "PENDING",
    "doctor": {
      "id": "doctor-id",
      "name": "Dr. John Smith",
      "email": "doctor@iiitd.ac.in"
    }
  }
}
```

#### Response (Error - 409):
```json
{
  "error": "This time slot is already booked. Please choose another time."
}
```

---

### 4. Get Single Appointment
**Endpoint:** `GET /api/student/appointments/[id]`  
**Authentication:** Required (STUDENT role)  
**Description:** Fetches details of a specific appointment including prescription if available.

#### Response:
```json
{
  "success": true,
  "data": {
    "id": "appointment-id",
    "date": "2025-10-15T10:00:00.000Z",
    "timeSlot": "10:00 AM - 10:30 AM",
    "reason": "Regular checkup",
    "status": "COMPLETED",
    "notes": "Patient shows improvement",
    "doctor": {
      "id": "doctor-id",
      "name": "Dr. John Smith",
      "email": "doctor@iiitd.ac.in"
    },
    "prescription": {
      "id": "prescription-id",
      "diagnosis": "Common cold",
      "medications": "..."
    }
  }
}
```

---

### 4. Get Single Appointment
**Endpoint:** `GET /api/student/appointments/[id]`  
**Authentication:** Required (STUDENT role)  
**Description:** Fetches details of a specific appointment including prescription if available.

#### Response:
```json
{
  "success": true,
  "data": {
    "id": "appointment-id",
    "date": "2025-10-15T10:00:00.000Z",
    "timeSlot": "10:00 AM - 10:30 AM",
    "reason": "Regular checkup",
    "status": "COMPLETED",
    "notes": "Patient shows improvement",
    "doctor": {
      "id": "doctor-id",
      "name": "Dr. John Smith",
      "email": "doctor@iiitd.ac.in"
    },
    "prescription": {
      "id": "prescription-id",
      "diagnosis": "Common cold",
      "medications": "..."
    }
  }
}
```

---

### 5. Cancel Appointment
**Endpoint:** `PATCH /api/student/appointments/[id]`  
**Authentication:** Required (STUDENT role)  
**Description:** Cancels an existing appointment.

#### Request Body:
```json
{
  "status": "CANCELLED"
}
```

#### Validations:
- Only appointments belonging to the student can be cancelled
- Cannot cancel already cancelled appointments
- Cannot cancel completed appointments
- Cannot cancel past appointments

#### Response:
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": {
    "id": "appointment-id",
    "status": "CANCELLED",
    "doctor": {
      "id": "doctor-id",
      "name": "Dr. John Smith",
      "email": "doctor@iiitd.ac.in"
    }
  }
}
```

---

### 5. Cancel Appointment
**Endpoint:** `PATCH /api/student/appointments/[id]`  
**Authentication:** Required (STUDENT role)  
**Description:** Cancels an existing appointment.

#### Request Body:
```json
{
  "status": "CANCELLED"
}
```

#### Validations:
- Only appointments belonging to the student can be cancelled
- Cannot cancel already cancelled appointments
- Cannot cancel completed appointments
- Cannot cancel past appointments

#### Response:
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "data": {
    "id": "appointment-id",
    "status": "CANCELLED",
    "doctor": {
      "id": "doctor-id",
      "name": "Dr. John Smith",
      "email": "doctor@iiitd.ac.in"
    }
  }
}
```

---

### 6. Delete Appointment
**Endpoint:** `DELETE /api/student/appointments/[id]`  
**Authentication:** Required (STUDENT role)  
**Description:** Permanently deletes a pending appointment.

#### Validations:
- Only PENDING appointments can be deleted
- For other statuses, use PATCH to cancel instead

#### Response:
```json
{
  "success": true,
  "message": "Appointment deleted successfully"
}
```

---

### 6. Delete Appointment
**Endpoint:** `DELETE /api/student/appointments/[id]`  
**Authentication:** Required (STUDENT role)  
**Description:** Permanently deletes a pending appointment.

#### Validations:
- Only PENDING appointments can be deleted
- For other statuses, use PATCH to cancel instead

#### Response:
```json
{
  "success": true,
  "message": "Appointment deleted successfully"
}
```

---

### 7. Get Next Appointment
**Endpoint:** `GET /api/student/next-appointment`  
**Authentication:** Required (STUDENT role)  
**Description:** Fetches the student's next upcoming appointment.

#### Response:
```json
{
  "success": true,
  "data": {
    "id": "appointment-id",
    "date": "2025-10-15T10:00:00.000Z",
    "timeSlot": "10:00 AM - 10:30 AM",
    "reason": "Regular checkup",
    "status": "CONFIRMED",
    "doctor": {
      "id": "doctor-id",
      "name": "Dr. John Smith",
      "email": "doctor@iiitd.ac.in"
    }
  }
}
```

---

### 7. Get Next Appointment
**Endpoint:** `GET /api/student/next-appointment`  
**Authentication:** Required (STUDENT role)  
**Description:** Fetches the student's next upcoming appointment.

#### Response:
```json
{
  "success": true,
  "data": {
    "id": "appointment-id",
    "date": "2025-10-15T10:00:00.000Z",
    "timeSlot": "10:00 AM - 10:30 AM",
    "reason": "Regular checkup",
    "status": "CONFIRMED",
    "doctor": {
      "id": "doctor-id",
      "name": "Dr. John Smith",
      "email": "doctor@iiitd.ac.in"
    }
  }
}
```

---

### 8. Get Appointment Count
**Endpoint:** `GET /api/student/appointments/count`  
**Authentication:** Required (STUDENT role)  
**Description:** Returns total appointment count and breakdown by status.

#### Response:
```json
{
  "success": true,
  "data": {
    "total": 25,
    "pending": 2,
    "confirmed": 3,
    "completed": 18,
    "cancelled": 2
  }
}
```

---

### 8. Get Appointment Count
**Endpoint:** `GET /api/student/appointments/count`  
**Authentication:** Required (STUDENT role)  
**Description:** Returns total appointment count and breakdown by status.

#### Response:
```json
{
  "success": true,
  "data": {
    "total": 25,
    "pending": 2,
    "confirmed": 3,
    "completed": 18,
    "cancelled": 2
  }
}
```

---

### 9. Get Student Profile
**Endpoint:** `GET /api/student/profile`  
**Authentication:** Required (STUDENT role)  
**Description:** Fetches the student's profile information.

#### Response:
```json
{
  "success": true,
  "data": {
    "id": "student-id",
    "name": "John Doe",
    "email": "john.doe@iiitd.ac.in",
    "studentId": "2021001",
    "phone": "+91 98765 43210",
    "bloodGroup": "O+",
    "pastMedicalHistory": "No significant history",
    "currentMedications": "None",
    "height": 175.5,
    "weight": 70.2,
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

---

### 9. Get Student Profile
**Endpoint:** `GET /api/student/profile`  
**Authentication:** Required (STUDENT role)  
**Description:** Fetches the student's profile information.

#### Response:
```json
{
  "success": true,
  "data": {
    "id": "student-id",
    "name": "John Doe",
    "email": "john.doe@iiitd.ac.in",
    "studentId": "2021001",
    "phone": "+91 98765 43210",
    "bloodGroup": "O+",
    "pastMedicalHistory": "No significant history",
    "currentMedications": "None",
    "height": 175.5,
    "weight": 70.2,
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

---

### 10. Update Student Profile
**Endpoint:** `PUT /api/student/profile` or `PATCH /api/student/profile`  
**Authentication:** Required (STUDENT role)  
**Description:** Updates the student's profile information.

#### Request Body (all fields optional):
```json
{
  "name": "John Doe",
  "phone": "+91 98765 43210",
  "bloodGroup": "O+",
  "pastMedicalHistory": "Updated medical history",
  "currentMedications": "Updated medications",
  "height": 175.5,
  "weight": 70.2
}
```

#### Validations:
- `height`: Must be between 0 and 300 cm
- `weight`: Must be between 0 and 500 kg
- `bloodGroup`: Must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-, unknown
- `email` and `studentId` cannot be updated

#### Response:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "student-id",
    "name": "John Doe",
    "email": "john.doe@iiitd.ac.in",
    "studentId": "2021001",
    "phone": "+91 98765 43210",
    "bloodGroup": "O+",
    "pastMedicalHistory": "Updated medical history",
    "currentMedications": "Updated medications",
    "height": 175.5,
    "weight": 70.2,
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Authentication

All endpoints require authentication using NextAuth sessions. The session must include:
- `user.id`: The authenticated user's ID
- `user.role`: Must be "STUDENT"

Include the session cookie in requests. The API will automatically verify the session and role.

---

## Frontend Integration

The student profile page has been updated to:
1. Fetch profile data on page load
2. Display loading states with skeleton UI
3. Submit updates via PUT request
4. Show success/error toast notifications
5. Disable submit button while saving

The student dashboard has been updated to:
1. Fetch next appointment and appointment counts
2. Display real-time data instead of mock data
3. Show loading states with skeleton UI
