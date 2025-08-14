import Tflite from 'react-native-fast-tflite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Define the Tflite interface for type safety
interface TfliteModel {
  run: (input: Float32Array) => number[];
  dispose: () => void;
}

export interface EmbeddingResult {
  embedding: number[];
  confidence: number;
  processingTime: number;
}

export interface StoredFaceData {
  studentId: string;
  embedding: number[];
  timestamp: string;
  imageUri?: string;
}

export class EmbeddingService {
  private model: TfliteModel | null = null;
  private isModelLoaded = false;
  private isLoading = false;
  private modelLoadPromise: Promise<void> | null = null;
  private storedEmbeddings: Map<string, number[]> = new Map();

  /**
   * Initialize the TFLite environment and load the model
   */
  async initialize(): Promise<void> {
    if (this.isModelLoaded) {
      return;
    }

    if (this.isLoading) {
      return this.modelLoadPromise!;
    }

    this.isLoading = true;
    this.modelLoadPromise = this._initializeModel();
    
    try {
      await this.modelLoadPromise;
    } finally {
      this.isLoading = false;
    }
  }

  private async _initializeModel(): Promise<void> {
    try {
      console.log('Initializing TFLite model...');
      
      // Try to load the real TFLite model first
      try {
        const modelPath = 'mobilenet_v2_face_recognition.tflite';
        console.log('Attempting to load real TFLite model:', modelPath);
        
        // Import the actual Tflite class
        const Tflite = require('react-native-fast-tflite').default;
        this.model = new Tflite(modelPath);
        
        console.log('Real TFLite model loaded successfully!');
        
      } catch (realModelError) {
        console.warn('Failed to load real TFLite model, falling back to mock:', realModelError);
        
        // Fallback to mock model if real model fails
        await this._createMockModel();
      }
      
      // Load stored embeddings from AsyncStorage
      await this.loadStoredEmbeddings();
      
      this.isModelLoaded = true;
      console.log('TFLite model initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize TFLite model:', error);
      this.isModelLoaded = false;
      throw new Error(`Model initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a mock TFLite model for testing
   */
  private async _createMockModel(): Promise<void> {
    // Simulate model loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a mock model object that mimics Tflite behavior
    this.model = {
      run: (input: Float32Array) => {
        // Generate a mock 1280-dimensional embedding (MobileNet output size)
        const embedding = new Array(1280).fill(0).map(() => (Math.random() - 0.5) * 2);
        return embedding;
      },
      dispose: () => {
        console.log('Mock model disposed');
      }
    } as any;
  }

  /**
   * Load stored embeddings from AsyncStorage
   */
  private async loadStoredEmbeddings(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const faceKeys = keys.filter(key => key.startsWith('face_'));
      
      for (const key of faceKeys) {
        const studentId = key.replace('face_', '');
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const faceData: StoredFaceData = JSON.parse(data);
          this.storedEmbeddings.set(studentId, faceData.embedding);
        }
      }
      
      console.log(`Loaded ${this.storedEmbeddings.size} stored face embeddings`);
    } catch (error) {
      console.warn('Failed to load stored embeddings:', error);
    }
  }

  /**
   * Store a student's face embedding
   */
  async storeStudentFace(studentId: string, imageUri: string): Promise<void> {
    if (!this.isModelLoaded || !this.model) {
      throw new Error('Model not loaded. Please call initialize() first.');
    }

    console.log(`Storing face data for student: ${studentId}`);
    
    // Generate embedding
    const embeddingResult = await this.generateFaceEmbedding(imageUri);
    
    // Store in memory
    this.storedEmbeddings.set(studentId, embeddingResult.embedding);
    
    // Store in AsyncStorage for persistence
    const faceData: StoredFaceData = {
      studentId,
      embedding: embeddingResult.embedding,
      timestamp: new Date().toISOString(),
      imageUri
    };
    
    await AsyncStorage.setItem(`face_${studentId}`, JSON.stringify(faceData));
    
    console.log(`Face data stored successfully for student: ${studentId}`);
  }

  /**
   * Verify face against stored data
   */
  async verifyStudentFace(studentId: string, imageUri: string): Promise<{
    success: boolean;
    similarity: number;
    message: string;
  }> {
    if (!this.isModelLoaded || !this.model) {
      throw new Error('Model not loaded. Please call initialize() first.');
    }

    const storedEmbedding = this.storedEmbeddings.get(studentId);
    if (!storedEmbedding) {
      throw new Error('No stored face data for this student. Please register their face first.');
    }

    console.log(`Verifying face for student: ${studentId}`);
    
    // Generate new embedding
    const newEmbeddingResult = await this.generateFaceEmbedding(imageUri);
    
    // Calculate similarity
    const similarity = EmbeddingService.compareEmbeddings(
      storedEmbedding, 
      newEmbeddingResult.embedding
    );
    
    console.log(`Similarity score: ${similarity.toFixed(3)}`);
    
    // Threshold for verification (0.8 = 80% similarity)
    const threshold = 0.8;
    const success = similarity > threshold;
    
    return {
      success,
      similarity,
      message: success 
        ? `Face verification successful! Similarity: ${(similarity * 100).toFixed(1)}%`
        : `Face verification failed. Similarity: ${(similarity * 100).toFixed(1)}% (required: ${(threshold * 100).toFixed(1)}%)`
    };
  }

  /**
   * Generate embedding from an image URI
   */
  async generateEmbedding(imageUri: string): Promise<EmbeddingResult> {
    if (!this.isModelLoaded || !this.model) {
      throw new Error('Model not loaded. Please call initialize() first.');
    }

    const startTime = Date.now();

    try {
      console.log('Processing image:', imageUri);
      
      // Preprocess image for TFLite model
      const preprocessedImage = await this._preprocessImageForTFLite(imageUri);
      
      // Run inference using TFLite
      const embedding = this.model!.run(preprocessedImage);
      
      const processingTime = Date.now() - startTime;
      const confidence = this._calculateConfidence(embedding);
      
      console.log(`Embedding generated in ${processingTime}ms, confidence: ${confidence.toFixed(3)}`);
      
      return {
        embedding,
        confidence,
        processingTime
      };
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('Error generating embedding:', error);
      throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate face-specific embedding
   */
  async generateFaceEmbedding(imageUri: string): Promise<EmbeddingResult> {
    return this.generateEmbedding(imageUri);
  }

  /**
   * Preprocess image for TFLite model
   */
  private async _preprocessImageForTFLite(imageUri: string): Promise<Float32Array> {
    try {
      console.log('Preprocessing image for TFLite:', imageUri);
      
      // For now, create a mock preprocessed image
      // In production, you'd implement real image preprocessing
      const inputSize = 224; // MobileNet input size
      const channels = 3; // RGB
      const totalPixels = inputSize * inputSize * channels;
      
      // Create a mock Float32Array with normalized values [-1, 1]
      const preprocessedData = new Float32Array(totalPixels);
      for (let i = 0; i < totalPixels; i++) {
        // Mock normalized pixel values
        preprocessedData[i] = (Math.random() - 0.5) * 2;
      }
      
      console.log(`Preprocessed image: ${inputSize}x${inputSize}x${channels} = ${totalPixels} pixels`);
      return preprocessedData;
      
    } catch (error) {
      console.error('Error preprocessing image:', error);
      throw new Error(`Image preprocessing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate confidence score based on embedding magnitude
   */
  private _calculateConfidence(embedding: number[]): number {
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    const normalizedConfidence = Math.min(magnitude / 10, 1.0);
    return normalizedConfidence;
  }

  /**
   * Compare two embeddings and return similarity score
   */
  static compareEmbeddings(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same length');
    }

    // Calculate cosine similarity
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (norm1 * norm2);
  }

  /**
   * Check if the service is ready
   */
  isReady(): boolean {
    return this.isModelLoaded && this.model !== null;
  }

  /**
   * Get service information
   */
  getModelInfo(): { isLoaded: boolean; modelType: string; inputShape: number[]; storedFaces: number; isRealModel: boolean } {
    return {
      isLoaded: this.isModelLoaded,
      modelType: this.model && this.model.constructor.name === 'Tflite' ? 'MobileNet V2 (Real TFLite)' : 'MobileNet V2 (Mock)',
      inputShape: [224, 224, 3], // Standard MobileNet input
      storedFaces: this.storedEmbeddings.size,
      isRealModel: !!(this.model && this.model.constructor.name === 'Tflite')
    };
  }

  /**
   * Get list of students with stored face data
   */
  getStoredStudents(): string[] {
    return Array.from(this.storedEmbeddings.keys());
  }

  /**
   * Remove stored face data for a student
   */
  async removeStudentFace(studentId: string): Promise<void> {
    this.storedEmbeddings.delete(studentId);
    await AsyncStorage.removeItem(`face_${studentId}`);
    console.log(`Removed face data for student: ${studentId}`);
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.isModelLoaded = false;
    this.isLoading = false;
    this.modelLoadPromise = null;
    this.storedEmbeddings.clear();
  }
}

// Export a singleton instance
export const embeddingService = new EmbeddingService();
