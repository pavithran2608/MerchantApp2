import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CartItem } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

// Navigation types
type RootStackParamList = {
  CheckoutModal: { cartItems: CartItem[]; totalAmount: number };
  NfcVerification: { cartData: CartItem[]; totalAmount: number };
  FaceVerification: { cartData: CartItem[]; totalAmount: number };
  QrVerification: { cartData: CartItem[]; totalAmount: number };
};

type CheckoutModalNavigationProp = StackNavigationProp<RootStackParamList, 'CheckoutModal'>;
type CheckoutModalRouteProp = RouteProp<RootStackParamList, 'CheckoutModal'>;

const CheckoutModal: React.FC = () => {
  const navigation = useNavigation<CheckoutModalNavigationProp>();
  const route = useRoute<CheckoutModalRouteProp>();
  const { cartItems, totalAmount } = route.params;
  const { colors } = useTheme();

  const handleNfcScan = () => {
    navigation.navigate('NfcVerification', {
      cartData: cartItems,
      totalAmount,
    });
  };

  const handleFaceScan = () => {
    navigation.navigate('FaceVerification', {
      cartData: cartItems,
      totalAmount,
    });
  };

  const handleQrScan = () => {
    navigation.navigate('QrVerification', {
      cartData: cartItems,
      totalAmount,
    });
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Close Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={[styles.closeButton, { backgroundColor: colors.border }]}>
          <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>Proceed to Payment</Text>
        
        {/* Transaction Summary */}
        <View style={[styles.summaryContainer, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Transaction Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Items:</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{cartItems.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Amount:</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>

        {/* All Verification Options */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.verificationButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handleFaceScan}>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>👤</Text>
              <Text style={[styles.buttonText, { color: '#ffffff' }]}>Verify with Face Scan</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.verificationButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handleQrScan}>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>📱</Text>
              <Text style={[styles.buttonText, { color: '#ffffff' }]}>Scan Student QR Code</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.verificationButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handleNfcScan}>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>💳</Text>
              <Text style={[styles.buttonText, { color: '#ffffff' }]}>Scan Student NFC Card</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Cancel Button */}
        <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.secondary, shadowColor: colors.secondary }]} onPress={handleClose}>
          <Text style={[styles.cancelButtonText, { color: '#ffffff' }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 32,
  },
  summaryContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    borderBottomWidth: 1,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 32,
  },
  verificationButton: {
    padding: 20,
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  buttonSubtext: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 40,
  },
  cancelButton: {
    paddingVertical: 16,
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CheckoutModal;
