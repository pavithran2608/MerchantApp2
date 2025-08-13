This PRD is fully aligned with your existing backend codebase and provides specific API endpoint contracts with example JSON for request bodies and expected responses. It also outlines the screen-by-screen functionality with descriptions of the UI to ensure the mobile app integrates seamlessly with the live backend.

***

### **Product Requirement Document: SnapTap Merchant Mobile App (Frontend)**

**To:** Frontend Mobile App Developer
**Project:** SnapTap Institutional Platform - Merchant Point-of-Sale (POS) App
**Objective:** To build a fast, robust, and intuitive Point-of-Sale (POS) mobile application for on-campus merchants using React Native. This app is the primary tool for processing all student purchases and managing the merchant's sales and products. It must integrate perfectly with the established SnapTap backend API.

---

#### **1. Introduction & Vision**
This document details the requirements for the SnapTap Merchant Mobile App. The app's core purpose is to provide campus vendors with a seamless and rapid transaction processing system. In a fast-paced environment with long queues, the app must prioritize **speed, reliability, and ease of use**. It will serve as the merchant's all-in-one tool for making sales, verifying student identity, managing their product catalog, and tracking their earnings.

#### **2. Core User Persona**
*   **Merchant Mike:** Mike runs a busy food stall on campus. His biggest challenges are long queues during peak hours. He needs an app that is incredibly fast, never crashes, and allows him to complete a sale with the fewest number of taps possible.

#### **3. Non-Functional Requirements**
*   **Performance:** The app must be highly responsive. The POS interface must load instantly and respond to taps without any lag. The entire transaction flow, from checkout to confirmation, should feel near-instantaneous.
*   **Reliability:** The app must handle network errors gracefully (e.g., show a "No Connection" message) and should not crash. State management must be robust.
*   **Usability:** The design must be extremely simple and intuitive. The "select items -> verify -> get confirmation" flow must be frictionless and require minimal training.

#### **4. Technology Stack**
*   **Frontend Framework:** React Native

---

#### **5. Functional Requirements: App Screens & User Flows**

##### **5.1. Auth Screen**
*   **Description:** A simple screen for the merchant to log in.
*   **UI Components:**
    *   App Logo
    *   Email Input Field
    *   Password Input Field
    *   "Sign In" Button
    *   "Forgot Password?" Link
*   **Logic:**
    1.  On "Sign In," the app sends a `POST` request to `/api/v1/auth/login`.
    2.  On success, securely store the `token` and `user` object in the device's persistent storage.
    3.  Navigate to the Dashboard screen.
    4.  On failure, display the error message from the API.

##### **5.2. Dashboard Screen (Main Tab)**
*   **Description:** The landing page after login, providing a quick overview of the day's business.
*   **UI Components:**
    *   **Header:** "Dashboard" title, Merchant's Business Name.
    *   **Stats Cards:**
        *   Card for "Today's Total Sales" (`total_sales`).
        *   Card for "Total Transactions Today" (`total_transactions`).
        *   Card for "Current Wallet Balance" (`wallet_balance`).
    *   **Recent Transactions List:** A short, scrollable list of the last 5 transactions.
*   **Data Fetching:** On load, the screen makes a `GET` request to `/api/v1/merchant/dashboard-stats`.

##### **5.3. POS / Transaction Screen (Primary Tab)**
*   **Description:** The main screen for creating and processing sales. It should be designed for speed and efficiency.
*   **UI Components:**
    *   **Product Grid/List:** A scrollable view of all the merchant's active products, showing `name` and `price`.
    *   **Shopping Cart Panel:** A section (e.g., a sidebar or bottom sheet) that updates in real-time as items are added. It displays each item, its quantity, and the subtotal.
    *   **Cart Summary:** A clear display of the `Total Amount`.
    *   **"Checkout" Button:** Becomes active once at least one item is in the cart.
*   **Data Fetching:** On load, makes a `GET` request to `/api/v1/products/my-products`.

##### **5.4. Products Screen (Tab)**
*   **Description:** A section for the merchant to manage their product catalog.
*   **UI Components:**
    *   A list of all products, showing `name`, `price`, `category`, and `is_active` status.
    *   A "Add New Product" button.
    *   Edit/Delete options for each product.
*   **Functionality:** Full CRUD:
    *   **Read:** `GET /api/v1/products/my-products`
    *   **Create:** `POST /api/v1/products`
    *   **Update:** `PUT /api/v1/products/{id}`
    *   **Delete (Deactivate):** `DELETE /api/v1/products/{id}`

##### **5.5. Wallet Screen (Tab)**
*   **Description:** A screen to view the merchant's financial balance and transaction history.
*   **UI Components:**
    *   A prominent card displaying the `Current Wallet Balance`.
    *   A detailed, scrollable list of all incoming purchase transactions.
