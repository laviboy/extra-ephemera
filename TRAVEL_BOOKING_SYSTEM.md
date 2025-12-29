# Travel Group Booking System - Implementation Guide

## Overview
A complete booking and reservation system for travel groups that allows travelers to request to join trips, agents to manage requests, and both parties to communicate throughout the booking process.

## Booking Flow

### 1. **Traveler Requests to Join**
- Traveler browses travel groups and clicks "Reserve Your Spot"
- Fills out optional message explaining why they want to join
- System creates booking record with status: `pending`
- Agent receives notification

### 2. **Agent Reviews Request**
- Agent sees request in CRM dashboard under "Travel Group Bookings"
- Can view traveler's profile and message
- Options:
  - **Accept**: Creates conversation, status → `accepted`, traveler notified
  - **Reject**: Status → `rejected`, traveler notified

### 3. **Deposit Payment (Mock)**
- After acceptance, traveler sees "Pay Deposit" button
- Clicks button to simulate payment
- Status → `deposit_pending`
- Agent receives notification

### 4. **Agent Confirms Booking**
- Agent verifies deposit received
- Clicks "Confirm Deposit Received"
- Status → `confirmed`
- Traveler officially joined the group

### 5. **Communication**
- Conversation automatically created when booking accepted
- Both parties can chat through the booking detail page
- Notifications sent for new messages

## Database Schema

### `travel_group_bookings` Table
Tracks all booking requests and their status.

```sql
- id: serial PRIMARY KEY
- listing_id: text (FK to listings)
- traveler_id: text (FK to users)
- agent_id: text (FK to users)
- conversation_id: text (FK to conversations, nullable)
- status: text (pending, accepted, hold, deposit_pending, confirmed, cancelled, rejected)
- deposit_amount: integer
- deposit_paid: boolean
- traveler_notes: text (Why they want to join)
- agent_notes: text (Internal notes)
- requested_at: timestamp
- accepted_at: timestamp
- confirmed_at: timestamp
- cancelled_at: timestamp
- created_at: timestamp
- updated_at: timestamp
```

### `notifications` Table
System-wide notifications for both travelers and agents.

```sql
- id: serial PRIMARY KEY
- user_id: text (FK to users)
- type: text (booking_request, booking_accepted, booking_rejected, deposit_required, booking_confirmed, message_received)
- title: text
- message: text
- related_id: integer (booking id, conversation id, etc.)
- related_type: text (booking, conversation, message)
- action_url: text (Where to navigate when clicked)
- read: boolean
- created_at: timestamp
```

## API Endpoints

### Bookings
- `GET /api/travel-bookings` - Get bookings (query: ?role=agent|traveler, ?status=pending)
- `POST /api/travel-bookings` - Create new booking request
- `GET /api/travel-bookings/[id]` - Get specific booking with details
- `PATCH /api/travel-bookings/[id]` - Update booking status

### Notifications
- `GET /api/notifications` - Get all notifications for current user
- `PATCH /api/notifications/[id]` - Mark notification as read
- `POST /api/notifications/mark-all-read` - Mark all as read

## Frontend Components

### Traveler-Facing
1. **ReserveSpotButton** (`src/components/travel/ReserveSpotButton.tsx`)
   - Shows on travel group detail page
   - Handles booking request creation
   - Shows different states based on existing booking

2. **BookingDetail** (`src/components/travel/BookingDetail.tsx`)
   - View booking status and timeline
   - Mock payment interface
   - Chat with agent
   - Accessible at `/travel-bookings/[id]`

### Agent-Facing (CRM)
3. **TravelBookingsList** (`src/components/crm/pages/travel-bookings/List.tsx`)
   - Manage all travel group booking requests
   - Accept/reject bookings
   - Confirm deposit payments
   - Filter by status
   - Accessible at `/crm/travel-bookings`

### Shared
4. **NotificationBell** (`src/components/layout/NotificationBell.tsx`)
   - Real-time notifications (polls every 30s)
   - Shows booking updates
   - Click to navigate to related page

