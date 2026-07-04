# Order Workflow & Buyback System Fixes

## Issues Resolved

### 1. **Order Status Workflow** ✅
**Problem**: Status transitions were too restrictive, preventing valid workflow progression.

**Solution**: 
- Implemented proper status transition validation with allowed flows:
  - `pending` → `processing` or `cancelled`
  - `processing` → `shipped` or `cancelled`
  - `shipped` → `delivered` or `cancelled`
  - `delivered` and `cancelled` are final states
- Removed the blocking check that prevented `delivered` → `delivered` updates
- Admin UI now shows only valid transitions with visual feedback

**Files Modified**:
- `app/api/admin/orders/[id]/route.ts` - Added transition validation logic
- `app/admin/orders/page.tsx` - Added `getNextStatuses()` helper and UI improvements

### 2. **Buyback Visibility** ✅
**Problem**: Buyback buttons not showing for eligible products in shipped/delivered orders.

**Root Cause**: Order items created before buyback feature didn't have `buybackEligible` field populated.

**Solution**:
- **Order Fetch Endpoint** (`app/api/orders/[id]/route.ts`):
  - Enriches order items with `buybackEligible` from product's `buybackEnabled` if missing
  - Fetches products in batch for efficiency
  - Automatically populates missing fields on-the-fly

- **Admin Orders List** (`app/api/admin/orders/route.ts`):
  - Includes `buybackEnabled` in product population
  - Enriches items during fetch if `buybackEligible` is undefined

**Files Modified**:
- `app/api/orders/[id]/route.ts` - Added Product import and enrichment logic
- `app/api/admin/orders/route.ts` - Added Product import and enrichment logic

### 3. **Individual Product Buyback** ✅
**Problem**: User wanted individual buyback buttons for each product in multi-item orders.

**Solution**: 
- Already implemented! Each item in an order has independent buyback status
- Enhanced UI to show clear buyback status per item:
  - **Buyback Requested**: Blue badge with request date
  - **Buyback Available**: Orange button for shipped orders, info text for delivered
  - **Buyback Pending**: Gray text showing when it will be available
- Added `getBuybackStatusText()` helper for consistent status display

**Files Modified**:
- `app/orders/[id]/page.tsx` - Enhanced per-item buyback rendering with better status display

### 4. **Admin Order Management** ✅
**Problem**: Admin couldn't see buyback status of items in orders.

**Solution**:
- Added buyback status badges in admin order detail modal
- Shows "Buyback Requested" or "Buyback Eligible" for each item
- Visual indicators help admin track which items can be bought back

**Files Modified**:
- `app/admin/orders/page.tsx` - Added buyback status indicators in item list

## Order Status Flow

```
┌─────────┐
│ PENDING │ (New order, payment pending)
└────┬────┘
     │
     ├──→ processing (Payment verified)
     └──→ cancelled (Order cancelled)
     
┌────────────┐
│ PROCESSING │ (Payment verified, preparing to ship)
└─────┬──────┘
      │
      ├──→ shipped (Order dispatched)
      └──→ cancelled (Cancelled before shipping)
      
┌─────────┐
│ SHIPPED │ (Order in transit)
└────┬────┘
     │
     ├──→ delivered (Customer received order)
     └──→ cancelled (Lost/returned during transit)
     
┌───────────┐
│ DELIVERED │ (Final state - Order completed)
└───────────┘

┌───────────┐
│ CANCELLED │ (Final state - Order cancelled)
└───────────┘
```

## Buyback Eligibility Flow

### For Order Items:
1. **Order Creation**: `buybackEligible` set from product's `buybackEnabled` field
2. **Order Fetch**: If missing, dynamically populated from current product data
3. **Status Check**: 
   - `shipped`: Buyback immediately available
   - `delivered`: Buyback available after 7 days
   - Other statuses: Not available yet

### Per-Item Buyback Status:
- ✅ **Buyback Eligible** - Product supports buyback
- 🔄 **Buyback Requested** - User submitted buyback request
- ⏳ **Pending Shipping** - Wait until order is shipped
- ⏰ **Waiting Period** - Delivered orders need 7 days minimum

## API Endpoints Updated

### GET `/api/orders/[id]`
- Enriches order items with `buybackEligible` if missing
- Fetches products in batch for efficiency
- Returns complete order data with buyback status

### GET `/api/admin/orders`
- Populates product's `buybackEnabled` field
- Enriches order items for all orders in list
- Shows buyback status in admin panel

### PATCH `/api/admin/orders/[id]`
- Validates status transitions against allowed flows
- Prevents invalid state changes
- Returns clear error messages for invalid transitions
- Updates `updatedAt` timestamp

## Testing Checklist

- [x] Order status transitions follow proper workflow
- [x] Admin can only transition to valid next states
- [x] Admin UI shows current status and available transitions
- [x] Buyback buttons visible for shipped/delivered orders
- [x] Each product in multi-item order has independent buyback status
- [x] Buyback eligibility auto-populated for old orders
- [x] Admin sees buyback status badges in order details
- [x] Invalid transitions show helpful error messages
- [x] Order refresh after buyback request shows updated status

## Future Enhancements

### Recommended (Not Implemented Yet):
1. **In-Transit Status**: Add intermediate state between shipped and delivered
2. **Payment Integration**: Link payment verification to status workflow
3. **Status History**: Track all status changes with timestamps and admin who made them
4. **Automated Notifications**: Email customers on status changes
5. **Delivery Confirmation**: Require signature/proof of delivery
6. **Return Window**: Enforce 30-day return policy

## Migration Notes

**No database migration required!** ✅

The system automatically enriches order items with buyback eligibility on fetch, so existing orders work without modification. However, for better performance, you could run a one-time migration:

```javascript
// Optional: Update all existing orders (run once)
db.orders.find({}).forEach(order => {
  const updates = order.items.map(item => {
    if (item.buybackEligible === undefined) {
      const product = db.products.findOne({ _id: item.productId });
      return { ...item, buybackEligible: product?.buybackEnabled || false };
    }
    return item;
  });
  db.orders.updateOne({ _id: order._id }, { $set: { items: updates } });
});
```

## Summary

All reported issues have been resolved:

1. ✅ **Buyback visibility** - Now shows for eligible products in shipped/delivered orders
2. ✅ **Status workflow** - Proper transitions enforced (pending→processing→shipped→delivered)
3. ✅ **Individual buyback** - Each product has independent buyback button/status
4. ✅ **Admin management** - Clear status transitions with visual feedback
5. ✅ **Data enrichment** - Automatic population of missing buyback fields

The system now provides a complete order workflow with proper status management and per-item buyback functionality!
