import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Student, CartItem } from '../services/api';
import { formatCurrency } from '../utils/dateUtils';
import { useTheme } from '../contexts/ThemeContext';

import { useEffect } from 'react';

type RootStackParamList = {
  TransactionConfirmation: {
    transactionId: string;
    student: Student;
    cartItems: CartItem[];
    totalAmount: number;
  };
  MainTabs: undefined;
};

type TransactionConfirmationRouteProp = RouteProp<RootStackParamList, 'TransactionConfirmation'>;
type TransactionConfirmationNavigationProp = StackNavigationProp<RootStackParamList, 'TransactionConfirmation'>;

const TransactionConfirmation: React.FC = () => {
  const navigation = useNavigation<TransactionConfirmationNavigationProp>();
  const route = useRoute<TransactionConfirmationRouteProp>();
  const { transactionId, student, cartItems, totalAmount } = route.params;
  const { colors } = useTheme();

  useEffect(() => {
    // Screen loaded successfully
  }, []);

  const handleDone = () => {
    // Navigate back to main tabs (POS screen)
    navigation.navigate('MainTabs');
  };

  const handleNewTransaction = () => {
    // Navigate back to main tabs (POS screen)
    navigation.navigate('MainTabs');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      
      <ScrollView contentContainerStyle={[styles.scrollContainer, { backgroundColor: colors.background }]}>
        {/* Success Header */}
        <View style={[styles.successHeader, { backgroundColor: colors.surface }]}>
          <View style={[styles.successIcon, { backgroundColor: colors.success, shadowColor: colors.success }]}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Transaction Successful!</Text>
          <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
            Face verification completed and payment processed
          </Text>
        </View>

        {/* Transaction Details */}
        <View style={[styles.detailsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.detailsTitle, { color: colors.text }]}>Transaction Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Transaction ID:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{transactionId}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date & Time:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {new Date().toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Total Amount:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
        </View>

        {/* Student Information */}
        <View style={[styles.detailsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.detailsTitle, { color: colors.text }]}>Student Information</Text>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Name:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{student.name}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Student ID:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{student.studentId}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Department:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{student.department}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Semester:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{student.semester}</Text>
          </View>
        </View>

        {/* Cart Items */}
        <View style={[styles.detailsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.detailsTitle, { color: colors.text }]}>Items Purchased</Text>
          
          {cartItems.map((item, index) => (
            <View key={index} style={styles.cartItem}>
              <View style={styles.cartItemHeader}>
                <Text style={[styles.cartItemName, { color: colors.text }]}>{item.product.name}</Text>
                <Text style={[styles.cartItemQuantity, { color: colors.textSecondary }]}>x{item.quantity}</Text>
              </View>
              <Text style={[styles.cartItemPrice, { color: colors.text }]}>
                {formatCurrency(item.product.price * item.quantity)}
              </Text>
            </View>
          ))}
          
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total:</Text>
            <Text style={[styles.totalAmount, { color: colors.text }]}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: colors.primary }]}
            onPress={handleDone}
            activeOpacity={0.8}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.newTransactionButton, { backgroundColor: colors.secondary }]}
            onPress={handleNewTransaction}
            activeOpacity={0.8}
          >
            <Text style={[styles.newTransactionButtonText, { color: colors.text }]}>New Transaction</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkmark: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  cartItemHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  cartItemQuantity: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionButtons: {
    gap: 16,
    marginTop: 20,
  },
  doneButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  newTransactionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  newTransactionButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default TransactionConfirmation;
