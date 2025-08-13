// Face Recognition API Service
// This service handles communication with your backend for face recognition

export interface FaceRecognitionRequest {
  embedding: number[];
  userId?: string;
  action: 'recognize' | 'register' | 'update' | 'delete';
}

export interface FaceRecognitionResponse {
  success: boolean;
  message: string;
  userId?: string;
  userName?: string;
  confidence?: number;
  error?: string;
}

export interface FaceRegistrationRequest {
  embedding: number[];
  userId: string;
  userName: string;
  email?: string;
}

export interface FaceUpdateRequest {
  embedding: number[];
  userId: string;
}

export interface FaceDeleteRequest {
  userId: string;
}

// Configuration
const API_BASE_URL = 'https://your-backend-api.com/api'; // Replace with your actual API URL
const API_TIMEOUT = 10000; // 10 seconds

/**
 * Sends a face embedding to the backend for recognition
 * @param embedding - The 128-dimensional face embedding
 * @returns Promise with recognition result
 */
export const recognizeFace = async (embedding: number[]): Promise<FaceRecognitionResponse> => {
  try {
    console.log('Sending face embedding for recognition...');
    console.log('Embedding length:', embedding.length);
    console.log('Sample values:', embedding.slice(0, 5));

    const request: FaceRecognitionRequest = {
      embedding,
      action: 'recognize'
    };

    const response = await fetch(`${API_BASE_URL}/face-recognition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY', // Replace with your API key
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(API_TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: FaceRecognitionResponse = await response.json();
    console.log('Recognition response:', result);
    
    return result;
  } catch (error) {
    console.error('Face recognition API error:', error);
    return {
      success: false,
      message: 'Failed to recognize face',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Registers a new face embedding in the database
 * @param embedding - The 128-dimensional face embedding
 * @param userId - Unique identifier for the user
 * @param userName - Display name for the user
 * @param email - Optional email address
 * @returns Promise with registration result
 */
export const registerFace = async (
  embedding: number[],
  userId: string,
  userName: string,
  email?: string
): Promise<FaceRecognitionResponse> => {
  try {
    console.log('Registering new face embedding...');
    console.log('User ID:', userId);
    console.log('User Name:', userName);

    const request: FaceRegistrationRequest = {
      embedding,
      userId,
      userName,
      email
    };

    const response = await fetch(`${API_BASE_URL}/face-registration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY', // Replace with your API key
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(API_TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: FaceRecognitionResponse = await response.json();
    console.log('Registration response:', result);
    
    return result;
  } catch (error) {
    console.error('Face registration API error:', error);
    return {
      success: false,
      message: 'Failed to register face',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Updates an existing face embedding for a user
 * @param embedding - The new 128-dimensional face embedding
 * @param userId - Unique identifier for the user
 * @returns Promise with update result
 */
export const updateFaceEmbedding = async (
  embedding: number[],
  userId: string
): Promise<FaceRecognitionResponse> => {
  try {
    console.log('Updating face embedding for user:', userId);

    const request: FaceUpdateRequest = {
      embedding,
      userId
    };

    const response = await fetch(`${API_BASE_URL}/face-update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY', // Replace with your API key
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(API_TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: FaceRecognitionResponse = await response.json();
    console.log('Update response:', result);
    
    return result;
  } catch (error) {
    console.error('Face update API error:', error);
    return {
      success: false,
      message: 'Failed to update face embedding',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Deletes a face embedding from the database
 * @param userId - Unique identifier for the user to delete
 * @returns Promise with deletion result
 */
export const deleteFaceEmbedding = async (userId: string): Promise<FaceRecognitionResponse> => {
  try {
    console.log('Deleting face embedding for user:', userId);

    const request: FaceDeleteRequest = {
      userId
    };

    const response = await fetch(`${API_BASE_URL}/face-delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY', // Replace with your API key
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(API_TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: FaceRecognitionResponse = await response.json();
    console.log('Delete response:', result);
    
    return result;
  } catch (error) {
    console.error('Face deletion API error:', error);
    return {
      success: false,
      message: 'Failed to delete face embedding',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Test function to simulate API calls for development
 * @param embedding - The face embedding
 * @param action - The action to simulate
 * @returns Simulated API response
 */
export const simulateApiCall = async (
  embedding: number[],
  action: 'recognize' | 'register' | 'update' | 'delete' = 'recognize'
): Promise<FaceRecognitionResponse> => {
  console.log(`Simulating ${action} API call...`);
  console.log('Embedding length:', embedding.length);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate different responses based on action
  switch (action) {
    case 'recognize':
      return {
        success: true,
        message: 'Face recognized successfully',
        userId: 'user_123',
        userName: 'John Doe',
        confidence: 0.95
      };
    case 'register':
      return {
        success: true,
        message: 'Face registered successfully',
        userId: 'user_456'
      };
    case 'update':
      return {
        success: true,
        message: 'Face embedding updated successfully'
      };
    case 'delete':
      return {
        success: true,
        message: 'Face embedding deleted successfully'
      };
    default:
      return {
        success: false,
        message: 'Unknown action'
      };
  }
};
