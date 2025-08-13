import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import FaceDetection, { Face } from '@react-native-ml-kit/face-detection';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { useTheme } from './contexts/ThemeContext';

type FaceScannerNavigationProp = StackNavigationProp<RootStackParamList, 'FaceScanner'>;

interface Props {
  navigation: FaceScannerNavigationProp;
}

const FaceScanner: React.FC<Props> = ({ navigation }) => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const { colors } = useTheme();
  const camera = useRef<Camera>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Camera position state
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('front');
  const device = useCameraDevice(cameraPosition);

  const onFlipCameraPressed = useCallback(() => {
    setCameraPosition(p => (p === 'back' ? 'front' : 'back'));
  }, []);

  const handleCaptureAndProcess = async () => {
    if (!camera.current) {
      Alert.alert("Error", "Camera is not available.");
      return;
    }
    setIsLoading(true);
    try {
      const snapshot = await camera.current.takeSnapshot({ quality: 85 });
      const imagePath = `file://${snapshot.path}`;
      const faces: Face[] = await FaceDetection.detect(imagePath);

      if (faces.length === 0) {
        Alert.alert("No Face Detected", "Could not find a face in the picture. Please try again.");
        setIsLoading(false);
        return;
      }
      Alert.alert("Success!", "Face was detected. Ready for recognition.");
    } catch (error: any) {
      Alert.alert("Error", "Failed to detect face. " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasPermission) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.permissionText, { color: colors.text }]}>Camera Permission Required</Text>
        <TouchableOpacity style={[styles.permissionButton, { backgroundColor: colors.primary }]} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {device ? (
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
        />
      ) : (
        <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.permissionText, { color: colors.text }]}>No {cameraPosition} Camera Found</Text>
        </View>
      )}

      {/* Semi-transparent overlay */}
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]} />

      {/* Header with controls */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.headerButton, { backgroundColor: colors.overlay }]}>
          <Text style={styles.headerButtonText}>✕ Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onFlipCameraPressed} style={[styles.headerButton, { backgroundColor: colors.overlay }]}>
          <Text style={styles.headerButtonText}>🔄 Flip</Text>
        </TouchableOpacity>
      </View>

      {/* Center content with corner guides */}
      <View style={styles.centerContent}>
        <Text style={[styles.overlayText, { backgroundColor: colors.overlay, color: colors.text }]}>Face Recognition</Text>
        <Text style={[styles.subText, { backgroundColor: colors.overlay, color: colors.textSecondary }]}>
          Position face in the frame and capture
        </Text>
        
        {/* Corner guides frame */}
        <View style={styles.cornerFrame}>
          {/* Top-left corner */}
          <View style={[styles.corner, styles.topLeft, { borderColor: colors.primary }]} />
          {/* Top-right corner */}
          <View style={[styles.corner, styles.topRight, { borderColor: colors.primary }]} />
          {/* Bottom-left corner */}
          <View style={[styles.corner, styles.bottomLeft, { borderColor: colors.primary }]} />
          {/* Bottom-right corner */}
          <View style={[styles.corner, styles.bottomRight, { borderColor: colors.primary }]} />
        </View>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.captureButton,
            { backgroundColor: colors.primary },
            isLoading && { backgroundColor: colors.border }
          ]}
          onPress={handleCaptureAndProcess}
          disabled={isLoading || !device}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Capture & Recognize</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  centerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  overlayText: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 30,
  },
  cornerFrame: {
    width: 280,
    height: 350,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    zIndex: 10,
  },
  captureButton: {
    padding: 20,
    borderRadius: 50,
    minWidth: 150,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FaceScanner;
