# Smart Leave Management System

## Overview
Smart Leave Management System is an internal HR portal designed to streamline employee leave management processes. The application enables employees to apply for leave, managers to review and approve or reject requests, and HR administrators to monitor employee leave information and generate leave reports.
The system follows a role-based workflow and enforces important business rules such as leave balance validation, date overlap detection, and approval-based leave deduction.

### Features

#### Authentication & Security
- JWT Authentication
- Role-Based Authorization
- Secure API Endpoints
- Claims-Based Identity

#### Employee Features
- Login to the system
- Apply for leave
- View leave balances
- View leave request history
- Cancel pending leave requests

#### Manager Features
- View team leave requests
- Approve leave requests
- Reject leave requests

#### HR Admin Features
- View all employees
- Access monthly leave summaries

### Business Rules
- Employees cannot apply for leave in the past
- End date cannot be earlier than start date
- Overlapping leave requests are not allowed
- Leave balance is checked during approval
- Leave balance is deducted only after approval
- Rejected or cancelled leaves do not deduct balance
- Managers cannot approve already rejected or cancelled requests
- Employees can access only their own leave records