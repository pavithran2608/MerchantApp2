import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from 'react-native-vision-camera';
import { CartItem } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

// Navigation types
 type RootStackParamList = {
  QrVerification: { cartData: CartItem[]; totalAmount: number };
  Passcode: { qrToken: string; cartData: CartItem[]; totalAmount: number };
};

 type QrVerificationNavigationProp = StackNavigationProp<RootStackParamList, 'QrVerification'>;
 type QrVerificationRouteProp = RouteProp<RootStackParamList, 'QrVerification'>;

const QrVerificationScreen: React.FC = () => {
  const navigation = useNavigation<QrVerificationNavigationProp>();
  const route = useRoute<QrVerificationRouteProp>();
  const { cartData, totalAmount } = route.params;
  const { colors } = useTheme();

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);
  const [isScanning, setIsScanning] = useState(true);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (!isScanning || codes.length === 0) return;
      const value = codes[0]?.value;
      if (!value) return;

      // Pause scanner to prevent multiple triggers
      setIsScanning(false);
      const qrToken = String(value);

      // Navigate to Passcode screen with required params
      navigation.replace('Passcode', {
        qrToken,
        cartData,
        totalAmount,
      });
    },
  });

  if (!hasPermission) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.permissionTitle, { color: colors.text }]}>Camera Permission Required</Text>
        <TouchableOpacity style={[styles.permissionButton, { backgroundColor: colors.primary }]} onPress={requestPermission}>
          <Text style={[styles.permissionButtonText, { color: '#ffffff' }]}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.permissionTitle, { color: colors.text }]}>Rear Camera Not Available</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
      />

      {/* Header with Cancel */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.headerButton, { 
          backgroundColor: colors.overlay,
          borderColor: colors.border 
        }]}>
          <Text style={[styles.headerButtonText, { color: colors.text }]}>✕ Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={[styles.scanFrame, { borderColor: colors.border }]}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        <Text style={[styles.scanText, { 
          color: colors.text,
          backgroundColor: colors.overlay 
        }]}>Align QR code within the frame</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  permissionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  permissionButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  permissionButtonText: { fontSize: 16, fontWeight: '600' },

  header: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 20, left: 20, right: 20, zIndex: 10, flexDirection: 'row', justifyContent: 'flex-end' },
  headerButton: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  headerButtonText: { fontSize: 14, fontWeight: 'bold' },

  overlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' },
  scanFrame: { width: 260, height: 260, borderWidth: 2, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: '#00E0FF' },
  topLeft: { left: -2, top: -2, borderLeftWidth: 4, borderTopWidth: 4, borderRadius: 10 },
  topRight: { right: -2, top: -2, borderRightWidth: 4, borderTopWidth: 4, borderRadius: 10 },
  bottomLeft: { left: -2, bottom: -2, borderLeftWidth: 4, borderBottomWidth: 4, borderRadius: 10 },
  bottomRight: { right: -2, bottom: -2, borderRightWidth: 4, borderBottomWidth: 4, borderRadius: 10 },
  scanText: { marginTop: 20, fontSize: 16, fontWeight: '600', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
});

export default QrVerificationScreen;
