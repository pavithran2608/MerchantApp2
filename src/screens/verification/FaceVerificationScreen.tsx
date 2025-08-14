import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { api, Student, CartItem, FaceVerificationResponse, FindStudentResponse } from '../../services/api';
import { embeddingService } from '../../services/embeddingService';

import { useTheme } from '../../contexts/ThemeContext';

type RootStackParamList = {
  FaceVerification: {
    cartData?: CartItem[];
    totalAmount?: number;
  };
  TransactionConfirmation: {
    transactionId: string;
    student: Student;
    cartItems: CartItem[];
    totalAmount: number;
  };
  TransactionFailure: { errorMessage: string };
};

type FaceVerificationRouteProp = RouteProp<RootStackParamList, 'FaceVerification'>;
type FaceVerificationNavigationProp = StackNavigationProp<RootStackParamList, 'FaceVerification'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const FaceVerificationScreen: React.FC = () => {
  const navigation = useNavigation<FaceVerificationNavigationProp>();
  const route = useRoute<FaceVerificationRouteProp>();
  const { cartData = [], totalAmount = 0 } = route.params;
  const { colors } = useTheme();

  // State management
  const [currentStep, setCurrentStep] = useState<'enterPhone' | 'scanFace'>('enterPhone');
  const [parentPhone, setParentPhone] = useState('');
  const [registrationId, setRegistrationId] = useState('');
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  // Remove verificationMode state - no longer needed

  // Camera setup
  const { hasPermission, requestPermission } = useCameraPermission();
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('front');
  const device = useCameraDevice(cameraPosition);
  const camera = useRef<Camera>(null);

  const onFlipCamera = useCallback(() => {
    setCameraPosition((p) => (p === 'front' ? 'back' : 'front'));
  }, []);

  // Get cart data from navigation params
  useEffect(() => {
    if (cartData.length === 0 || totalAmount === 0) {
      Alert.alert(
        'Invalid Cart Data',
        'No cart items or total amount found. Please return to POS and try again.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
  }, [cartData, totalAmount, navigation]);

  // Request camera permission on mount
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // Initialize embedding service when component mounts
  useEffect(() => {
    const initializeService = async () => {
      try {
        setIsModelLoading(true);
        await embeddingService.initialize();
        console.log('Embedding service initialized successfully');
      } catch (error) {
        console.error('Failed to initialize embedding service:', error);
        Alert.alert(
          'Service Error',
          'Failed to initialize face recognition service. Please restart the app.'
        );
      } finally {
        setIsModelLoading(false);
      }
    };

    initializeService();
  }, []);

  const handleFindStudent = async () => {
    // Check if at least one field is filled
    if (!parentPhone.trim() && !registrationId.trim()) {
      Alert.alert('Error', 'Please enter either the parent\'s mobile number or the student\'s registration ID');
      return;
    }

    // If both fields are filled, prioritize phone number
    if (parentPhone.trim() && registrationId.trim()) {
      // Clear registration ID to avoid confusion
      setRegistrationId('');
    }

    setIsLoading(true);
    try {
      let response: FindStudentResponse;

      if (parentPhone.trim()) {
        // Search by phone number
        // Basic phone number validation
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(parentPhone.replace(/[\s\-\(\)]/g, ''))) {
          throw new Error('Please enter a valid mobile number');
        }
        response = await api.findStudentByPhone(parentPhone.trim());
      } else {
        // Search by registration ID
        if (registrationId.trim().length < 3) {
          throw new Error('Registration ID must be at least 3 characters long');
        }
        response = await api.findStudentByRegistrationId(registrationId.trim());
      }

      setStudent(response.student);
      setCurrentStep('scanFace');
      
      Alert.alert(
        'Student Found!',
        `Found student: ${response.student.name} (${response.student.studentId})\n\nPlease proceed with face verification.`,
        [{ text: 'Continue', style: 'default' }]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to find student';
      Alert.alert('Student Not Found', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptureAndProcess = async () => {
    if (!camera.current || !student) {
      console.log('Camera or student not available');
      return;
    }

    if (!embeddingService.isReady()) {
      Alert.alert(
        'Service Not Ready',
        'Face recognition service is still initializing. Please wait a moment and try again.'
      );
      return;
    }

    setIsCapturing(true);
    try {
      console.log('Taking photo for face verification...');
      
      // Take photo
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'quality',
        flash: 'off',
        enableShutterSound: false,
      });
      
      console.log('Photo taken, path:', photo.path);
      
      // Create proper URI for Android compatibility
      const imagePath = Platform.OS === 'android' 
        ? `file://${photo.path}` 
        : photo.path;
      
      console.log('Image path for embedding generation:', imagePath);

      // Generate embedding and verify with backend
      const result = await api.verifyFaceWithEmbedding(imagePath, student.studentId);

      if (result.success) {
        console.log('Face verification successful!');
        
        // Success - navigate to transaction confirmation
        navigation.replace('TransactionConfirmation', {
          transactionId: result.transactionId || `TXN_${Date.now()}`,
          student,
          cartItems: cartData,
          totalAmount,
        });
      } else {
        console.log('Face verification failed:', result.message);
        Alert.alert(
          'Verification Failed', 
          result.message || 'Face verification failed. Please try again.'
        );
      }

    } catch (error) {
      console.error('Error during face capture and verification:', error);
      const errorMessage = error instanceof Error ? error.message : 'Face verification failed';
      Alert.alert('Error', `Face verification failed: ${errorMessage}`);
    } finally {
      setIsCapturing(false);
    }
  };

  // Remove handleFaceRegistration and handleFaceVerification methods - no longer needed

  const handleCancel = () => {
    Alert.alert(
      'Cancel Verification',
      'Are you sure you want to cancel the face verification process?',
      [
        {
          text: 'Continue Verification',
          style: 'cancel'
        },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const handleBackToPhone = () => {
    setCurrentStep('enterPhone');
    setStudent(null);
    setParentPhone('');
    setRegistrationId('');
  };

  const renderPhoneInputStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Verify with Face Scan</Text>
        <Text style={styles.subtitle}>
          Enter the parent's mobile number or student's registration ID to find the student
        </Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Parent's Mobile Number</Text>
          <TextInput
            style={styles.phoneInput}
            value={parentPhone}
            onChangeText={setParentPhone}
            placeholder="Enter mobile number"
            placeholderTextColor="#8E8E93"
            keyboardType="phone-pad"
            autoFocus={true}
            maxLength={15}
          />
        </View>

        {/* OR Separator */}
        <View style={styles.orSeparator}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Student's Registration ID</Text>
          <TextInput
            style={styles.registrationInput}
            value={registrationId}
            onChangeText={setRegistrationId}
            placeholder="Enter registration ID (e.g., STU001)"
            placeholderTextColor="#8E8E93"
            autoCapitalize="characters"
            maxLength={10}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.findButton, 
            isLoading && styles.findButtonDisabled,
            (!parentPhone.trim() && !registrationId.trim()) && styles.findButtonDisabled
          ]}
          onPress={handleFindStudent}
          disabled={isLoading || (!parentPhone.trim() && !registrationId.trim())}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.findButtonText}>Find Student</Text>
          )}
        </TouchableOpacity>

        <View style={styles.demoInfo}>
          <Text style={styles.demoInfoTitle}>Demo Credentials:</Text>
          <Text style={styles.demoInfoText}>• Phone: 555-0123 (John Smith)</Text>
          <Text style={styles.demoInfoText}>• Phone: 555-0125 (Sarah Johnson)</Text>
          <Text style={styles.demoInfoText}>• ID: STU001 (John Smith)</Text>
          <Text style={styles.demoInfoText}>• ID: STU002 (Sarah Johnson)</Text>
        </View>
      </View>
    </View>
  );

  const renderFaceScanStep = () => {
    if (!device || !hasPermission) {
      return (
        <View style={styles.stepContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Camera Permission Required</Text>
            <Text style={styles.subtitle}>
              Please grant camera permission to proceed with face verification
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.permissionButtonText}>Grant Camera Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (isModelLoading) {
      return (
        <View style={styles.stepContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Initializing Face Recognition</Text>
            <Text style={styles.subtitle}>
              Please wait while we load the AI model...
            </Text>
          </View>
          
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading MobileNet model...</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.stepContainer}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Face Verification</Text>
          {student && (
            <Text style={styles.studentInfo}>
              Student: {student.name} ({student.studentId})
            </Text>
          )}
          <Text style={styles.instruction}>
            Position the student's face inside the oval to verify
          </Text>
          
          {/* Remove Mode Toggle - no longer needed */}
        </View>

        {/* Camera Container */}
        <View style={styles.cameraContainer}>
          <Camera
            ref={camera}
            style={styles.camera}
            device={device}
            isActive={true}
            photo={true}
          />
          
          {/* Flip Camera Button */}
          <View style={styles.flipContainer}>
            <TouchableOpacity style={styles.flipButton} onPress={onFlipCamera} activeOpacity={0.8}>
              <Text style={styles.flipButtonText}>🔄</Text>
            </TouchableOpacity>
          </View>
          
          {/* Face Overlay */}
          <View style={styles.faceOverlay}>
            <View style={styles.faceOval} />
          </View>
        </View>

        {/* Main Action Button - Large Circular Capture Button */}
        <View style={styles.captureButtonContainer}>
          <TouchableOpacity
            style={[
              styles.captureButton, 
              isCapturing && styles.captureButtonDisabled
            ]}
            onPress={handleCaptureAndProcess}
            disabled={isCapturing}
            activeOpacity={0.8}
          >
            {isCapturing ? (
              <ActivityIndicator color="#FFFFFF" size="large" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </TouchableOpacity>
        </View>

        {/* Back to Phone Button */}
        <TouchableOpacity
          style={styles.backToPhoneButton}
          onPress={handleBackToPhone}
          activeOpacity={0.8}
        >
          <Text style={styles.backToPhoneText}>Back to Phone</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Cancel Button - Top Right */}
      <View style={styles.cancelContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>✕ Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Step Content */}
      {currentStep === 'enterPhone' ? renderPhoneInputStep() : renderFaceScanStep()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Dark theme background
  },
  cancelContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 1000,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
    color: '#8E8E93',
  },
  studentInfo: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    color: '#007AFF',
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    color: '#8E8E93',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  orSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  orText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  phoneInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  registrationInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  findButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  findButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  findButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  demoInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  demoInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    color: '#007AFF',
  },
  demoInfoText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
    color: '#8E8E93',
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  permissionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  flipContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1000,
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  flipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  faceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceOval: {
    width: screenWidth * 0.6,
    height: screenWidth * 0.8,
    borderRadius: screenWidth * 0.4,
    borderWidth: 3,
    borderColor: '#007AFF',
    backgroundColor: 'transparent',
  },
  captureButtonContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  captureButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
  },
  backToPhoneButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
  },
  backToPhoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default FaceVerificationScreen;
