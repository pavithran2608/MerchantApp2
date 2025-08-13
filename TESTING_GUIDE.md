# QR Scanner Testing Guide

## 🧪 **Testing the QR Scanner with Mock Data**

### **Step 1: Generate Test QR Codes**

1. **Open the App**
   - Launch the merchant app
   - Navigate to Dashboard
   - Tap "📱 QR Code Generator"

2. **View QR Code Content**
   - Select any student from the list
   - Tap "View Content" to see the JSON data
   - Copy the JSON content (this is what will be in the QR code)

3. **Generate QR Code**
   - Use any online QR code generator:
     - [QR Code Generator](https://www.qr-code-generator.com/)
     - [QR Server](https://api.qrserver.com/v1/create-qr-code/)
     - [QR Code Monkey](https://www.qrcode-monkey.com/)
   - Paste the JSON content as the QR code data
   - Generate and download the QR code image

### **Step 2: Test QR Scanning**

1. **Open QR Scanner**
   - From Dashboard, tap "📱 Scan Student QR Code"
   - Grant camera permissions if prompted

2. **Scan the Generated QR Code**
   - Point the camera at the generated QR code
   - The app should detect the QR code and extract student data
   - Verify the student details are displayed correctly

3. **Test Navigation Flow**
   - After scanning, the app should navigate to PaymentScreen
   - Verify all student details are passed correctly
   - Test the payment processing functionality

### **Step 3: Test Different Scenarios**

#### **Valid QR Codes**
Test with these student IDs:
- **STU001** - John Smith (Computer Science, $1250.00)
- **STU002** - Sarah Johnson (Business Administration, $850.50)
- **STU003** - Michael Chen (Engineering, $2100.75)
- **STU004** - Emily Davis (Arts & Humanities, $675.25)
- **STU005** - David Wilson (Medicine, $3200.00)

#### **Invalid QR Codes**
Test error handling with:
- Empty QR codes
- Invalid JSON format
- Unknown student IDs
- Malformed data

### **Step 4: Verify Data Flow**

#### **QR Code Content Format**
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

#### **Expected Flow**
1. **QR Code Scanned** → Extract JSON data
2. **Parse Student Data** → Convert JSON to Student object
3. **Fetch Details** → Call mock API with student ID
4. **Display Details** → Show student information
5. **Navigate to Payment** → Pass student data to PaymentScreen
6. **Process Payment** → Handle payment with student details

### **Step 5: Test Mock API Integration**

#### **Mock API Endpoints**
- `fetchStudentDetails(studentId)` - Fetches student data
- `processPayment(studentId, amount, method)` - Processes payment

#### **Test Cases**
1. **Valid Student ID**
   - Should return student details
   - Should navigate to PaymentScreen
   - Should display correct balance

2. **Invalid Student ID**
   - Should show error message
   - Should not navigate to PaymentScreen
   - Should allow rescanning

3. **Payment Processing**
   - Should show loading indicator
   - Should display success/failure message
   - Should return to Dashboard on success

### **Step 6: Debugging Tips**

#### **Common Issues**
1. **Camera Permission Denied**
   - Check app permissions in device settings
   - Restart app after granting permissions

2. **QR Code Not Detected**
   - Ensure good lighting
   - Hold camera steady
   - Try different QR code sizes

3. **Navigation Issues**
   - Check console for navigation errors
   - Verify screen names in navigation stack
   - Ensure proper parameter passing

#### **Console Logging**
Add these logs to debug:
```typescript
console.log('QR Code Scanned:', scannedData);
console.log('Student Data:', studentData);
console.log('Navigation Params:', route.params);
```

### **Step 7: Performance Testing**

#### **Test Scenarios**
1. **Multiple QR Codes**
   - Scan different QR codes rapidly
   - Verify no memory leaks
   - Check app responsiveness

2. **Large QR Codes**
   - Test with complex JSON data
   - Verify parsing performance
   - Check memory usage

3. **Error Recovery**
   - Test with corrupted QR codes
   - Verify error handling
   - Check app stability

### **Step 8: Integration Testing**

#### **End-to-End Flow**
1. **Dashboard** → **QR Scanner** → **Payment Screen** → **Dashboard**
2. **QR Code Generation** → **QR Scanner** → **Payment Processing**
3. **Error Handling** → **Retry Mechanism** → **Success Flow**

#### **Test Checklist**
- [ ] QR code generation works
- [ ] Camera permissions granted
- [ ] QR code detection works
- [ ] Student data parsing works
- [ ] Mock API integration works
- [ ] Navigation flow works
- [ ] Payment processing works
- [ ] Error handling works
- [ ] UI responsiveness maintained

### **Step 9: Manual Testing Steps**

1. **Generate QR Code**
   ```
   JSON Content: {"id":"STU001","name":"John Smith","email":"john.smith@university.edu","phone":"+1-555-0123","department":"Computer Science","balance":1250.00,"studentId":"STU001","semester":"Fall 2024","year":"2024"}
   ```

2. **Scan QR Code**
   - Open app → Dashboard → Scan QR Code
   - Point camera at generated QR code
   - Verify student details appear

3. **Process Payment**
   - Navigate to PaymentScreen
   - Verify student details are correct
   - Tap "Process Payment"
   - Verify success/failure handling

4. **Return to Dashboard**
   - After payment, should return to Dashboard
   - Verify app state is reset properly

### **Step 10: Automated Testing (Future)**

#### **Unit Tests**
```typescript
// Test QR code parsing
test('should parse valid QR code data', () => {
  const qrData = '{"studentId":"STU001","name":"John Smith"}';
  const result = parseQRData(qrData);
  expect(result.studentId).toBe('STU001');
});

// Test mock API
test('should fetch student details', async () => {
  const student = await fetchStudentDetails('STU001');
  expect(student.name).toBe('John Smith');
});
```

#### **Integration Tests**
```typescript
// Test complete flow
test('should scan QR and process payment', async () => {
  // Mock QR scan
  // Verify navigation
  // Test payment processing
});
```

This testing guide ensures comprehensive validation of the QR scanner functionality with mock data!
