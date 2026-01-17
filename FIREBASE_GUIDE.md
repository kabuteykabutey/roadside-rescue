# Firebase Configuration Guide

## Required Indexes
For the application to function correctly, you must create the following Firestore Compound Indexes in your Firebase Console.

### Bookings Collection
-   **Fields**: `mechanic_id` (Ascending) + `created_at` (Descending)
-   **Query Scope**: Collection
-   **Purpose**: Allows the mechanic dashboard to show requests ordered by newest first.
-   **How to create**:
    1.  Run the app and trigger the query (open Dashboard).
    2.  Check the browser console for a link looking like `https://console.firebase.google.com/...`.
    3.  Click the link to automatically create the index.
    4.  Wait 1-2 minutes for it to build.

## Firestore Rules (Basic)
Ensure your rules allow reading/writing to `bookings` and `mechanics`.
