# SupportTicket System Documentation

## Overview

The SupportTicket system is a comprehensive ticketing solution designed for healthcare environments where patients can raise support requests that are managed by healthcare managers and staff. The system follows SOLID principles and integrates seamlessly with the existing healthcare user models.

## Model Structure

### SupportTicket Properties

| Property           | Type   | Required | Description                                          |
| ------------------ | ------ | -------- | ---------------------------------------------------- |
| `ticketID`         | String | Yes      | Unique identifier (auto-generated)                   |
| `patientID`        | String | Yes      | Reference to the patient who created the ticket      |
| `issueDescription` | String | Yes      | Detailed description of the issue                    |
| `status`           | String | Yes      | Current status of the ticket                         |
| `assignedStaffID`  | String | No       | ID of the staff member assigned to handle the ticket |
| `dateCreated`      | Date   | Yes      | When the ticket was created                          |
| `priority`         | String | Yes      | Priority level of the ticket                         |
| `category`         | String | Yes      | Category/type of the issue                           |
| `resolution`       | Object | No       | Resolution details when ticket is closed             |
| `communication`    | Array  | No       | Communication history between patient and staff      |
| `attachments`      | Array  | No       | File attachments related to the ticket               |
| `escalationLevel`  | Number | No       | Current escalation level (0-3)                       |

### Status Values

- `open` - Newly created ticket
- `in_progress` - Ticket is being worked on
- `assigned` - Ticket has been assigned to staff
- `resolved` - Issue has been resolved
- `closed` - Ticket is closed (terminal state)
- `cancelled` - Ticket was cancelled (terminal state)

### Priority Levels

- `low` - Low priority issue
- `medium` - Standard priority (default)
- `high` - High priority issue
- `urgent` - Critical issue requiring immediate attention

### Categories

- `technical_issue` - Technical problems
- `billing_inquiry` - Billing and payment questions
- `appointment_issue` - Appointment-related problems
- `medical_record_access` - Access to medical records
- `prescription_issue` - Prescription-related problems
- `general_inquiry` - General questions
- `complaint` - Formal complaints
- `feedback` - Feedback and suggestions
- `emergency` - Emergency situations

## Core Methods

### 1. createTicket()

Creates a new support ticket. This method is typically called internally when a new SupportTicket instance is saved.

```javascript
const ticket = new SupportTicket({
  patientID: "PAT123",
  issueDescription: "Cannot access medical records",
  priority: "high",
  category: "medical_record_access",
});

const result = ticket.createTicket();
```

### 2. updateStatus()

Updates the ticket status with validation for valid transitions.

```javascript
const result = await ticket.updateStatus(
  "in_progress",
  "STAFF001",
  "Starting investigation"
);
```

**Valid Status Transitions:**

- `open` → `in_progress`, `assigned`, `cancelled`
- `in_progress` → `assigned`, `resolved`, `cancelled`
- `assigned` → `in_progress`, `resolved`, `cancelled`
- `resolved` → `closed`
- `closed` → (terminal state)
- `cancelled` → (terminal state)

### 3. assignStaff()

Assigns a staff member to handle the ticket.

```javascript
const result = await ticket.assignStaff(
  "STAFF001",
  "MGR001",
  "Assigning to IT team"
);
```

### 4. closeTicket()

Closes a resolved ticket with resolution details.

```javascript
const result = await ticket.closeTicket("MGR001", {
  description: "Issue resolved by resetting credentials",
  notes: "Patient can now access records successfully",
});
```

## Integration with Patient Model

### Patient Methods for Support Tickets

#### raiseSupportTicket(ticketData)

Creates a new support ticket for the patient.

```javascript
const patient = await Patient.findOne({ email: "patient@example.com" });
const ticket = await patient.raiseSupportTicket({
  issueDescription: "Cannot access my medical records",
  priority: "high",
  category: "medical_record_access",
});
```

#### viewSupportTickets(status)

Retrieves all support tickets for the patient, optionally filtered by status.

```javascript
const allTickets = await patient.viewSupportTickets();
const openTickets = await patient.viewSupportTickets("open");
```

#### addTicketCommunication(ticketID, message)

Adds a communication message to an existing ticket.

```javascript
await patient.addTicketCommunication(
  "TICKET123",
  "Thank you for the quick response!"
);
```

#### rateSupportTicket(ticketID, rating, feedback)

Rates a closed support ticket.

```javascript
await patient.rateSupportTicket("TICKET123", 5, "Excellent service!");
```

## Integration with HealthCareManager Model

### Manager Methods for Support Ticket Management

#### manageSupportTicket(ticketID, action, data)

Universal method for managing support tickets with various actions.

