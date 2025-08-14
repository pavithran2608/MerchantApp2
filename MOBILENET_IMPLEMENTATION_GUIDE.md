# MobileNet Implementation Guide

## Overview
This guide explains how to implement the real MobileNet model for face verification in your React Native app.

## Current Status
- ✅ **Mock Service**: Working demo implementation that generates fake embeddings
- 🔄 **Real MobileNet**: Ready to implement when you want production features

## What's Currently Working

### 1. Mock Embedding Service (`src/services/embeddingService.ts`)
- Generates realistic 1280-dimensional embedding vectors
- Simulates processing time and confidence scores
- Provides the same API as the real service
- Perfect for development and testing

### 2. Face Verification Screen
- Camera integration with react-native-vision-camera
- Student lookup by phone/ID
- Integration with the embedding service
- Complete UI flow

### 3. API Integration
- New `verifyFaceWithEmbedding` method
- Sends embeddings to backend
- Handles authentication and errors

## How to Implement Real MobileNet

### Step 1: Install Real TensorFlow.js Dependencies
```bash
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native
npm install react-native-image-manipulator  # For proper image processing
```

### Step 2: Replace Mock Service with Real Implementation

Replace the current `_generateMockEmbedding` method with real TensorFlow.js code:

```typescript
private async _loadAndPreprocessImage(imageUri: string): Promise<tf.Tensor3D> {
  try {
    // Use react-native-image-manipulator for proper image processing
    const { uri, width, height } = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 224, height: 224 } }],
      { format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    // Convert base64 to tensor
    const imageData = tf.util.base64StringToArrayBuffer(uri);
    const image = tf.node.decodeImage(new Uint8Array(imageData), 3);
    
    // Normalize pixel values: [0, 255] -> [-1, 1] (MobileNet preprocessing)
    const normalized = image.div(255.0).sub(0.5).mul(2);
    
    return normalized;
  } catch (error) {
    throw new Error(`Image preprocessing failed: ${error.message}`);
  }
}
```

### Step 3: Load Real MobileNet Model

Replace the mock initialization with real model loading:

```typescript
private async _initializeModel(): Promise<void> {
  try {
    console.log('Initializing TensorFlow.js...');
    await tf.ready();
    
    console.log('Setting backend to CPU...');
    await tf.setBackend('cpu');
    
    console.log('Loading MobileNet model...');
    this.model = await tf.loadLayersModel(
      'https://storage.googleapis.com/tfjs-models/tfhub/mobilenet_v2_100_224/model.json'
    );
    
    this.isModelLoaded = true;
    console.log('MobileNet model loaded successfully');
    
    // Warm up the model
    await this._warmUpModel();
    
  } catch (error) {
    throw new Error(`Model initialization failed: ${error.message}`);
  }
}
```

### Step 4: Generate Real Embeddings

Replace the mock embedding generation:

```typescript
async generateEmbedding(imageUri: string): Promise<EmbeddingResult> {
  if (!this.isModelLoaded || !this.model) {
    throw new Error('Model not loaded. Please call initialize() first.');
  }

  const startTime = Date.now();

  try {
    // Load and preprocess image
    const imageTensor = await this._loadAndPreprocessImage(imageUri);
    
    // Generate embedding using MobileNet
    const embedding = this.model.predict(imageTensor) as tf.Tensor;
    const embeddingArray = await embedding.array();
    
    // Cleanup tensors
    tf.dispose([imageTensor, embedding]);
    
    const processingTime = Date.now() - startTime;
    const confidence = this._calculateConfidence(embeddingArray[0]);
    
    return {
      embedding: embeddingArray[0],
      confidence,
      processingTime
    };
    
  } catch (error) {
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}
```

## Model Details

### MobileNet V2 Specifications
- **Input Size**: 224x224 pixels
- **Input Channels**: 3 (RGB)
- **Output Dimensions**: 1280
- **Model Size**: ~14-20MB
- **Preprocessing**: Normalize to [-1, 1] range

### Performance Characteristics
- **CPU Processing**: ~500ms - 2s per image
- **Memory Usage**: ~50-100MB during inference
- **Accuracy**: High for general image classification
- **Optimization**: Good for mobile devices

## Backend Integration

### API Endpoint
```typescript
POST /api/face-verification
{
  "studentId": "STU001",
  "embedding": [0.123, -0.456, ...], // 1280-dimensional vector
  "confidence": 0.85,
  "processingTime": 1500,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Backend Processing
1. **Receive embedding** from frontend
2. **Compare with stored embeddings** using cosine similarity
3. **Threshold-based verification** (e.g., similarity > 0.8)
4. **Return verification result**

## Testing the Current Implementation

### 1. Run the App
```bash
npx react-native run-android
```

### 2. Test Face Verification Flow
1. Go to POS screen
2. Add items to cart
3. Choose "Face Verification"
4. Enter demo phone: `555-0123`
5. Take a photo
6. Verify the mock embedding is generated

### 3. Check Console Logs
Look for:
- "Initializing embedding service..."
- "Embedding service initialized successfully"
- "Processing image: [path]"
- "Embedding generated: 1280 dimensions, confidence: [value]"

## Next Steps

### Phase 1: Current Demo (✅ Complete)
- Mock embedding service working
- UI flow complete
- API integration ready

### Phase 2: Real MobileNet (🔄 Ready to Implement)
- Install TensorFlow.js dependencies
- Replace mock service with real implementation
- Test with real model

### Phase 3: Production Optimization (📋 Future)
- Model quantization
- GPU acceleration
- Batch processing
- Caching strategies

## Troubleshooting

### Common Issues
1. **Model loading fails**: Check internet connection and model URL
2. **Memory issues**: Ensure adequate device memory
3. **Performance**: Use CPU backend for stability
4. **Image processing**: Verify image format and size

### Debug Commands
```typescript
// Check service status
console.log('Service ready:', embeddingService.isReady());
console.log('Model info:', embeddingService.getModelInfo());

// Test embedding generation
const result = await embeddingService.generateFaceEmbedding(imageUri);
console.log('Embedding result:', result);
```

## Support

For issues with the current implementation:
1. Check console logs for error messages
2. Verify all dependencies are installed
3. Ensure proper file permissions for camera
4. Test with demo credentials first

For real MobileNet implementation:
1. Follow the step-by-step guide above
2. Test with small images first
3. Monitor memory usage
4. Implement proper error handling