## Status States

| Status | Description | Who Can Set | Next Actions |
|--------|-------------|-------------|--------------|
| `pending` | Initial request submitted | System | Agent: Accept or Reject |
| `accepted` | Agent accepted request | Agent | Traveler: Pay Deposit |
| `hold` | Spot reserved, awaiting deposit | Agent | Traveler: Pay Deposit |
| `deposit_pending` | Payment submitted, awaiting confirmation | Traveler | Agent: Confirm Deposit |
| `confirmed` | Booking complete, traveler joined | Agent | None (trip booked) |
| `rejected` | Agent declined request | Agent | None (can request again) |
| `cancelled` | Either party cancelled | Both | None |

## Key Features

### 1. **Smart Booking Button**
- Checks for existing bookings automatically
- Shows current status if booking exists
- Redirects to booking detail page
- Requires login (redirects to sign-up if not logged in)

### 2. **CRM Integration**
- Bookings section in agent dashboard
- Stats: Total, Pending, Awaiting Deposit, Confirmed
- Filter by status tabs
- Quick actions on each booking card
- Links to conversations

### 3. **Notification System**
- Real-time updates (30-second polling)
- Click notifications to navigate to relevant page
- Mark as read functionality
- Unread count badge
- Different icons for different notification types

### 4. **Mock Payment**
- Simple button click simulates payment
- Updates status immediately
- Notifies agent
- No actual payment processing

### 5. **Communication**
- Automatic conversation creation on acceptance
- Integrated chat in booking detail page
- Can also access via CRM conversations
- Linked to booking context

## Database Migration

Run this SQL to set up the tables:

```bash
# Apply the migration
psql your_database < drizzle/0006_add_booking_system.sql
```

Or if using Drizzle:

```bash
npm run db:push
```

## Testing the Flow

### As a Traveler:
1. Browse to any travel group page (e.g., `/travel/[slug]`)
2. Click "Reserve Your Spot"
3. Enter optional message, click "Send Request"
4. You'll be redirected to booking detail page
5. Wait for agent to accept (or simulate in CRM)
6. Once accepted, click "Pay Deposit" button
7. Wait for confirmation

### As an Agent:
1. Go to CRM dashboard at `/crm/travel-bookings`
2. See pending booking requests
3. Click "Accept" on a booking
4. Wait for traveler to submit payment (or simulate)
5. Click "Confirm Deposit Received"
6. Booking is now confirmed

## Future Enhancements

- Real payment integration (Stripe, PayPal)
- Email notifications
- SMS notifications
- Automatic reminders for pending deposits
- Cancellation with refund logic
- Review system after trip completion
- Group capacity tracking (decrement available spots)
- Waitlist functionality
- Multiple payment installments
- Document uploads (passport, insurance)
- Video chat integration
- Calendar sync

## Files Created/Modified

### New Files:
- `drizzle/0006_add_booking_system.sql` - Database migration
- `src/db/schema/travelGroupBookings.ts` - Drizzle schema
- `src/pages/api/travel-bookings/index.ts` - Bookings API
- `src/pages/api/travel-bookings/[id].ts` - Single booking API
- `src/pages/api/notifications/index.ts` - Notifications API
- `src/components/travel/ReserveSpotButton.tsx` - Booking button
- `src/components/travel/BookingDetail.tsx` - Booking detail view
- `src/pages/travel-bookings/[id].astro` - Booking detail page
- `src/components/crm/pages/travel-bookings/List.tsx` - CRM bookings view

### Modified Files:
- `src/db/schema/index.ts` - Export new schemas
- `src/components/crm/CRMApp.tsx` - Add travel-bookings route
- `src/pages/travel/[slug].astro` - Add ReserveSpotButton
- `src/components/layout/NotificationBell.tsx` - Connect to API

## Support

For questions or issues, check:
1. Browser console for errors
2. Network tab for API failures
3. Database logs for query issues
4. Ensure all migrations are applied

---

Built with ❤️ for seamless travel group bookings!
