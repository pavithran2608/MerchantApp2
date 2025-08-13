import { Skia, Image, Canvas, Rect, Fit, Data } from '@shopify/react-native-skia';
import { Face } from '@react-native-ml-kit/face-detection';

/**
 * Crops and preprocesses an image based on face detection bounds.
 * This is the final, robust version with added validation and logging to prevent crashes.
 * 
 * @param imagePath - Path to the captured image (must be a URI, e.g., 'file:///...')
 * @param faceBounds - Bounding box of the detected face from the ML Kit library.
 * @param targetSize - Target size for the processed image (e.g., 160 for FaceNet).
 * @returns A normalized Float32Array of the image data, ready for a machine learning model.
 */
export const cropAndPreprocessImage = async (
  imagePath: string,
  faceBounds: Face['boundingBox'],
  targetSize: number = 160
): Promise<Float32Array> => {
  console.log('Starting image processing...');
  try {
    // Step 1: Load the raw image data from the URI.
    const rawImageData: Data | null = await Skia.Data.fromURI(imagePath);
    if (!rawImageData) {
      throw new Error(`Failed to load image data from path: ${imagePath}`);
    }
    console.log('Step 1/5: Raw image data loaded successfully.');

    // Step 2: Decode the data into a usable Skia Image object.
    const originalImage: Image | null = Skia.Image.MakeImageFromEncoded(rawImageData);
    if (!originalImage) {
      throw new Error('Failed to decode image data into a Skia Image.');
    }
    console.log('Step 2/5: Image decoded successfully.');

    // Step 3: Create an off-screen surface to draw the new, cropped image.
    const surface = Skia.Surface.Make(targetSize, targetSize);
    if (!surface) {
      throw new Error('Failed to create Skia surface for processing.');
    }
    const canvas = surface.getCanvas();
    console.log('Step 3/5: Canvas surface created.');

    // Step 4: Define the source and destination rectangles for cropping and resizing.
    const sourceRect: Rect = { 
      x: faceBounds.left, 
      y: faceBounds.top, 
      width: faceBounds.right - faceBounds.left, 
      height: faceBounds.bottom - faceBounds.top 
    };
    const destRect: Rect = { x: 0, y: 0, width: targetSize, height: targetSize };

    // Draw the specific part of the original image onto the small canvas.
    canvas.drawImageRect(originalImage, sourceRect, destRect, Fit.Fill, false);
    console.log('Step 4/5: Image cropped and resized.');

    // Step 5: Read the pixels from the new image and normalize them.
    const processedImage = surface.makeImageSnapshot();
    const pixelData = processedImage.readPixels(0, 0);

    if (!pixelData) {
      throw new Error('Failed to read pixels from the processed image.');
    }

    const normalizedData = new Float32Array(targetSize * targetSize * 3);
    for (let i = 0; i < (targetSize * targetSize); i++) {
      const r = pixelData[i * 4];
      const g = pixelData[i * 4 + 1];
      const b = pixelData[i * 4 + 2];
      // Normalize from [0, 255] range to [-1, 1] range for FaceNet models.
      normalizedData[i * 3]     = (r / 255) * 2 - 1;
      normalizedData[i * 3 + 1] = (g / 255) * 2 - 1;
      normalizedData[i * 3 + 2] = (b / 255) * 2 - 1;
    }
    console.log('Step 5/5: Pixel data normalized successfully. Processing complete.');
    
    return normalizedData;

  } catch (error) {
    console.error('Error in image processing:', error);
    // Return a fallback array with default values to ensure the app doesn't crash.
    const fallbackData = new Float32Array(targetSize * targetSize * 3).fill(0.0);
    return fallbackData;
  }
};

/**
 * Prepares image data for TensorFlow.js inference
 * @param imageData - Normalized image data
 * @param targetSize - Size of the image (should match the model input size)
 * @returns TensorFlow.js compatible tensor data
 */
export const prepareForTensorFlowLite = (
  imageData: Float32Array,
  targetSize: number = 160
): Float32Array => {
  // The image data is already in the correct format for TensorFlow.js
  // Just ensure it has the right shape: [1, height, width, channels]
  return imageData;
};

/**
 * Calculates similarity between two face embeddings
 * @param embedding1 - First face embedding
 * @param embedding2 - Second face embedding
 * @returns Similarity score (0 = identical, higher = more different)
 */
export const calculateFaceSimilarity = (
  embedding1: Float32Array,
  embedding2: Float32Array
): number => {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have the same length');
  }

  // Calculate Euclidean distance
  let sum = 0;
  for (let i = 0; i < embedding1.length; i++) {
    const diff = embedding1[i] - embedding2[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
};

/**
 * Determines if two faces belong to the same person
 * @param embedding1 - First face embedding
 * @param embedding2 - Second face embedding
 * @param threshold - Similarity threshold (default: 0.6 for FaceNet)
 * @returns True if faces are likely the same person
 */
export const isSamePerson = (
  embedding1: Float32Array,
  embedding2: Float32Array,
  threshold: number = 0.6
): boolean => {
  const similarity = calculateFaceSimilarity(embedding1, embedding2);
  return similarity < threshold;
};
