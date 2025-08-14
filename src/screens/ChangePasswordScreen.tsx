import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';

type RootStackParamList = {
  ChangePassword: undefined;
  Settings: undefined;
};

type Nav = StackNavigationProp<RootStackParamList, 'ChangePassword'>;

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { colors, isDark } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Weak Password', 'New password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('@merchant_app_token');
      if (!token) {
        throw new Error('You are not authenticated. Please log in again.');
      }

      // Mock API call: add real implementation in api.changePassword
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const response = await apiChangePassword({ token, currentPassword, newPassword });

      Alert.alert('Success', 'Your password has been updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update password. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={[styles.form, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
        <View style={styles.field}> 
          <Text style={[styles.label, { color: colors.text }]}>Current Password</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
            placeholder="Enter current password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.field}> 
          <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
            placeholder="Enter new password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.field}> 
          <Text style={[styles.label, { color: colors.text }]}>Confirm New Password</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }]}
            placeholder="Confirm new password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }, (!currentPassword || !newPassword || !confirmPassword || isLoading) && { backgroundColor: colors.border }]}
          disabled={!currentPassword || !newPassword || !confirmPassword || isLoading}
          onPress={handleUpdatePassword}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Update Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// Temporary mock function that uses api until a real endpoint exists in ApiService
async function apiChangePassword({ token, currentPassword, newPassword }: { token: string; currentPassword: string; newPassword: string }) {
  // Replace with api.changePassword once implemented in ApiService
  await new Promise(resolve => setTimeout(resolve, 1200));
  if (currentPassword !== 'password') {
    throw new Error('Incorrect current password.');
  }
  return { success: true } as const;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: {
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  field: { marginBottom: 16 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  submitButton: { marginTop: 8, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default ChangePasswordScreen;
