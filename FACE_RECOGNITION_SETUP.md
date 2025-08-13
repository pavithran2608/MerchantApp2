# Face Recognition Setup Guide

This guide will help you set up the face recognition feature in your React Native application.

## 📦 Required Libraries

You need to install the following packages:

```bash
npm install vision-camera-face-detector @shopify/react-native-skia @tensorflow/tfjs-react-native
```

### Library Details:

1. **vision-camera-face-detector** - Face detection plugin for react-native-vision-camera
2. **@tensorflow/tfjs-react-native** - TensorFlow.js for React Native (machine learning)
3. **@shopify/react-native-skia** - Graphics library for image processing

## 🔧 Installation Steps

### 1. Install Dependencies

```bash
npm install vision-camera-face-detector @shopify/react-native-skia @tensorflow/tfjs-react-native
```

### 2. iOS Setup (if applicable)

For iOS, you'll need to install pods:

```bash
cd ios && pod install && cd ..
```

### 3. Android Setup

For Android, you may need to update your `android/app/build.gradle` to include TensorFlow Lite dependencies.

### 4. Add TensorFlow.js Model

1. Download a FaceNet model (`.json` and `.bin` files for TensorFlow.js)
2. Place it in your project's assets folder
3. Update the model path in `FaceScanner.tsx`

## 🚀 Implementation Steps

### Step 1: Update Navigation

The `FaceScanner` screen has been added to your navigation types. You can now navigate to it:

```typescript
navigation.navigate('FaceScanner');
```

### Step 2: Implement Image Processing

The current implementation includes placeholders for image processing. You need to implement the `cropAndPreprocessImage` function in `src/utils/imageProcessing.ts` using react-native-skia.

### Step 3: Configure TensorFlow.js

1. Uncomment the TensorFlow.js import in `FaceScanner.tsx`
2. Update the model path to point to your `.json` model file
3. Implement the inference logic

### Step 4: Set Up Backend API

Update the API endpoints in `src/services/faceRecognitionApi.ts` to point to your actual backend.

## 📁 Files Created/Modified

### New Files:
- `src/FaceScanner.tsx` - Main face recognition component
- `src/utils/imageProcessing.ts` - Image processing utilities
- `src/services/faceRecognitionApi.ts` - API service for face recognition
- `FACE_RECOGNITION_SETUP.md` - This setup guide

### Modified Files:
- `src/types.ts` - Added FaceScanner to navigation types

## 🔍 Current Implementation Status

### ✅ Completed:
- Face detection using vision-camera-face-detector
- Camera setup with front-facing camera
- UI with face bounding box overlay
- Basic capture functionality
- Navigation integration
- API service structure

### ⏳ To Be Implemented:
- Image cropping and preprocessing (using react-native-skia)
- TensorFlow.js model integration
- Backend API integration
- Error handling and validation

## 🛠️ Next Steps

### 1. Image Processing Implementation

You need to implement the `cropAndPreprocessImage` function in `src/utils/imageProcessing.ts`. Here's a basic structure:

```typescript
import { Canvas, Image, Skia } from '@shopify/react-native-skia';

export const cropAndPreprocessImage = async (
  imagePath: string,
  faceBounds: Face['bounds'],
  targetSize: number = 160
): Promise<ProcessedImage> => {
  // Load image using react-native-skia
  // Crop to face bounds
  // Resize to target size
  // Normalize pixel values
  // Return processed data
};
```

### 2. TensorFlow.js Integration

1. Download a FaceNet model (e.g., from TensorFlow Hub)
2. Place it in your assets folder
3. Update the model path in `FaceScanner.tsx`
4. Implement the inference logic

### 3. Backend API Setup

Your backend should provide these endpoints:
- `POST /api/face-recognition` - Recognize a face
- `POST /api/face-registration` - Register a new face
- `PUT /api/face-update` - Update existing face
- `DELETE /api/face-delete/:userId` - Delete a face

## 🧪 Testing

1. Run the app and navigate to the FaceScanner screen
2. Grant camera permissions
3. Test face detection (green bounding box should appear)
4. Test capture functionality
5. Verify console logs for debugging

## 🔧 Troubleshooting

### Common Issues:

1. **Camera not working**: Check permissions and device availability
2. **Face detection not working**: Ensure vision-camera-face-detector is properly installed
3. **TensorFlow.js errors**: Check model file path and format
4. **Image processing errors**: Verify react-native-skia installation

### Debug Tips:

- Check console logs for detailed error messages
- Verify all dependencies are properly installed
- Test on both iOS and Android devices
- Ensure camera permissions are granted

## 📚 Additional Resources

- [react-native-vision-camera Documentation](https://mrousavy.com/react-native-vision-camera/)
- [vision-camera-face-detector](https://github.com/mrousavy/vision-camera-face-detector)
- [@tensorflow/tfjs-react-native](https://github.com/tensorflow/tfjs/tree/master/tfjs-react-native)
- [react-native-skia Documentation](https://shopify.github.io/react-native-skia/)

## 🎯 Example Usage

```typescript
// Navigate to face scanner
navigation.navigate('FaceScanner');

// The component will handle:
// - Camera permissions
// - Face detection
// - Image capture
// - Processing and API calls
```

## 📝 Notes

- The face detection runs at 5 FPS to save battery
- The component uses the front-facing camera by default
- Face embeddings are 128-dimensional vectors
- Similarity threshold is typically 0.7 for FaceNet models
- Image processing should normalize to [0, 1] or [-1, 1] range

## 🔒 Security Considerations

- Store face embeddings securely on your backend
- Implement proper authentication for API calls
- Consider GDPR compliance for face data storage
- Use HTTPS for all API communications
- Implement rate limiting for face recognition requests
