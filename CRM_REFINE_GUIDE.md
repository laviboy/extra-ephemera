# Agent CRM with Refine Integration

This document explains the Refine-powered CRM system for travel agents.

## Overview

We've integrated **Refine** (https://refine.dev) - a React meta-framework for CRUD-heavy applications - to build a complete CRM system for travel agents. Refine provides:

✅ **Headless Architecture** - Works seamlessly with shadcn/ui  
✅ **Supabase Integration** - Out-of-the-box data & auth providers  
✅ **Real-time Updates** - Live provider for instant data sync  
✅ **React Query** - Optimized data fetching & caching  
✅ **Routing** - React Router integration  
✅ **Type Safety** - Full TypeScript support  

## Architecture

### 1. **Data Provider** (`src/lib/refine/dataProvider.ts`)
Connects Refine to your Supabase database:
- Handles all CRUD operations (Create, Read, Update, Delete)
- Works with existing Drizzle schema
- Supports filters, sorting, pagination
- Real-time subscriptions

### 2. **Auth Provider** (`src/lib/refine/authProvider.ts`)
Manages authentication:
- Integrates with Supabase Auth
- Works alongside existing `useAuth` store
- Role-based permissions
- Session management

### 3. **Live Provider** (`src/lib/refine/liveProvider.ts`)
Enables real-time features:
- Auto-updates when data changes
- Uses Supabase Realtime
- No manual refetching needed

## CRM Features

### Resources Available:

1. **Conversations (Leads)** - `/crm/conversations`
   - View all customer inquiries
   - Filter by type (lead, booking, general)
   - Real-time message updates
   - Quick search & filtering

2. **Bookings** - `/crm/bookings`
   - Manage travel bookings
   - Track status (pending, confirmed, cancelled, completed)
   - Payment tracking
   - Customer details

3. **Proposals** - `/crm/proposals`
   - Create custom travel proposals
   - Track status (draft, sent, accepted, rejected)
   - Price management
   - Expiration tracking

4. **Packages** - `/crm/packages`
   - Manage your travel packages
   - Pricing & inclusions
   - Link to listings
   - Image management

### Dashboard
The CRM dashboard (`/crm`) provides:
- Active leads count
- Monthly booking stats
- Pending proposals
- Revenue tracking
- Recent activity feed

## Database Schema

New tables added for CRM:

```typescript
// Bookings table
bookings {
  id, customerId, agentId, packageId,
  status, travelDate, travelers,
  totalAmount, paidAmount, paymentStatus,
  notes, createdAt, updatedAt
}

// Conversations table  
conversations {
  id, customerId, agentId,
  type, subject, lastMessageAt,
  createdAt, updatedAt
}

// Messages table
messages {
  id, conversationId, senderId,
  content, createdAt, updatedAt
}

// Proposals table
proposals {
  id, customerId, agentId, packageId,
  status, title, description,
  price, validUntil,
  createdAt, updatedAt
}
```

## Usage

### For Agents

1. **Access CRM**: Users with `role: 'agent'` see a "Agent CRM" button in Settings
2. **Navigate**: Click to open `/crm` dashboard
3. **Manage Data**: Use sidebar navigation to access different resources
4. **Real-time**: Changes sync automatically across all sessions

### For Developers

#### Using Refine Hooks

```tsx
import { useList, useCreate, useUpdate } from "@refinedev/core";

// Fetch data with filters
const { data } = useList({
  resource: "bookings",
  filters: [
    { field: "status", operator: "eq", value: "confirmed" }
  ],
  pagination: { current: 1, pageSize: 10 }
});

// Create new record
const { mutate } = useCreate();
mutate({
  resource: "bookings",
  values: { /* booking data */ }
});

// Update record
const { mutate: update } = useUpdate();
update({
  resource: "bookings",
  id: "123",
  values: { status: "confirmed" }
});
```

#### With Supabase Relations

