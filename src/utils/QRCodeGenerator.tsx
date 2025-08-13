import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const QRCodeGenerator: React.FC = () => {
  const studentIds = ['STU001', 'STU002', 'STU003', 'STU004', 'STU005'];

  const generateQRCode = (studentId: string) => {
    // In a real app, you would generate an actual QR code image
    // For now, we'll just show the student ID that should be in the QR code
    Alert.alert(
      'QR Code Content',
      `Student ID: ${studentId}\n\nThis is what should be encoded in the QR code. In a real implementation, this would be an actual QR code image that can be scanned.`,
      [
        { text: 'OK' },
        { 
          text: 'Copy ID', 
          onPress: () => {
            // In a real app, you would copy to clipboard
            Alert.alert('Copied', `Student ID ${studentId} copied to clipboard`);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test QR Codes</Text>
      <Text style={styles.subtitle}>
        These are the student IDs that should be encoded in QR codes for testing:
      </Text>
      
      {studentIds.map((studentId) => (
        <TouchableOpacity
          key={studentId}
          style={styles.qrButton}
          onPress={() => generateQRCode(studentId)}
        >
          <Text style={styles.qrButtonText}>📱 {studentId}</Text>
          <Text style={styles.qrButtonSubtext}>Tap to view QR content</Text>
        </TouchableOpacity>
      ))}
      
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Testing Instructions:</Text>
        <Text style={styles.infoText}>
          1. Use any QR code generator online{'\n'}
          2. Encode one of the student IDs above{'\n'}
          3. Scan the generated QR code with the app{'\n'}
          4. The app will fetch student details and show payment screen
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  qrButton: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  qrButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  qrButtonSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 5,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
});

export default QRCodeGenerator;
