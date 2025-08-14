import { Platform } from 'react-native';

/**
 * Utility functions for image processing and manipulation
 */

export interface ImageInfo {
  uri: string;
  width: number;
  height: number;
  size: number;
  type: string;
}

/**
 * Get image information including dimensions and file size
 */
export const getImageInfo = async (imageUri: string): Promise<ImageInfo> => {
  try {
    // For demo purposes, return basic info
    // In production, you'd use react-native-image-size or similar
    return {
      uri: imageUri,
      width: 0, // Will be determined during processing
      height: 0, // Will be determined during processing
      size: 1024, // Mock size for demo
      type: 'image/jpeg', // Default type
    };
  } catch (error) {
    console.error('Error getting image info:', error);
    throw new Error(`Failed to get image info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Validate image file before processing
 */
export const validateImage = async (imageUri: string): Promise<boolean> => {
  try {
    // Check file extension
    const extension = imageUri.split('.').pop()?.toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    
    if (!extension || !validExtensions.includes(extension)) {
      throw new Error('Invalid image format. Please use JPG, PNG, or WebP');
    }

    return true;
  } catch (error) {
    console.error('Image validation failed:', error);
    throw error;
  }
};

/**
 * Create a proper file URI for the platform
 */
export const createFileUri = (filePath: string): string => {
  if (Platform.OS === 'android') {
    return `file://${filePath}`;
  }
  return filePath;
};

/**
 * Convert image to base64 for processing
 */
export const imageToBase64 = async (imageUri: string): Promise<string> => {
  try {
    // For demo purposes, return a mock base64 string
    // In production, you'd use react-native-fs or similar
    console.log('Converting image to base64:', imageUri);
    return 'mock-base64-string-for-demo';
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error(`Failed to convert image to base64: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Save processed image to temporary directory
 */
export const saveProcessedImage = async (
  base64Data: string, 
  filename: string = `processed_${Date.now()}.jpg`
): Promise<string> => {
  try {
    // For demo purposes, return a mock file path
    // In production, you'd use react-native-fs or similar
    console.log('Saving processed image:', filename);
    return `file:///tmp/${filename}`;
  } catch (error) {
    console.error('Error saving processed image:', error);
    throw new Error(`Failed to save processed image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Clean up temporary image files
 */
export const cleanupTempImages = async (imageUris: string[]): Promise<void> => {
  try {
    // For demo purposes, just log the cleanup
    // In production, you'd use react-native-fs or similar
    console.log('Cleaning up temp images:', imageUris);
  } catch (error) {
    console.warn('Error cleaning up temp images:', error);
    // Don't throw error for cleanup failures
  }
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if image is suitable for face recognition
 */
export const isImageSuitableForFaceRecognition = (imageInfo: ImageInfo): boolean => {
  // Check minimum size requirements
  if (imageInfo.size < 1024) { // Less than 1KB
    return false;
  }

  // Check maximum size requirements
  if (imageInfo.size > 5 * 1024 * 1024) { // More than 5MB
    return false;
  }

  return true;
};