```tsx
const { data } = useList({
  resource: "bookings",
  meta: {
    select: "*, customer:customerId(name, email), package:packageId(title)"
  }
});
```

## Refine Capabilities Reference

### Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Data Hooks** | useList, useOne, useCreate, useUpdate, useDelete | ✅ Implemented |
| **Table Hook** | useTable with filters, sorting, pagination | ✅ Implemented |
| **Navigation** | useNavigation for routing | ✅ Implemented |
| **Auth** | useLogin, useLogout, useGetIdentity | ✅ Implemented |
| **Real-time** | Auto-sync with Supabase Realtime | ✅ Implemented |
| **Notifications** | Toast notifications for actions | 🔄 Can add |
| **Access Control** | Role-based permissions | 🔄 Can add |
| **Audit Logs** | Track data changes | 🔄 Can add |
| **Import/Export** | CSV/Excel import/export | 🔄 Can add |

### Advanced Features Available

1. **Optimistic Updates** - Instant UI updates before server response
2. **Infinite Scroll** - For large datasets
3. **Multi-select Actions** - Bulk operations
4. **Custom Filters** - Complex filter builders
5. **Export Data** - Export to CSV/Excel
6. **Import Data** - Bulk import from files
7. **Audit Logs** - Track all changes
8. **Access Control** - Fine-grained permissions

## Development

### Adding New Resources

1. **Create Schema** in `src/db/schema/`
2. **Export** from `src/db/schema/index.ts`
3. **Add Resource** to Refine config in `CRMApp.tsx`:

```tsx
{
  name: "resource_name",
  list: "/resource_name",
  create: "/resource_name/create",
  edit: "/resource_name/:id/edit",
  show: "/resource_name/:id",
  meta: { label: "Display Name", icon: "🔖" }
}
```

4. **Create Pages** in `src/components/crm/pages/resource_name/`

### Customization

- **Styling**: Uses existing shadcn/ui components
- **Layout**: Modify `src/components/crm/components/Layout.tsx`
- **Dashboard**: Edit `src/components/crm/pages/Dashboard.tsx`
- **Theme**: Already inherits from Tailwind config

## Migration Steps

To enable the CRM in production:

1. **Generate Migration**:
   ```bash
   npm run db:generate
   ```

2. **Review Migration** in `drizzle/` folder

3. **Apply Migration**:
   ```bash
   npm run db:push
   ```

4. **Set User Roles**: Update user records with `role: 'agent'`

## Benefits of Refine

### vs Building From Scratch
- ⏱️ **90% faster development** - Pre-built hooks & providers
- 🐛 **Fewer bugs** - Battle-tested framework
- 📚 **Best practices** - Industry-standard patterns
- 🔄 **Real-time** - Built-in live updates
- 🔒 **Security** - Secure by default

### vs Low-Code Tools
- 🎨 **Full customization** - Use your own UI components
- 💪 **No vendor lock-in** - Open source, own your code
- 🚀 **Production-ready** - Used by 10,000+ companies
- 🛠️ **Developer-friendly** - TypeScript, React, modern tools

## Resources

- **Refine Docs**: https://refine.dev/docs
- **Supabase Integration**: https://refine.dev/docs/data/packages/supabase
- **Examples**: https://refine.dev/examples
- **Discord Community**: https://discord.gg/refine

## Next Steps

### Immediate Enhancements

1. **Complete CRUD Forms** - Add full create/edit forms for each resource
2. **File Uploads** - Add image uploads for packages
3. **Email Integration** - Send notifications to customers
4. **Calendar View** - Visual booking calendar
5. **Analytics** - Charts & graphs for agent performance

### Advanced Features

1. **Multi-Agent Support** - Team collaboration
2. **Customer Portal** - Self-service for travelers
3. **Payment Integration** - Stripe/PayPal checkout
4. **SMS Notifications** - Twilio integration
5. **Document Generation** - PDF invoices & itineraries

---

**Built with ❤️ using Refine** - The React Framework for Enterprise
