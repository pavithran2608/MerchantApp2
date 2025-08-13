# QR Scanner Testing Guide

## 🧪 **Testing the QR Scanner**

### **How the QR Scanner Works**

1. **Scan Student QR Code** → Extract student data
2. **Parse QR Data** → Convert to Student object
3. **Fetch Details** → Call mock API with student ID
4. **Navigate to Payment** → Pass student data to PaymentScreen

### **QR Code Format**

The scanner expects QR codes containing student data in JSON format:

```json
{
  "id": "STU001",
  "name": "John Smith",
  "email": "john.smith@university.edu",
  "phone": "+1-555-0123",
  "department": "Computer Science",
  "balance": 1250.00,
  "studentId": "STU001",
  "semester": "Fall 2024",
  "year": "2024"
}
```

### **Testing Methods**

#### **Method 1: Demo Mode (Quick Test)**
1. Open the merchant app
2. Tap "📱 Scan Student QR Code"
3. Tap "Demo: Scan Test QR"
4. Verify navigation to PaymentScreen
5. Check student details are correct

#### **Method 2: Manual QR Input (Real Testing)**
1. Open the merchant app
2. Tap "📱 Scan Student QR Code"
3. Tap "Manual QR Input"
4. Paste the JSON data from your QR code
5. Tap "Process QR Data"
6. Verify the complete flow works

#### **Method 3: Generate Real QR Codes**
1. Use any online QR code generator
2. Generate QR codes with the JSON data below
3. Use "Manual QR Input" to paste the JSON content
4. Test the complete scanning flow

### **Test QR Code Data**

#### **Student 1:**
```json
{"id":"STU001","name":"John Smith","email":"john.smith@university.edu","phone":"+1-555-0123","department":"Computer Science","balance":1250.00,"studentId":"STU001","semester":"Fall 2024","year":"2024"}
```

#### **Student 2:**
```json
{"id":"STU002","name":"Sarah Johnson","email":"sarah.johnson@university.edu","phone":"+1-555-0124","department":"Business Administration","balance":850.50,"studentId":"STU002","semester":"Fall 2024","year":"2024"}
```

#### **Student 3:**
```json
{"id":"STU003","name":"Michael Chen","email":"michael.chen@university.edu","phone":"+1-555-0125","department":"Engineering","balance":2100.75,"studentId":"STU003","semester":"Fall 2024","year":"2024"}
```

### **Step-by-Step Real QR Testing**

#### **Step 1: Generate QR Code**
1. Go to any online QR code generator (e.g., qr-code-generator.com)
2. Copy one of the JSON data samples above
3. Generate the QR code
4. Save the QR code image

#### **Step 2: Extract QR Data**
1. Use any QR code scanner app on your phone
2. Scan the generated QR code
3. Copy the extracted JSON data

#### **Step 3: Test in Merchant App**
1. Open the merchant app
2. Navigate to QR Scanner
3. Tap "Manual QR Input"
4. Paste the copied JSON data
5. Tap "Process QR Data"
6. Verify student details appear
7. Test navigation to PaymentScreen
8. Test payment processing

### **Expected Behavior**

✅ **Valid QR Code:**
- Scanner processes QR data
- Parses student information
- Fetches additional details from API
- Navigates to PaymentScreen
- Shows correct student information

❌ **Invalid QR Code:**
- Shows error message
- Allows retry
- Doesn't navigate to PaymentScreen

### **Test Cases**

1. **Valid JSON QR Code** → Should work perfectly
2. **Student ID Only** → Should fetch details from API
3. **Empty QR Code** → Should show error
4. **Invalid JSON** → Should show error
5. **Unknown Student ID** → Should show error

### **Debug Information**

The app logs these details to console:
- `QR Code Scanned: [data]`
- `Parsed Student Data: [object]`
- `Fetched Student Details: [object]`

### **Quick Test with Manual Input**

1. **Open QR Scanner**
2. **Tap "Manual QR Input"**
3. **Paste this test data:**
   ```json
   {"id":"STU001","name":"John Smith","email":"john.smith@university.edu","phone":"+1-555-0123","department":"Computer Science","balance":1250.00,"studentId":"STU001","semester":"Fall 2024","year":"2024"}
   ```
4. **Tap "Process QR Data"**
5. **Verify navigation to PaymentScreen**
6. **Check student details are correct**
7. **Test payment processing**

### **Real QR Code Testing Workflow**

1. **Generate QR Code** → Use online generator with JSON data
2. **Extract Data** → Scan with any QR app to get JSON
3. **Manual Input** → Paste JSON in merchant app
4. **Process Data** → Verify parsing and API calls
5. **Navigate to Payment** → Test complete flow
6. **Process Payment** → Verify payment handling

This approach allows you to test real QR code functionality without complex camera integration issues!
