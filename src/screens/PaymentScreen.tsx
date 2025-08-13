import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Student } from '../types';
import { processPayment } from '../services/mockApi';

type PaymentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PaymentScreen'>;
type PaymentScreenRouteProp = RouteProp<RootStackParamList, 'PaymentScreen'>;

interface Props {
  navigation: PaymentScreenNavigationProp;
  route: PaymentScreenRouteProp;
}

const PaymentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { student } = route.params;
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(student.balance.toString());

  const handleProcessPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await processPayment(
        student.id,
        parseFloat(paymentAmount),
        'Credit Card'
      );

      if (result.success) {
        Alert.alert(
          'Payment Successful!',
          `Payment processed successfully.\nReference: ${result.reference}`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Dashboard'),
            },
          ]
        );
      } else {
        Alert.alert('Payment Failed', 'Payment processing failed. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while processing payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure you want to cancel this payment?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => navigation.navigate('Dashboard'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>✕ Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.studentCard}>
          <Text style={styles.cardTitle}>Student Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{student.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Student ID:</Text>
            <Text style={styles.value}>{student.studentId}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Department:</Text>
            <Text style={styles.value}>{student.department}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{student.email}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{student.phone}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Semester:</Text>
            <Text style={styles.value}>{student.semester}</Text>
          </View>
        </View>

        <View style={styles.paymentCard}>
          <Text style={styles.cardTitle}>Payment Information</Text>
          
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Current Balance:</Text>
            <Text style={styles.balanceAmount}>${student.balance.toFixed(2)}</Text>
          </View>
          
          <View style={styles.paymentMethodRow}>
            <Text style={styles.label}>Payment Method:</Text>
            <Text style={styles.value}>Credit Card</Text>
          </View>
          
          <View style={styles.paymentMethodRow}>
            <Text style={styles.label}>Payment Amount:</Text>
            <Text style={styles.value}>${paymentAmount}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.processButton, isProcessing && styles.processButtonDisabled]}
          onPress={handleProcessPayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.processButtonText}>Process Payment</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  label: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 18,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  processButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  processButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  processButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PaymentScreen;
