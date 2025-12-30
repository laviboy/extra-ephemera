# Travel Group Booking Payment Integration Plan

## Overview
Integrate a payment flow where travelers must pay a deposit BEFORE being accepted into a travel group. Once payment succeeds, the agent is notified and can then accept/reject the booking.

## Updated Booking Flow

### Current Flow
1. Traveler requests to join → Status: `pending`
2. Agent accepts/rejects → Status: `accepted` or `rejected`
3. Traveler pays deposit (mock) → Status: `deposit_pending`
4. Agent confirms → Status: `confirmed`

### New Flow
1. **Traveler requests to join** → Booking created with Status: `pending_payment`
2. **Traveler pays deposit** (required before agent review) → Status: `payment_processing`
3. **Payment succeeds** → Status: `pending_review` + Agent notified
4. **Agent reviews and accepts/rejects** → Status: `joined` or `rejected`
5. **Full payment before trip** (future) → Status: `confirmed`

---

## Database Schema Changes

### 1. Add `payment_transactions` Table
Track all payment transactions (deposits, refunds, full payments)

```sql
CREATE TABLE IF NOT EXISTS "payment_transactions" (
  "id" serial PRIMARY KEY NOT NULL,
  "booking_id" integer NOT NULL REFERENCES "travel_group_bookings"("id") ON DELETE CASCADE,
  "stripe_payment_intent_id" varchar(255), -- Stripe PaymentIntent ID
  "stripe_charge_id" varchar(255), -- Stripe Charge ID
  "amount" decimal(10, 2) NOT NULL,
  "currency" varchar(3) DEFAULT 'usd' NOT NULL,
  "type" varchar(50) NOT NULL, -- 'deposit', 'full_payment', 'refund'
  "status" varchar(50) NOT NULL, -- 'pending', 'processing', 'succeeded', 'failed', 'refunded'
  "payment_method" varchar(50), -- 'card', 'bank_transfer', etc.
  "failure_reason" text,
  "metadata" jsonb, -- Additional Stripe metadata
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "payment_booking_idx" ON "payment_transactions" ("booking_id");
CREATE INDEX IF NOT EXISTS "payment_status_idx" ON "payment_transactions" ("status");
CREATE INDEX IF NOT EXISTS "payment_stripe_intent_idx" ON "payment_transactions" ("stripe_payment_intent_id");
```

### 2. Update `travel_group_bookings` Table
Add payment-related fields and update status values

```sql
ALTER TABLE "travel_group_bookings" 
  ADD COLUMN "payment_transaction_id" integer REFERENCES "payment_transactions"("id"),
  ADD COLUMN "payment_status" varchar(50) DEFAULT 'pending', -- 'pending', 'paid', 'refunded'
  ADD COLUMN "payment_required_amount" decimal(10, 2), -- Amount required for deposit
  ADD COLUMN "payment_deadline" timestamp, -- Deadline for payment (optional)
  ADD COLUMN "reviewed_at" timestamp; -- When agent reviewed the request

-- Update status column comment to reflect new values:
-- Status values: 
--   'pending_payment' - Booking created, waiting for payment
--   'payment_processing' - Payment is being processed
--   'payment_failed' - Payment failed
--   'pending_review' - Payment succeeded, waiting for agent review
--   'joined' - Agent accepted, traveler is in the group
--   'rejected' - Agent rejected the request
--   'cancelled' - Traveler or agent cancelled
--   'confirmed' - Ready for trip (future use)
```

### 3. Add Payment Webhooks Table (Optional but recommended)
Store webhook events from Stripe for debugging and audit trail

```sql
CREATE TABLE IF NOT EXISTS "payment_webhooks" (
  "id" serial PRIMARY KEY NOT NULL,
  "event_id" varchar(255) UNIQUE NOT NULL, -- Stripe event ID
  "event_type" varchar(100) NOT NULL, -- payment_intent.succeeded, etc.
  "payload" jsonb NOT NULL,
  "processed" boolean DEFAULT false,
  "processing_error" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "webhook_event_id_idx" ON "payment_webhooks" ("event_id");
CREATE INDEX IF NOT EXISTS "webhook_processed_idx" ON "payment_webhooks" ("processed");
```

---

## API Endpoints

### New Endpoints

#### 1. `POST /api/payments/create-intent`
Creates a Stripe PaymentIntent for a booking
```typescript
Request Body:
{
  bookingId: number;
}

Response:
{
  clientSecret: string; // For Stripe Elements
  paymentIntentId: string;
  amount: number;
}
```

#### 2. `POST /api/payments/webhook`
Stripe webhook handler for payment events
```typescript
// Handles Stripe events:
// - payment_intent.succeeded
// - payment_intent.payment_failed
// - charge.refunded

// Updates booking status and creates notifications
```

