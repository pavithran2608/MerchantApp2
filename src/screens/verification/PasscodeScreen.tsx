import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { api, CartItem, VerifyPasscodeRequest } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

// Navigation types
type RootStackParamList = {
  Passcode: { qrToken: string; cartData: CartItem[]; totalAmount: number };
  TransactionSuccess: { totalAmount: number; newBalance: number };
  TransactionFailure: { errorMessage: string };
};

type PasscodeNavigationProp = StackNavigationProp<RootStackParamList, 'Passcode'>;
type PasscodeRouteProp = RouteProp<RootStackParamList, 'Passcode'>;

const PasscodeScreen: React.FC = () => {
  const navigation = useNavigation<PasscodeNavigationProp>();
  const route = useRoute<PasscodeRouteProp>();
  const { qrToken, cartData, totalAmount } = route.params;
  const { colors } = useTheme();

  const [passcode, setPasscode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const digits = useMemo(() => ['1','2','3','4','5','6','7','8','9','0'], []);

  const handleDigitPress = useCallback((digit: string) => {
    if (isSubmitting) return;
    setPasscode(prev => {
      if (prev.length >= 4) return prev; // prevent extra input
      const next = prev + digit;
      if (next.length === 4) {
        submitPasscode(next);
      }
      return next;
    });
  }, [isSubmitting]);

  const handleBackspace = useCallback(() => {
    if (isSubmitting) return;
    setPasscode(prev => prev.slice(0, -1));
  }, [isSubmitting]);

  const submitPasscode = async (finalCode: string) => {
    try {
      setIsSubmitting(true);
      const payload: VerifyPasscodeRequest = {
        qrToken,
        passcode: finalCode,
        cartItems: cartData,
        totalAmount,
      };
      const result = await api.verifyPasscode(payload);
      
      if (result.success && result.transaction) {
        // Pass detailed transaction data to TransactionSuccess screen
        navigation.replace('TransactionSuccess', {
          transaction: result.transaction,
          student: result.student,
          cartItems: cartData,
          totalAmount,
          newBalance: result.transaction.newBalance,
        });
      } else {
        throw new Error('Verification failed. Please try again.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed. Please try again.';
      
      // Navigate to TransactionFailure screen instead of showing Alert
      navigation.replace('TransactionFailure', {
        errorMessage: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.headerButton, { 
          backgroundColor: colors.overlay,
          borderColor: colors.border 
        }]}>
          <Text style={[styles.headerButtonText, { color: colors.text }]}>✕ Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.text }]}>Enter Student's Passcode</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Confirm the purchase securely</Text>
      </View>

      {/* Passcode Dots */}
      <View style={styles.passcodeRow}>
        {[0,1,2,3].map(index => (
          <View key={index} style={[
            styles.dot, 
            { borderColor: colors.border },
            passcode.length > index && { backgroundColor: colors.primary }
          ]} />
        ))}
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        <View style={styles.keypadRow}>
          {['1','2','3'].map(d => (
            <TouchableOpacity key={d} style={[styles.key, { 
              backgroundColor: colors.surface,
              borderColor: colors.border 
            }]} onPress={() => handleDigitPress(d)} disabled={isSubmitting}>
              <Text style={[styles.keyText, { color: colors.text }]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keypadRow}>
          {['4','5','6'].map(d => (
            <TouchableOpacity key={d} style={[styles.key, { 
              backgroundColor: colors.surface,
              borderColor: colors.border 
            }]} onPress={() => handleDigitPress(d)} disabled={isSubmitting}>
              <Text style={[styles.keyText, { color: colors.text }]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keypadRow}>
          {['7','8','9'].map(d => (
            <TouchableOpacity key={d} style={[styles.key, { 
              backgroundColor: colors.surface,
              borderColor: colors.border 
            }]} onPress={() => handleDigitPress(d)} disabled={isSubmitting}>
              <Text style={[styles.keyText, { color: colors.text }]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keypadRow}>
          <View style={[styles.key, styles.keyDisabled]} />
          <TouchableOpacity style={[styles.key, { 
            backgroundColor: colors.surface,
            borderColor: colors.border 
          }]} onPress={() => handleDigitPress('0')} disabled={isSubmitting}>
            <Text style={[styles.keyText, { color: colors.text }]}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.key, { 
            backgroundColor: colors.surface,
            borderColor: colors.border 
          }]} onPress={handleBackspace} disabled={isSubmitting}>
            <Text style={[styles.keyText, { color: colors.text }]}>⌫</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Spinner overlay */}
      {isSubmitting && (
        <View style={[styles.loadingOverlay, { backgroundColor: colors.overlay }]}>
          <ActivityIndicator size="large" color={colors.text} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Verifying...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 20, left: 20, right: 20, zIndex: 10, flexDirection: 'row', justifyContent: 'flex-end' },
  headerButton: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  headerButtonText: { fontSize: 14, fontWeight: 'bold' },

  titleContainer: { marginTop: 120, alignItems: 'center', paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center' },

  passcodeRow: { marginTop: 30, flexDirection: 'row', justifyContent: 'center', gap: 16 },
  dot: { width: 18, height: 18, borderRadius: 9, backgroundColor: 'transparent' },

  keypad: { marginTop: 50, paddingHorizontal: 24 },
  keypadRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  key: { width: '30%', aspectRatio: 1, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  keyText: { fontSize: 28, fontWeight: '700' },
  keyDisabled: { backgroundColor: 'transparent', borderColor: 'transparent' },

  loadingOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontWeight: '600' },
});

export default PasscodeScreen;
