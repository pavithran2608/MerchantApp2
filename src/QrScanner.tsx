import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from 'react-native-vision-camera';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Student } from './types';
import { fetchStudentDetails } from './services/mockApi';
import { useTheme } from './contexts/ThemeContext';

type QrScannerNavigationProp = StackNavigationProp<RootStackParamList, 'QrScanner'>;

interface Props {
  navigation: QrScannerNavigationProp;
}

const QrScanner: React.FC<Props> = ({ navigation }) => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const { colors } = useTheme();
  const [isScannerActive, setIsScannerActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState('');
  const device = useCameraDevice('back');

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      if (isScannerActive && !isLoading && codes.length > 0 && codes[0].value) {
        const scannedValue = codes[0].value;
        if (scannedValue && scannedValue !== lastScannedCode) {
          console.log(`Scanned QR Code: ${scannedValue}`);
          setIsScannerActive(false); // Pause the scanner
          handleQRCodeScanned(scannedValue); // Process the code
        }
      }
    }
  });

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const parseQRData = (data: string): Student | null => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.studentId) {
        return {
          id: parsed.id || parsed.studentId, name: parsed.name || 'N/A',
          email: parsed.email || 'N/A', phone: parsed.phone || 'N/A',
          department: parsed.department || 'N/A', balance: parsed.balance || 0,
          studentId: parsed.studentId, semester: parsed.semester || 'N/A',
          year: parsed.year || 'N/A',
        };
      }
    } catch (e) {
      if (data.trim()) {
        return {
          id: data.trim(), name: 'Unknown', email: 'N/A', phone: 'N/A',
          department: 'N/A', balance: 0, studentId: data.trim(),
          semester: 'N/A', year: 'N/A',
        };
      }
    }
    return null;
  };

  const handleQRCodeScanned = async (data: string) => {
    if (!data || data.trim() === '') {
      Alert.alert('Invalid QR Code', 'The scanned QR code is empty.');
      handleScanAgain();
      return;
    }
    
    setIsLoading(true);
    setLastScannedCode(data);

    try {
      const studentData = parseQRData(data);
      if (!studentData) {
        Alert.alert('Invalid QR Code', 'The QR code format is incorrect.', [{ text: 'OK', onPress: handleScanAgain }]);
        return;
      }

      const fetchedStudent = await fetchStudentDetails(studentData.studentId);
      navigation.navigate('PaymentScreen', { student: fetchedStudent });

    } catch (error) {
      Alert.alert('Processing Error', 'Student with ID not found. Please try a different QR code.', [{ text: 'Scan Again', onPress: handleScanAgain }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanAgain = () => {
    setLastScannedCode('');
    setIsScannerActive(true); // Re-activate the scanner
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

  if (!device) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.permissionText, { color: colors.text }]}>No Camera Device Found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isScannerActive && !isLoading}
        codeScanner={codeScanner}
        photo={false}
      />

      {/* Semi-transparent overlay */}
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.cancelButton, { backgroundColor: colors.overlay }]}>
            <Text style={styles.cancelButtonText}>✕ Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.centerContent}>
          <Text style={[styles.overlayText, { backgroundColor: colors.overlay, color: colors.text }]}>Scan Student QR Code</Text>
          <Text style={[styles.subText, { backgroundColor: colors.overlay, color: colors.textSecondary }]}>Point camera at the QR code</Text>
          
          {/* Corner guides frame */}
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.topRight, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.bottomLeft, { borderColor: colors.primary }]} />
            <View style={[styles.corner, styles.bottomRight, { borderColor: colors.primary }]} />
          </View>
        </View>

        <View style={styles.bottomContent}>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.text }]}>Processing...</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  overlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0 
  },
  content: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    justifyContent: 'space-between',
    zIndex: 10,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'flex-start', 
    paddingTop: 50, 
    paddingHorizontal: 20 
  },
  cancelButton: { 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 20 
  },
  cancelButtonText: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
  centerContent: { 
    alignItems: 'center', 
    flex: 1, 
    justifyContent: 'center' 
  },
  overlayText: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 10, 
    marginBottom: 10 
  },
  subText: { 
    fontSize: 16, 
    textAlign: 'center', 
    paddingHorizontal: 15, 
    paddingVertical: 5, 
    borderRadius: 8, 
    marginBottom: 30 
  },
  scanFrame: { 
    width: 250, 
    height: 250, 
    position: 'relative' 
  },
  corner: { 
    position: 'absolute', 
    width: 30, 
    height: 30, 
    borderWidth: 3 
  },
  topLeft: { 
    top: -3, 
    left: -3, 
    borderRightWidth: 0, 
    borderBottomWidth: 0 
  },
  topRight: { 
    top: -3, 
    right: -3, 
    borderLeftWidth: 0, 
    borderBottomWidth: 0 
  },
  bottomLeft: { 
    bottom: -3, 
    left: -3, 
    borderRightWidth: 0, 
    borderTopWidth: 0 
  },
  bottomRight: { 
    bottom: -3, 
    right: -3, 
    borderLeftWidth: 0, 
    borderTopWidth: 0 
  },
  bottomContent: { 
    height: 100, 
    alignItems: 'center', 
    padding: 20 
  },
  loadingContainer: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    fontSize: 18, 
    marginTop: 10, 
    textAlign: 'center' 
  },
  permissionContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  permissionText: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 20 
  },
  permissionButton: { 
    paddingHorizontal: 30, 
    paddingVertical: 15, 
    borderRadius: 25 
  },
  permissionButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});

export default QrScanner;