#### 3. `GET /api/payments/status/:bookingId`
Check payment status for a booking
```typescript
Response:
{
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
  transaction: PaymentTransaction;
}
```

#### 4. `POST /api/payments/cancel-intent`
Cancel a payment intent (if traveler changes mind before paying)
```typescript
Request Body:
{
  bookingId: number;
}
```

### Updated Endpoints

#### `POST /api/travel-bookings`
Updated to set initial payment required amount
```typescript
Request Body:
{
  travelGroupId: number;
  travelerNotes?: string;
}

Response:
{
  booking: TravelGroupBooking; // Status: 'pending_payment'
  paymentRequired: number; // Deposit amount
}
```

#### `PATCH /api/travel-bookings/:id`
Updated to handle new statuses
```typescript
// Agent actions:
// - 'accept' → Status: 'joined' (only when payment_status = 'paid')
// - 'reject' → Status: 'rejected' + refund initiated

// System actions (via webhook):
// - Payment succeeded → Status: 'pending_review'
// - Payment failed → Status: 'payment_failed'
```

---

## Frontend Components

### 1. **PaymentForm Component** (NEW)
`src/components/payments/PaymentForm.tsx`

Mock UI for now, ready for Stripe integration later

```typescript
interface PaymentFormProps {
  bookingId: number;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

// Features:
// - Shows amount to pay
// - Mock card input fields (card number, expiry, CVV)
// - "Pay Now" button
// - Loading state during processing
// - Success/Error messages
// - For mock: Simulate 2-second processing, then call success API
```

### 2. **PaymentStatusBadge Component** (NEW)
`src/components/payments/PaymentStatusBadge.tsx`

Visual indicator for payment status

```typescript
interface PaymentStatusBadgeProps {
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';
}

// Color coding:
// - pending: gray
// - processing: yellow
// - succeeded: green
// - failed: red
// - refunded: orange
```

### 3. **Update BookingDetail Component**
`src/components/travel/BookingDetail.tsx`

Add payment flow UI

```typescript
// Show different UI based on status:

// Status: 'pending_payment'
// → Show: "Complete Payment to Submit Request"
// → Show: PaymentForm component
// → Show: Deposit amount, payment deadline

// Status: 'payment_processing'
// → Show: "Processing your payment..."
// → Show: Loading spinner

// Status: 'payment_failed'
// → Show: "Payment failed. Please try again."
// → Show: Retry payment button
// → Show: Error reason

// Status: 'pending_review'
// → Show: "Payment received! Waiting for agent review."
// → Show: Payment receipt/details
// → Disable further actions

// Status: 'joined'
// → Show: "You're in! Welcome to the group."
// → Show: Trip details, chat, etc.

// Status: 'rejected'
// → Show: "Request declined by agent."
// → Show: Refund status if applicable
```

### 4. **Update ReserveSpotButton Component**
`src/components/travel/ReserveSpotButton.tsx`

Update messaging about payment requirement

```typescript
// Button text: "Reserve & Pay Deposit"
// Modal shows:
// - Deposit amount prominently
// - "You'll pay the deposit now to secure your spot"
// - Traveler notes field
// - "Continue to Payment" button
```

### 5. **Agent Notification Component Updates**
Add payment success notifications

```typescript
// Notification types to add:
// - 'deposit_paid': "New booking request with payment from {name}"
// - 'payment_verified': "Payment verified for booking #{id}"

// In CRM, highlight bookings with paid deposits
```

---

## Notification Flow

### Traveler Notifications
1. **Payment processing** → "Processing your payment..."
2. **Payment succeeded** → "Payment successful! Waiting for agent review."
3. **Payment failed** → "Payment failed. Please try again."
4. **Booking accepted** → "You're in! Your booking has been accepted."
5. **Booking rejected** → "Your request was declined. Refund initiated."
6. **Refund processed** → "Your refund has been processed."

### Agent Notifications
1. **Payment succeeded** → "New booking request from [Traveler Name] with paid deposit"
2. **Booking cancelled by traveler** → "Booking #[ID] cancelled. Refund needed."

---

## Implementation Steps

### Phase 1: Database Setup (Priority: HIGH)
- [x] Create migration file `0009_add_payment_system.sql`
- [x] Add `payment_transactions` table
- [x] Add `payment_webhooks` table
- [x] Add payment columns to `travel_group_bookings`
- [x] Create indexes
- [ ] Run migration

### Phase 2: TypeScript Schema (Priority: HIGH)
- [x] Create `src/db/schema/payments.ts`
- [x] Define payment transaction schema
- [x] Define payment webhook schema
- [x] Update travel group bookings schema
- [x] Add types and relations
- [x] Export from index

