# Merchant App - Student Payment Portal

A React Native merchant application that allows merchants to scan student QR codes and process payments.

## Features

- **Dashboard**: Main merchant interface with quick actions and statistics
- **QR Code Scanner**: Real-time QR code scanning for student identification
- **Payment Processing**: Student details display and payment processing
- **Mock API**: Simulated backend for testing student data and payments

## Student Data

The app includes mock data for 5 test students:

- **STU001**: John Smith (Computer Science) - $1,250.00 balance
- **STU002**: Sarah Johnson (Business Administration) - $850.50 balance
- **STU003**: Michael Chen (Engineering) - $2,100.75 balance
- **STU004**: Emily Davis (Arts & Humanities) - $675.25 balance
- **STU005**: David Wilson (Medicine) - $3,200.00 balance

## How to Test

### 1. Generate Test QR Codes

1. Go to any online QR code generator (e.g., qr-code-generator.com)
2. Encode one of the student IDs: `STU001`, `STU002`, `STU003`, `STU004`, or `STU005`
3. Generate the QR code image

### 2. Test the App Flow

1. **Start the app**: `npx react-native run-android`
2. **Navigate to Scanner**: Tap "📱 Scan Student QR Code" on the dashboard
3. **Scan QR Code**: Point camera at the generated QR code
4. **View Student Details**: App will fetch and display student information
5. **Process Payment**: Navigate to payment screen and process the transaction

## App Flow

```
Dashboard → QR Scanner → Payment Screen → Success/Back to Dashboard
```

### Dashboard
- Overview of merchant activities
- Quick access to QR scanner
- Test QR codes information
- Recent transaction history

### QR Scanner
- Real-time camera scanning
- Student ID extraction from QR codes
- API call to fetch student details
- Navigation to payment screen

### Payment Screen
- Complete student information display
- Current balance and payment amount
- Payment processing with mock API
- Success/failure handling

## Technical Implementation

### Libraries Used
- `@react-navigation/native` & `@react-navigation/stack`: Navigation
- `react-native-qrcode-scanner`: QR code scanning
- `react-native-camera`: Camera functionality
- `react-native-safe-area-context`: Safe area handling

### Key Components
- **Dashboard**: Main merchant interface
- **QrScanner**: Camera-based QR code scanning
- **PaymentScreen**: Payment processing interface
- **Mock API**: Simulated backend services

### Data Flow
1. QR code contains student ID (e.g., "STU001")
2. Scanner extracts ID and calls `fetchStudentDetails()`
3. Mock API returns student data
4. App navigates to PaymentScreen with student details
5. Payment processing calls `processPayment()` API
6. Success/failure feedback to user

## Installation & Setup

### Prerequisites
- Node.js and npm
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Install navigation dependencies**:
   ```bash
   npm install @react-navigation/native @react-navigation/stack react-native-screens react-native-safe-area-context
   ```

3. **For iOS** (if developing on macOS):
   ```bash
   cd ios && pod install
   ```

4. **Start Metro bundler**:
   ```bash
   npx react-native start
   ```

5. **Run on Android**:
   ```bash
   npx react-native run-android
   ```

6. **Run on iOS** (macOS only):
   ```bash
   npx react-native run-ios
   ```

## Testing QR Codes

### Method 1: Online QR Generator
1. Visit qr-code-generator.com
2. Enter student ID (e.g., "STU001")
3. Generate QR code
4. Scan with app

### Method 2: Mobile QR Generator Apps
- Use any QR code generator app
- Encode student ID as text
- Generate and scan

### Method 3: Physical QR Codes
- Print generated QR codes
- Test with physical scanning

## Mock API Details

### Student Data Structure
```typescript
interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  balance: number;
  studentId: string;
  semester: string;
  year: string;
}
```

### API Endpoints (Mock)
- `fetchStudentDetails(studentId)`: Returns student information
- `processPayment(studentId, amount, method)`: Processes payment

## Troubleshooting

### Common Issues

1. **Camera Permission**: Ensure camera permissions are granted
2. **QR Code Not Detected**: Make sure QR code is clear and well-lit
3. **Navigation Issues**: Check that all navigation dependencies are installed
4. **Build Errors**: Clean and rebuild the project

### Build Commands
```bash
# Clean build
cd android && ./gradlew clean && cd ..
npx react-native run-android

# Reset cache
npx react-native start --reset-cache
```

## Future Enhancements

- Real backend API integration
- Payment gateway integration
- Transaction history
- Receipt generation
- Offline mode support
- Push notifications
- Analytics dashboard

## License

This project is for educational and testing purposes.
