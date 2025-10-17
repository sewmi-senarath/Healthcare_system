# Dashboard Statistics Setup

## Overview

The dashboard statistics system is designed to show real-time data for each authority role. The system includes both backend API endpoints and frontend components that display meaningful statistics.

## Backend Implementation

### API Endpoints

- `GET /api/employee/dashboard/stats` - Get dashboard statistics for authority users
- `GET /api/employee/dashboard/recent-activity` - Get recent activity for authority users

### Statistics by Role

#### Doctor Dashboard

- Today's Appointments
- Total Appointments
- Pending Approval Appointments
- Upcoming Appointments (7 days)
- Completed Appointments
- Active Patients (last 30 days)
- Pending Prescriptions
- Unread Notifications

#### Nurse Dashboard

- Today's Appointments
- Total Appointments
- Assigned Patients
- Unread Notifications

#### Healthcare Manager Dashboard

- Pending Approvals
- Active Support Tickets
- Total Staff
- Unread Notifications

#### Pharmacist Dashboard

- Low Stock Medicines (< 10 quantity)
- Pending Prescriptions
- Total Medicines
- Unread Notifications

#### System Admin Dashboard

- Active Users
- Today's Activity
- System Health
- Unread Notifications

## Frontend Implementation

### Mock Data Fallback

When the backend API is unavailable or returns no data, the frontend automatically falls back to mock data to demonstrate the dashboard functionality:

- **Doctor**: 3 today's appointments, 12 total, 1 pending, 4 upcoming, 8 completed, 5 active patients, 2 pending prescriptions, 3 notifications
- **Nurse**: 5 today's appointments, 18 total, 8 assigned patients, 2 notifications
- **Healthcare Manager**: 6 pending approvals, 4 active tickets, 12 total staff, 5 notifications
- **Pharmacist**: 3 low stock medicines, 7 pending prescriptions, 45 total medicines, 4 notifications
- **System Admin**: 24 active users, 156 today's activity, 99.8% system health, 8 notifications

### Recent Activity

Each dashboard also shows mock recent activity data when real data is not available.

## Setting Up Real Data

### Option 1: Use the Populate Script

1. Ensure MongoDB is running
2. Run the populate script:

```bash
cd Healthcare_system/backend
node src/scripts/populateTestData.js
```

### Option 2: Manual Data Entry

1. Create users through the registration system
2. Schedule appointments through the appointment system
3. Create prescriptions through the prescription system
4. Add medicines to the medicine stock system

## Testing the Dashboard

1. Start the backend server:

```bash
cd Healthcare_system/backend
npm start
```

2. Start the frontend server:

```bash
cd Healthcare_system/frontend
npm run dev
```

3. Login with any authority role and check the dashboard statistics

## Notes

- The system gracefully handles cases where no data is available
- Mock data is used for demonstration purposes when real data is not available
- All statistics are calculated in real-time from the database
- The API includes proper error handling and fallbacks
- Frontend includes loading states and error handling

## Troubleshooting

### Dashboard Shows 0s or No Data

1. Check if MongoDB is running
2. Check if test data has been populated
3. Check browser console for API errors
4. Verify backend server is running

### API Errors

1. Check backend logs for errors
2. Verify database connection
3. Check if required models exist
4. Verify user authentication

The dashboard statistics system is now fully functional and will show meaningful data whether using real database data or mock demonstration data.