### Phase 3: Mock Payment API (Priority: HIGH)
- [x] Create `src/pages/api/payments/create-intent.ts`
- [x] Create `src/pages/api/payments/mock-process.ts` (simulates Stripe)
- [x] Create `src/pages/api/payments/status/[bookingId].ts`
- [x] Update booking creation to set payment amount
- [x] Update booking status update logic

### Phase 4: Payment UI Components (Priority: HIGH)
- [x] Create `PaymentForm.tsx` with mock card inputs
- [x] Create `PaymentStatusBadge.tsx`
- [x] Update `BookingDetail.tsx` to show payment flow
- [x] Update `ReserveSpotButton.tsx` messaging
- [x] Add loading and error states

### Phase 5: Notification Integration (Priority: MEDIUM)
- [ ] Add payment notification types
- [ ] Update notification creation for payment events
- [ ] Update agent CRM to highlight paid bookings
- [ ] Add notification bells/indicators
- [ ] Test realtime notification delivery

### Phase 6: Agent Dashboard Updates (Priority: MEDIUM)
- [ ] Add payment status column to bookings list
- [ ] Filter bookings by payment status
- [ ] Show payment details in booking view
- [ ] Add "Refund" action for cancelled/rejected bookings
- [ ] Show payment history/timeline

### Phase 7: Future Stripe Integration (Priority: LOW - Future)
- [ ] Install Stripe SDK (`@stripe/stripe-js`, `stripe`)
- [ ] Set up Stripe account and get API keys
- [ ] Replace mock payment with real Stripe Elements
- [ ] Implement webhook handler for real Stripe events
- [ ] Set up webhook endpoint in Stripe dashboard
- [ ] Test with Stripe test mode
- [ ] Handle refunds through Stripe API
- [ ] Add payment method management

---

## Mock Payment Flow (Current Implementation)

Since we're using mock UI for now:

### 1. Mock Payment Processing
```typescript
// src/pages/api/payments/mock-process.ts

POST /api/payments/mock-process
Body: { bookingId: number }

// Simulates Stripe payment:
// 1. Create payment transaction (status: 'processing')
// 2. Wait 2 seconds (simulate processing)
// 3. 90% success rate, 10% random failure
// 4. Update transaction status
// 5. Update booking status accordingly
// 6. Create notifications
// 7. Return result
```

### 2. Mock Card Form
```typescript
// For mock UI, accept any values but validate format:
// Card number: 16 digits (any)
// Expiry: MM/YY format
// CVV: 3-4 digits
// Special test cards:
// - 4242424242424242 → Always succeeds
// - 4000000000000002 → Always fails
```

---

## Security Considerations

### Current (Mock) Phase
- Validate user owns the booking before allowing payment
- Prevent duplicate payments for same booking
- Rate limit payment attempts

### Future (Stripe) Phase
- Never store card details (use Stripe Elements)
- Validate webhook signatures from Stripe
- Use HTTPS only
- Implement idempotency for payment operations
- Log all payment events for audit trail
- Secure API keys in environment variables
- Use Stripe test mode until production ready

---

## Testing Checklist

### Mock Payment Testing
- [ ] Create booking → Shows payment form
- [ ] Submit payment with valid mock card → Success
- [ ] Submit payment with fail test card → Failure
- [ ] Payment success → Agent notified
- [ ] Payment success → Status changes to `pending_review`
- [ ] Payment failure → Status changes to `payment_failed`
- [ ] Retry payment after failure → Works
- [ ] Agent accepts after payment → Status changes to `joined`
- [ ] Agent rejects after payment → Refund initiated
- [ ] Traveler cancels before payment → Booking cancelled
- [ ] Traveler cancels after payment → Refund initiated

### UI Testing
- [ ] Payment form displays correctly
- [ ] Loading states work
- [ ] Error messages display
- [ ] Success messages display
- [ ] Status badges show correct colors
- [ ] Notifications arrive in real-time
- [ ] Mobile responsive

---

## Environment Variables Needed

```env
# For mock (current)
MOCK_PAYMENT_ENABLED=true

# For Stripe (future)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYMENT_CURRENCY=usd
```

---

## Key Benefits of This Approach

1. **Payment First**: Ensures serious travelers, reduces agent time on non-paying requests
2. **Agent Confidence**: Agent knows payment is secured before reviewing
3. **Clear Status Tracking**: Each step has a clear status for both parties
4. **Refund Ready**: System tracks payments, ready for refund processing
5. **Mock to Real**: Easy transition from mock to Stripe later
6. **Audit Trail**: All transactions logged for accounting/disputes

---

## Next Steps

1. Review this plan and confirm approach
2. Start with Phase 1 (Database Setup)
3. Build mock payment system (Phases 2-4)
4. Test thoroughly with mock
5. Later: Replace mock with real Stripe integration
