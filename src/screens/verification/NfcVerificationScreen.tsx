import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { CartItem } from '../../services/api';
import api from '../../services/api';

type NfcVerificationNavigationProp = StackNavigationProp<RootStackParamList, 'NfcVerification'>;
type NfcVerificationRouteProp = RouteProp<RootStackParamList, 'NfcVerification'>;

interface Props {
  navigation: NfcVerificationNavigationProp;
  route: NfcVerificationRouteProp;
}

const NfcVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { cartItems, totalAmount } = route.params;
  const { colors } = useTheme();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'waiting' | 'scanning' | 'processing'>('waiting');

  useEffect(() => {
    // Start NFC verification process after a short delay
    const timer = setTimeout(() => {
      startNfcVerification();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const startNfcVerification = async () => {
    setIsVerifying(true);
    setVerificationStep('scanning');

    try {
      // Simulate NFC scanning delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      setVerificationStep('processing');

      // Call NFC verification API
      const result = await api.verifyNfc({ cartItems, totalAmount });

      if (result.success && result.transaction) {
        // Pass detailed transaction data to TransactionSuccess screen
        navigation.replace('TransactionSuccess', {
          transaction: result.transaction,
          student: result.student,
          cartItems,
          totalAmount,
          newBalance: result.transaction.newBalance,
        });
      } else {
        throw new Error('NFC verification failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'NFC verification failed. Please try again.';
      
      // Navigate to TransactionFailure screen
      navigation.replace('TransactionFailure', {
        errorMessage: message,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const getStepText = () => {
    switch (verificationStep) {
      case 'waiting':
        return 'Preparing NFC scanner...';
      case 'scanning':
        return 'Please tap the student\'s NFC card';
      case 'processing':
        return 'Processing payment...';
      default:
        return 'Verifying...';
    }
  };

  const getStepIcon = () => {
    switch (verificationStep) {
      case 'waiting':
        return '⏳';
      case 'scanning':
        return '📱';
      case 'processing':
        return '⚡';
      default:
        return '📱';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={[styles.headerButton, { backgroundColor: colors.overlay }]}>
          <Text style={[styles.headerButtonText, { color: colors.text }]}>✕ Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* NFC Icon */}
        <View style={[styles.nfcIconContainer, { backgroundColor: colors.surface }]}>
          <Text style={styles.nfcIcon}>💳</Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>NFC Payment</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Tap the student's NFC card to complete payment
        </Text>

        {/* Verification Status */}
        <View style={[styles.statusContainer, { backgroundColor: colors.surface }]}>
          <Text style={styles.stepIcon}>{getStepIcon()}</Text>
          <Text style={[styles.stepText, { color: colors.text }]}>{getStepText()}</Text>
          
          {isVerifying && (
            <ActivityIndicator 
              size="small" 
              color={colors.primary} 
              style={styles.spinner}
            />
          )}
        </View>

        {/* Payment Summary */}
        <View style={[styles.summaryContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Amount:</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              ${totalAmount.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Items:</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  headerButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  nfcIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  nfcIcon: {
    fontSize: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 32,
    minWidth: 280,
  },
  stepIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  stepText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  spinner: {
    marginLeft: 8,
  },
  summaryContainer: {
    padding: 20,
    borderRadius: 12,
    width: '100%',
    maxWidth: 320,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default NfcVerificationScreen;
