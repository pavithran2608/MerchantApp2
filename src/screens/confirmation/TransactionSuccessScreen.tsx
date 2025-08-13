import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, BackHandler, Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

import { Transaction, Student, CartItem } from '../../services/api';
import { formatCurrency } from '../../utils/dateUtils';

// Navigation types
type RootStackParamList = {
  TransactionSuccess: { 
    transaction?: Transaction;
    student?: Student;
    cartItems?: CartItem[];
    totalAmount: number; 
    newBalance: number;
  };
  MainTabs: undefined;
};

type TransactionSuccessNavigationProp = StackNavigationProp<RootStackParamList, 'TransactionSuccess'>;
type TransactionSuccessRouteProp = RouteProp<RootStackParamList, 'TransactionSuccess'>;

const TransactionSuccessScreen: React.FC = () => {
  const navigation = useNavigation<TransactionSuccessNavigationProp>();
  const route = useRoute<TransactionSuccessRouteProp>();
  const { transaction, student, cartItems, totalAmount, newBalance } = route.params;
  const { colors } = useTheme();

  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Screen loaded successfully
  }, []);

  const navigateToPOS = () => {
    // Navigate back to MainTabs and then to POS tab
    navigation.navigate('MainTabs');
  };

  useEffect(() => {
    // Disable back button on Android
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return true; // Prevent back navigation
    });

    // Animate checkmark entrance
    const entranceAnimation = Animated.sequence([
      Animated.parallel([
        Animated.timing(containerOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(checkmarkOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(checkmarkScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]);

    entranceAnimation.start();

    // Auto-dismiss after 6 seconds
    const autoDismissTimer = setTimeout(() => {
      navigateToPOS();
    }, 6000);

    return () => {
      backHandler.remove();
      clearTimeout(autoDismissTimer);
    };
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity, backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      {/* Animated Checkmark */}
      <Animated.View
        style={[
          styles.checkmarkContainer,
          {
            opacity: checkmarkOpacity,
            transform: [{ scale: checkmarkScale }],
          },
        ]}
      >
        <View style={[styles.checkmark, { 
          backgroundColor: colors.success,
          shadowColor: colors.success,
        }]}>
          <Text style={[styles.checkmarkText, { color: '#ffffff' }]}>✓</Text>
        </View>
      </Animated.View>

      {/* Success Title */}
      <Text style={[styles.title, { color: colors.text }]}>Payment Successful</Text>

      {/* Transaction ID */}
      {transaction && (
        <View style={styles.transactionIdContainer}>
          <Text style={[styles.transactionIdLabel, { color: colors.textSecondary }]}>Transaction ID</Text>
          <Text style={[styles.transactionId, { color: colors.text }]}>{transaction.id}</Text>
        </View>
      )}

      {/* Transaction Details */}
      <View style={[styles.detailsContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Summary</Text>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Amount Paid:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{formatCurrency(transaction?.amount || totalAmount)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Student's New Balance:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{formatCurrency(transaction?.newBalance || newBalance)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date & Time:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {transaction ? new Date(transaction.timestamp).toLocaleString() : new Date().toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Student Information */}
      {(student || transaction?.studentName) && (
        <View style={[styles.detailsContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Student Information</Text>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Name:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{student?.name || transaction?.studentName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Student ID:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{student?.studentId || transaction?.studentId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Department:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{student?.department || 'N/A'}</Text>
          </View>
        </View>
      )}

      {/* Cart Items */}
      {(cartItems && cartItems.length > 0) || (transaction && transaction.cartItems && transaction.cartItems.length > 0) && (
        <View style={[styles.detailsContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Items Purchased</Text>
          {(transaction?.cartItems || cartItems || []).map((item, index) => (
            <View key={index} style={styles.cartItemRow}>
              <View style={styles.cartItemInfo}>
                <Text style={[styles.cartItemName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.cartItemQuantity, { color: colors.textSecondary }]}>
                  Qty: {item.quantity}
                </Text>
              </View>
              <Text style={[styles.cartItemPrice, { color: colors.text }]}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* New Sale Button */}
      <TouchableOpacity style={[styles.newSaleButton, { backgroundColor: colors.primary }]} onPress={navigateToPOS}>
        <Text style={styles.newSaleButtonText}>Start New Sale</Text>
      </TouchableOpacity>

      {/* Auto-dismiss hint */}
      <Text style={[styles.autoDismissHint, { color: colors.textSecondary }]}>
        Returning to POS in a few seconds...
      </Text>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  checkmarkContainer: {
    marginBottom: 32,
  },
  checkmark: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  checkmarkText: {
    fontSize: 60,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 40,
    textAlign: 'center',
  },
  transactionIdContainer: {
    marginBottom: 20,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  transactionIdLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  transactionId: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 20, // Reduced margin
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  newSaleButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 16,
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  newSaleButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  autoDismissHint: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  cartItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  cartItemInfo: {
    flex: 1,
    marginRight: 10,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  cartItemQuantity: {
    fontSize: 14,
    marginTop: 4,
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default TransactionSuccessScreen;