*   **Data Fetching:**
    *   `GET /api/v1/wallets/balance/{userId}` (using the merchant's user ID).
    *   `GET /api/v1/merchant/transactions`.

---

#### **6. Core User Flow: The Sale Process & Verification Screens**

This is the most critical flow.

1.  **Checkout:** After building the cart on the POS screen, the merchant taps "Checkout."
2.  **Verification Modal Screen:** A modal appears, presenting three verification options.

    *   **A) Face Scan Screen:**
        *   **UI:** An input field for **"Parent's Mobile Number"** and a "Find Student" button.
        *   **Logic:**
            1.  After number entry, the app calls `GET /api/v1/purchase/students/find`.
            2.  On success, the UI transitions to a camera view.
            3.  **UI (Camera):** The front-facing camera opens with an overlay to guide face placement. A capture button is present.
            4.  On capture, the app calls `POST /api/v1/purchase/verify-face`.

    *   **B) QR Scanner -> Passcode Screen:**
        *   **UI:** The rear-facing camera opens immediately with a scanning overlay.
        *   **Logic:**
            1.  The app scans the QR code to get the `qr` token.
            2.  On a successful scan, the UI transitions to a new screen.
            3.  **UI (Passcode):** A prominent title "Enter Passcode" and a large, 4-digit passcode input field (numpad is ideal).
            4.  Once 4 digits are entered, the app automatically calls `POST /api/v1/purchase/verify-passcode`.

    *   **C) NFC Scan Screen:**
        *   **UI:** A screen with an animation and text prompt like "Hold student card near the phone's NFC reader."
        *   **Logic:**
            1.  The app invokes the phone's native NFC reader.
            2.  On a successful tap, the app reads the `nfc_card_id`.
            3.  The app calls `POST /api/v1/purchase/verify-nfc`.

3.  **Transaction Confirmation Screens:**
    *   **Success Screen:** A full-screen display with a large green checkmark, "Payment Successful," the total amount, and the student's new balance.
    *   **Failure Screen:** A full-screen display with a large red 'X', "Payment Failed," and the specific error message from the API.

---

#### **7. API Integration Contract & JSON Formats**

##### **A. Merchant Login**
*   **Request:** `POST /api/v1/auth/login`
*   **Request Body:**
    ```json
    {
      "email": "merchant@demo.com",
      "password": "merchant123"
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Login successful",
      "data": {
        "user": {
          "id": "merchant-user-uuid",
          "full_name": "Bob Merchant",
          "email": "merchant@demo.com",
          "role": "merchant",
          "institute_id": "demo-institute-uuid",
          "institute_code": "demo123",
          "institute_name": "Demo Institute"
        },
        "token": "your_jwt_token_here"
      }
    }
    ```

##### **B. Find Student by Phone (for Face Scan)**
*   **Request:** `GET /api/v1/purchase/students/find?phone=+1234567891`
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "student_id": "student-user-uuid",
        "student_name": "Jane Student",
        "face_id": "available",
        "nfc_card_id": "available",
        "qr": "available"
      }
    }
    ```

##### **C. Verify & Purchase (Passcode Example)**
*   **Request:** `POST /api/v1/purchase/verify-passcode`
*   **Request Body:**
    ```json
    {
      "qr": "QR_student-uuid_timestamp",
      "passcode": "1234",
      "items": [
        { "product_id": "sandwich-product-uuid", "quantity": 2 },
        { "product_id": "coffee-product-uuid", "quantity": 1 }
      ]
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Passcode verification successful and purchase processed",
      "data": {
        "purchase_id": "purchase-uuid",
        "transaction_id": "transaction-uuid",
        "total_amount": 14.48,
        "items_count": 2,
        "overdraft_used": 0,
        "overdraft_fee": 0,
        "new_balance": 85.52,
        "status": "completed"
      }
    }
    ```
*   **Failure Response (400 Bad Request):**
    ```json
    {
      "success": false,
      "message": "Insufficient funds. Available: $10.00, Required: $14.48"
    }
    ```
    
##### **D. Get Merchant Products**
*   **Request:** `GET /api/v1/products/my-products`
*   **Success Response (200 OK):**
    ```json
    {
        "success": true,
        "data": {
            "products": [
                {
                    "id": "product-uuid-1",
                    "merchant_id": "merchant-user-uuid",
                    "name": "Sandwich",
                    "description": "Fresh sandwich with vegetables",
                    "price": "5.99",
                    "category_id": "category-uuid-1",
                    "is_active": true,
                    "created_at": "2024-08-20T10:00:00.000Z",
                    "category": {
                        "id": "category-uuid-1",
                        "name": "Food & Beverages",
                        "description": "Food and drink items"
                    }
                }
            ],
            "pagination": { ... }
        }
    }
    ```

---

#### **8. Out of Scope**
*   **Admin or Parent App Functionality:** This app is solely for merchants.
*   **Backend Development:** You are not responsible for any database, server-side logic, or API creation. Your role is to consume the APIs as specified in this document.