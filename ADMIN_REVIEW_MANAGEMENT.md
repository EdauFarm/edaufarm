# Admin Review Management System

This system allows administrators to manually create, edit, and delete product reviews. This is particularly useful for migrated products from manual order systems that have existing customer reviews.

## Features

### Admin API Endpoints
**Location:** `/app/api/admin/reviews/route.ts`

1. **POST** - Create new review
   - Requires: productId, rating, comment
   - Optional: userName, userEmail, verified
   - Automatically updates product rating average

2. **PUT** - Update existing review
   - Requires: reviewId
   - Optional: userName, rating, comment, verified
   - Recalculates product rating

3. **DELETE** - Delete any review
   - Requires: reviewId (query param)
   - Updates product rating after deletion

### Admin Reviews Page
**Location:** `/app/admin/reviews`

Features:
- View all product reviews in a table
- Create new reviews with custom data
- Edit existing reviews
- Delete reviews
- Toggle verified status
- Star rating display

## Usage

### Creating a Review for Migrated Data

1. Go to `/admin/reviews`
2. Click "Add Review"
3. Fill in the form:
   - **Product ID**: Get from product URL or database
   - **User Name**: "Verified Buyer" or customer name
   - **User Email**: Optional (defaults to migrated@gadgetworld.com)
   - **Rating**: 1-5 stars
   - **Comment**: Review text
   - **Verified**: Check to mark as verified purchase

### Editing a Review

1. Find the review in the table
2. Click the edit icon
3. Update fields as needed
4. Click "Update Review"

### Deleting a Review

1. Find the review in the table
2. Click the delete icon
3. Confirm deletion

## API Examples

### Create Review (cURL)
```bash
curl -X POST https://gadgetworld.loopnet.tech/api/admin/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "507f1f77bcf86cd799439011",
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "rating": 5,
    "comment": "Excellent product! Highly recommend.",
    "verified": true
  }'
```

### Update Review (cURL)
```bash
curl -X PUT https://gadgetworld.loopnet.tech/api/admin/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "reviewId": "507f1f77bcf86cd799439012",
    "rating": 4,
    "comment": "Updated review text"
  }'
```

### Delete Review (cURL)
```bash
curl -X DELETE "https://gadgetworld.loopnet.tech/api/admin/reviews?reviewId=507f1f77bcf86cd799439012"
```

## Authentication

All endpoints require:
- Valid admin session
- User role must be 'admin'

## Product Rating Updates

When reviews are created, updated, or deleted:
1. System fetches all reviews for the product
2. Calculates new average rating
3. Updates product's `rating.average` and `rating.count` fields

## Quick Access

- Admin Dashboard: `/admin` → Quick Actions → "Manage Reviews"
- Direct URL: `/admin/reviews`

## Default Values

- **User Email**: `migrated@gadgetworld.com`
- **User Name**: `Verified Buyer`
- **Verified**: `true`

## Notes

- Product ID must be valid MongoDB ObjectId
- Rating must be between 1-5
- Comment is required
- Admins can edit/delete any review (not restricted to own reviews)
- Automatically marked as verified by default for migrated data
