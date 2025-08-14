import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
import { Platform } from 'react-native';

// Initialize TensorFlow.js for React Native
export const initializeTensorFlow = async (): Promise<void> => {
  try {
    // Wait for TensorFlow.js to be ready
    await tf.ready();
    
    console.log('TensorFlow.js initialized successfully');
    
    // Set backend to CPU for React Native
    await tf.setBackend('cpu');
    
    console.log('TensorFlow.js backend set to CPU');
  } catch (error) {
    console.error('Failed to initialize TensorFlow.js:', error);
    throw error;
  }
};

// Load a TensorFlow.js model
export const loadModel = async (modelJson: any, modelWeights: any): Promise<tf.LayersModel> => {
  try {
    const model = await bundleResourceIO(modelJson, modelWeights);
    console.log('Model loaded successfully');
    return model;
  } catch (error) {
    console.error('Failed to load model:', error);
    throw error;
  }
};

// Clean up TensorFlow.js resources
export const cleanupTensorFlow = (): void => {
  try {
    tf.dispose();
    console.log('TensorFlow.js resources cleaned up');
  } catch (error) {
    console.error('Failed to cleanup TensorFlow.js:', error);
  }
};

// Check if TensorFlow.js is ready
export const isTensorFlowReady = (): boolean => {
  return tf.getBackend() !== undefined;
};