```javascript
// Assign ticket
await manager.manageSupportTicket("TICKET123", "assign", {
  staffID: "STAFF001",
  notes: "Assign to IT team",
});

// Update status
await manager.manageSupportTicket("TICKET123", "update_status", {
  status: "in_progress",
  notes: "Starting investigation",
});

// Close ticket
await manager.manageSupportTicket("TICKET123", "close", {
  resolution: { description: "Issue resolved" },
});
```

#### viewSupportTickets(filters)

Retrieves support tickets with optional filtering.

```javascript
const allTickets = await manager.viewSupportTickets();
const urgentTickets = await manager.viewSupportTickets({ priority: "urgent" });
const openTickets = await manager.viewSupportTickets({ status: "open" });
```

#### Specific Management Methods

- `assignTicketToStaff(ticketID, staffID, notes)`
- `updateTicketStatus(ticketID, status, notes)`
- `closeSupportTicket(ticketID, resolution)`
- `escalateSupportTicket(ticketID, reason)`
- `addTicketCommunication(ticketID, message, isInternal)`

#### getTicketStatistics(filters)

Retrieves comprehensive ticket statistics.

```javascript
const stats = await manager.getTicketStatistics({
  dateFrom: "2024-01-01",
  dateTo: "2024-01-31",
});
// Returns: totalTickets, openTickets, closedTickets,
//          averageResolutionTime, averageSatisfactionRating
```

## Advanced Features

### Communication System

- Full communication history between patients and staff
- Internal notes for staff communication
- Timestamp tracking for all communications

### Escalation System

- Automatic priority adjustment based on escalation level
- Escalation levels 0-3 with increasing priority
- Escalation tracking and history

### File Attachments

- Support for file attachments on tickets
- File metadata tracking (uploader, date, etc.)

### Tagging System

- Flexible tagging for ticket categorization
- Tag-based filtering and organization

### Performance Tracking

- Resolution time tracking
- Patient satisfaction ratings
- Performance metrics and analytics

## Database Indexes

The SupportTicket model includes optimized indexes for:

- `ticketID` (unique)
- `patientID`
- `assignedStaffID`
- `status`
- `priority`
- `dateCreated`
- `category`

## SOLID Principles Implementation

### Single Responsibility Principle (SRP)

- SupportTicket model handles only ticket-related functionality
- Patient model handles patient-specific ticket operations
- HealthCareManager handles management-specific ticket operations

### Open/Closed Principle (OCP)

- New ticket categories and statuses can be added without modifying existing code
- New ticket actions can be added through the flexible `manageSupportTicket` method

### Liskov Substitution Principle (LSP)

- All ticket management methods maintain consistent interfaces
- Subclasses can be substituted without breaking functionality

### Interface Segregation Principle (ISP)

- Each model only exposes methods relevant to its specific role
- No unnecessary dependencies between models

### Dependency Inversion Principle (DIP)

- Models depend on abstractions rather than concrete implementations
- Dynamic imports prevent circular dependencies

## Usage Examples

### Complete Ticket Lifecycle

```javascript
// 1. Patient creates ticket
const patient = await Patient.findOne({ email: "patient@example.com" });
const ticket = await patient.raiseSupportTicket({
  issueDescription: "Cannot access medical records",
  priority: "high",
  category: "medical_record_access",
});

// 2. Manager assigns ticket
const manager = await HealthCareManager.findOne({
  email: "manager@hospital.com",
});
await manager.assignTicketToStaff(
  ticket.ticketID,
  "STAFF001",
  "Assign to IT team"
);

// 3. Manager updates status
await manager.updateTicketStatus(
  ticket.ticketID,
  "in_progress",
  "Investigating issue"
);

// 4. Staff resolves issue
const supportTicket = await SupportTicket.findOne({
  ticketID: ticket.ticketID,
});
await supportTicket.updateStatus(
  "resolved",
  "STAFF001",
  "Fixed login credentials"
);

// 5. Manager closes ticket
await manager.closeSupportTicket(ticket.ticketID, {
  description: "Login issue resolved",
  notes: "Patient can now access records",
});

// 6. Patient rates service
await patient.rateSupportTicket(ticket.ticketID, 5, "Excellent service!");
```

## Error Handling

The system includes comprehensive error handling:

- Invalid status transitions are prevented
- Access control ensures patients can only access their own tickets
- Validation ensures required fields are present
- Graceful error messages for debugging

## Best Practices

1. **Always validate status transitions** before updating ticket status
2. **Use appropriate priorities** based on issue severity
3. **Provide clear communication** in all ticket interactions
4. **Close tickets with detailed resolutions** for future reference
5. **Regular monitoring** of ticket statistics for system improvement
6. **Proper escalation** for critical issues
7. **Patient feedback collection** for service improvement

This SupportTicket system provides a robust, scalable solution for managing patient support requests in healthcare environments while maintaining high code quality through SOLID principles.
