import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { api, CartItem } from '../../services/api';

type RouteParams = {
  cartData?: CartItem[];
  totalAmount?: number;
};

type ScanStatus = 'waiting' | 'scanning' | 'processing' | 'success' | 'error' | 'unsupported';

const NfcVerificationScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { cartData = [], totalAmount = 0 } = (route.params || {}) as RouteParams;

  const [status, setStatus] = useState<ScanStatus>('waiting');
  const [message, setMessage] = useState<string>('Preparing NFC scanner...');
  const startedRef = useRef(false);

  useEffect(() => {
    let canceled = false;
    const init = async () => {
      try {
        const isSupported = await NfcManager.isSupported();
        if (!isSupported) {
          setStatus('unsupported');
          setMessage('This device does not have an NFC reader. Please use a different verification method.');
          return;
        }

        await NfcManager.start();
        if (!canceled) startNfcScan();
      } catch (e) {
        setStatus('error');
        setMessage('Failed to initialize NFC');
      }
    };
    init();
    return () => {
      canceled = true;
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  const parseStudentIdFromTag = (tag: any): string | null => {
    try {
      if (tag?.ndefMessage?.length) {
        for (const record of tag.ndefMessage) {
          // Text record
          if (record.tnf === Ndef.TNF_WELL_KNOWN && Ndef.util.bytesToString(record.type) === 'T') {
            const text = Ndef.text.decodePayload(record.payload);
            return text?.trim() || null;
          }
          // MIME payload fallback
          if (record.tnf === Ndef.TNF_MIME_MEDIA) {
            const payload = record.payload ? Ndef.util.bytesToString(record.payload) : '';
            if (payload) return payload.trim();
          }
        }
      }
      if (tag?.id) return tag.id;
    } catch {}
    return null;
  };

  const startNfcScan = async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setStatus('scanning');
    setMessage("Please tap the student's NFC card against the back of the phone.");

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef, { alertMessage: 'Hold near the card...' });
      const tag = await NfcManager.getTag();
      await NfcManager.cancelTechnologyRequest().catch(() => {});

      const studentId = parseStudentIdFromTag(tag);
      if (!studentId) {
        setStatus('error');
        setMessage('Could not read student ID from card');
        return;
      }

      setStatus('processing');
      setMessage('Verifying card and processing payment...');

      // Adjusted to match ApiService signature
      const response = await api.verifyNfc({ cartItems: cartData, totalAmount });
      if (response?.success && response?.transaction) {
        setStatus('success');
        setMessage('Payment approved');
        // @ts-expect-error: navigation param typing handled in root navigator
        navigation.navigate('TransactionSuccess', { transaction: response.transaction });
      } else {
        const errMsg = response?.message || 'Verification failed';
        setStatus('error');
        setMessage(errMsg);
        // @ts-expect-error: navigation param typing handled in root navigator
        navigation.navigate('TransactionFailure', { errorMessage: errMsg });
      }
    } catch (err: any) {
      const canceled = typeof err?.toString === 'function' && `${err}`.toLowerCase().includes('cancel');
      if (!canceled) {
        setStatus('error');
        setMessage('NFC scan failed');
        Alert.alert('NFC Error', 'Failed to read NFC card. Please try again.');
      }
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'unsupported':
        return (
          <View style={styles.center}>
            <Text style={[styles.emoji, { color: colors.error || '#ef4444' }]}>🚫</Text>
            <Text style={[styles.title, { color: colors.text }]}>NFC Not Supported</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {message}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.button, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        );
      case 'waiting':
      case 'scanning':
        return (
          <View style={styles.center}>
            <Text style={[styles.emoji, { color: colors.primary }]}>📶</Text>
            <Text style={[styles.title, { color: colors.text }]}>Tap Card to Scan</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{message}</Text>
            <ActivityIndicator style={{ marginTop: 16 }} color={colors.primary} />
          </View>
        );
      case 'processing':
        return (
          <View style={styles.center}>
            <Text style={[styles.emoji, { color: colors.primary }]}>🔄</Text>
            <Text style={[styles.title, { color: colors.text }]}>Processing</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{message}</Text>
            <ActivityIndicator style={{ marginTop: 16 }} color={colors.primary} />
          </View>
        );
      case 'success':
        return (
          <View style={styles.center}>
            <Text style={[styles.emoji, { color: colors.success }]}>✅</Text>
            <Text style={[styles.title, { color: colors.text }]}>Payment Approved</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Redirecting...</Text>
          </View>
        );
      case 'error':
      default:
        return (
          <View style={styles.center}>
            <Text style={[styles.emoji, { color: colors.error || '#ef4444' }]}>⚠️</Text>
            <Text style={[styles.title, { color: colors.text }]}>Scan Failed</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{message}</Text>
            <TouchableOpacity
              onPress={() => {
                startedRef.current = false;
                startNfcScan();
              }}
              style={[styles.button, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return <View style={[styles.container, { backgroundColor: colors.background }]}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  center: { alignItems: 'center' },
  emoji: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 14, textAlign: 'center' },
  button: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: '700' },
});

export default NfcVerificationScreen;

