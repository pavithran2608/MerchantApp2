# NFC Setup Guide for SnapTap Merchant App

## 🎯 **Overview**
This guide covers the complete setup and implementation of NFC (Near Field Communication) functionality in your SnapTap Merchant App for reading student ID cards and processing payments.

## 📦 **Part 1: Library Installation**

### 1.1 Install NFC Library
```bash
npm install react-native-nfc-manager --legacy-peer-deps
```

**Note**: We use `--legacy-peer-deps` to resolve dependency conflicts with TensorFlow.js.

### 1.2 iOS Setup (if applicable)
```bash
cd ios && pod install && cd ..
```

## 🔧 **Part 2: Native Configuration**

### 2.1 Android Configuration

#### AndroidManifest.xml Updates
The following permissions and intent filters have been added:

```xml
<!-- NFC Permissions -->
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc" android:required="true" />

<!-- NFC Intent Filters -->
<intent-filter>
    <action android:name="android.nfc.action.NDEF_DISCOVERED" />
    <category android:name="android.intent.category.DEFAULT" />
    <data android:mimeType="text/plain" />
</intent-filter>

<intent-filter>
    <action android:name="android.nfc.action.TAG_DISCOVERED" />
    <category android:name="android.intent.category.DEFAULT" />
</intent-filter>

<intent-filter>
    <action android:name="android.nfc.action.TECH_DISCOVERED" />
    <category android:name="android.intent.category.DEFAULT" />
</intent-filter>
```

#### NFC Tech Filter (nfc_tech_filter.xml)
Created `android/app/src/main/res/xml/nfc_tech_filter.xml` with support for:
- NDEF (NFC Data Exchange Format)
- Mifare Classic/Ultralight
- NFC-A, NFC-B, NFC-F, NFC-V
- ISO-DEP

### 2.2 iOS Configuration

#### Info.plist Updates
Added the following keys:

```xml
<key>NFCReaderUsageDescription</key>
<string>This app uses NFC to read student ID cards for payment verification</string>

<key>UIRequiredDeviceCapabilities</key>
<array>
    <string>arm64</string>
    <string>nfc</string>
</array>
```

#### Xcode Project Settings
1. Open your project in Xcode
2. Select your target
3. Go to "Signing & Capabilities"
4. Click "+ Capability"
5. Add "Near Field Communication Tag Reading"

## 🚀 **Part 3: Implementation Details**

### 3.1 NFC Verification Screen Features

#### State Management
- **`nfcStatus`**: Tracks current NFC operation state
  - `waiting`: Initializing NFC
  - `scanning`: Actively listening for NFC tags
  - `processing`: Verifying card and processing payment
  - `success`: Payment completed successfully
  - `error`: An error occurred

#### Core NFC Functions

##### `startNfcScan()`
- Initializes NFC technology request (`NfcTech.Ndef`)
- Waits for tag detection using `NfcManager.getTag()`
- Extracts student ID from NDEF message
- Handles errors and user cancellation

##### `extractStudentIdFromNdef()`
- Parses NDEF message payload
- Looks for student ID patterns:
  - `STU001`, `student:12345`, `id:12345`
  - Falls back to alphanumeric ID extraction
- Returns extracted student ID or null

##### `processNfcVerification()`
- Calls API with extracted student ID
- Handles success/failure navigation
- Updates UI state accordingly

### 3.2 UI Components

#### Dynamic Status Display
- **Status Container**: Shows current operation state with icons
- **Error Container**: Displays errors with retry button
- **Student ID Display**: Shows extracted student ID when found
- **Instructions**: Provides user guidance during scanning

#### Visual Feedback
- **Icons**: Different emojis for each state (⏳📱⚡✅❌)
- **Loading Spinner**: Shows during processing
- **Color Coding**: Uses theme colors for consistency

## 📱 **Part 4: Usage Instructions**

### 4.1 For Users
1. **Navigate to NFC Payment**: From POS screen, tap "Checkout" → "Scan Student NFC Card"
2. **Position Card**: Hold student's NFC card against the back of your phone
3. **Wait for Detection**: Keep card in place for 1-2 seconds
4. **Follow Instructions**: Screen will guide you through the process

### 4.2 For Developers
1. **Testing**: Use NFC-enabled Android devices or iPhone 7+ with iOS 11+
2. **Debugging**: Check console logs for NFC operations
3. **Error Handling**: App gracefully handles NFC errors and provides retry options

## 🔍 **Part 5: Testing and Debugging**

### 5.1 NFC Card Requirements
- **Format**: NDEF-compatible NFC tags
- **Data**: Should contain student ID in readable format
- **Compatibility**: Works with most NFC-A/B/F/V technologies

### 5.2 Common Issues and Solutions

#### "NFC is not supported on this device"
- **Cause**: Device doesn't have NFC hardware
- **Solution**: Test on NFC-enabled device

#### "No readable data found on NFC card"
- **Cause**: Card format is not NDEF or data is corrupted
- **Solution**: Ensure card is properly formatted with student ID

#### "User cancelled" error
- **Cause**: User moved card away too quickly
- **Solution**: Keep card in place for 1-2 seconds

### 5.3 Debug Logs
The app logs detailed NFC operations:
```
NFC initialization failed: [error details]
NFC scan error: [error details]
Error extracting student ID from NDEF: [error details]
```

## 🛠 **Part 6: Customization**

### 6.1 Student ID Extraction
Modify `extractStudentIdFromNdef()` function to match your NFC card format:

```typescript
// Example: Custom pattern for your cards
const customPattern = payload.match(/YOUR_PATTERN_(\w+)/);
if (customPattern) {
    return customPattern[1];
}
```

### 6.2 API Integration
Update the `verifyNfc` API call to include the extracted student ID:

```typescript
const result = await api.verifyNfc({ 
    cartItems, 
    totalAmount,
    nfcCardId: nfcStudentId // Add this field to your API
});
```

## 📋 **Part 7: Checklist**

### ✅ **Installation**
- [ ] `react-native-nfc-manager` installed
- [ ] iOS pods installed (if applicable)

### ✅ **Android Configuration**
- [ ] NFC permissions added to AndroidManifest.xml
- [ ] NFC intent filters configured
- [ ] nfc_tech_filter.xml created

### ✅ **iOS Configuration**
- [ ] NFC capability added in Xcode
- [ ] Info.plist updated with NFC keys
- [ ] NFCReaderUsageDescription added

### ✅ **Testing**
- [ ] App builds without errors
- [ ] NFC screen loads properly
- [ ] NFC scanning works on test device
- [ ] Student ID extraction works
- [ ] API integration successful

## 🎉 **Success Indicators**

When everything is working correctly, you should see:
1. **NFC screen loads** without errors
2. **Status shows "scanning"** when ready
3. **Card detection works** when NFC card is tapped
4. **Student ID is extracted** and displayed
5. **Payment processing** completes successfully
6. **Navigation to success screen** works

## 🆘 **Troubleshooting**

If you encounter issues:
1. **Check console logs** for detailed error messages
2. **Verify NFC permissions** in device settings
3. **Test with different NFC cards** to isolate card-specific issues
4. **Ensure device has NFC hardware** and it's enabled
5. **Check native configuration** files for syntax errors

---

**Note**: NFC functionality requires physical NFC hardware and may not work in emulators. Always test on real devices with NFC capabilities.
