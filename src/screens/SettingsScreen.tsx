import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';

type RootStackParamList = {
  Settings: undefined;
  Auth: undefined;
  ChangePassword: undefined;
};

type SettingsNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsNavigationProp>();
  const { theme, setTheme, colors, isDark, isBlack } = useTheme();
  
  const [defaultVerificationMethod, setDefaultVerificationMethod] = useState<'always-ask' | 'face-scan' | 'qr-scan'>('always-ask');
  const [merchantEmail, setMerchantEmail] = useState<string>('');
  const [previousTheme, setPreviousTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load default verification method
      const savedMethod = await AsyncStorage.getItem('@merchant_app_default_verification');
      if (savedMethod && ['always-ask', 'face-scan', 'qr-scan'].includes(savedMethod)) {
        setDefaultVerificationMethod(savedMethod as any);
      }

      // Load merchant email
      const savedEmail = await AsyncStorage.getItem('@merchant_app_user_email');
      if (savedEmail) {
        setMerchantEmail(savedEmail);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveDefaultVerificationMethod = async (method: 'always-ask' | 'face-scan' | 'qr-scan') => {
    try {
      setDefaultVerificationMethod(method);
      await AsyncStorage.setItem('@merchant_app_default_verification', method);
    } catch (error) {
      console.error('Failed to save verification method:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all user data and tokens
              await AsyncStorage.multiRemove([
                '@merchant_app_token',
                '@merchant_app_user_data',
                '@merchant_app_user_email',
                '@merchant_app_theme',
                '@merchant_app_default_verification',
              ]);
              
              // Navigate back to Auth screen and reset navigation stack
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              console.error('Failed to logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    Alert.alert('Coming Soon', 'Change Password feature will be implemented in the next update.');
  };

  // Removed Change Password functionality as per updated requirements.

  const renderSectionHeader = (title: string, colors: any) => (
    <View style={[styles.sectionHeader, { backgroundColor: colors.border }]}>
      <Text style={[styles.sectionHeaderText, { color: colors.text }]}>{title}</Text>
    </View>
  );

  const renderThemeSelector = (colors: any) => (
    <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.settingLabel, { color: colors.text }]}>Theme</Text>
      <View style={styles.selectorContainer}>
        {(['light', 'dark', 'black'] as const).map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.selectorOption,
              { backgroundColor: colors.border, borderColor: colors.border },
              theme === option && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => {
              if (option === 'black') {
                // Store the current theme as previous theme before switching to black
                if (theme !== 'black') {
                  setPreviousTheme(theme === 'light' ? 'light' : 'dark');
                }
                setTheme(option);
              } else {
                setTheme(option);
              }
            }}
          >
            <Text
              style={[
                styles.selectorOptionText,
                { color: colors.textSecondary },
                theme === option && { color: '#ffffff' },
              ]}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderBlackModeToggle = (colors: any) => (
    <View style={[styles.settingRow, { borderBottomColor: colors.border, borderBottomWidth: 0, paddingBottom: 12 }]}>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>Black Mode</Text>
        <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
          Pure black background for AMOLED displays
        </Text>
      </View>
      <Switch
        value={isBlack}
        onValueChange={(value) => {
          if (value) {
            // Store the current theme as previous theme before switching to black
            if (theme !== 'black') {
              setPreviousTheme(theme === 'light' ? 'light' : 'dark');
            }
            setTheme('black');
          } else {
            // Revert to the previous theme when turning off black mode
            setTheme(previousTheme);
          }
        }}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={isBlack ? '#ffffff' : colors.textSecondary}
        ios_backgroundColor={colors.border}
      />
    </View>
  );

  const renderVerificationMethodSelector = (colors: any) => (
    <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.settingLabel, { color: colors.text }]}>Default Verification Method</Text>
      <View style={styles.selectorContainer}>
        {([
          { key: 'always-ask', label: 'Always Ask' },
          { key: 'face-scan', label: 'Face Scan' },
          { key: 'qr-scan', label: 'QR Scan' },
        ] as const).map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.selectorOption,
              { backgroundColor: colors.border, borderColor: colors.border },
              defaultVerificationMethod === option.key && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => saveDefaultVerificationMethod(option.key)}
          >
            <Text
              style={[
                styles.selectorOptionText,
                { color: colors.textSecondary },
                defaultVerificationMethod === option.key && { color: '#ffffff' },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCompactVerificationMethodSelector = (colors: any) => (
    <View style={[styles.settingRow, { borderBottomColor: colors.border, borderBottomWidth: 0, paddingBottom: 12 }]}>
      <Text style={[styles.settingLabel, { color: colors.text }]}>Default Verification Method</Text>
      <View style={styles.selectorContainer}>
        {([
          { key: 'always-ask', label: 'Always Ask' },
          { key: 'face-scan', label: 'Face Scan' },
          { key: 'qr-scan', label: 'QR Scan' },
        ] as const).map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.selectorOption,
              { backgroundColor: colors.border, borderColor: colors.border },
              defaultVerificationMethod === option.key && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => saveDefaultVerificationMethod(option.key)}
          >
            <Text
              style={[
                styles.selectorOptionText,
                { color: colors.textSecondary },
                defaultVerificationMethod === option.key && { color: '#ffffff' },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.background} 
      />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Customize your app experience</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Appearance Section */}
        <View style={[styles.section, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
          {renderSectionHeader('Appearance', colors)}
          {renderThemeSelector(colors)}
          {renderBlackModeToggle(colors)}
        </View>

        {/* Account Section */}
        <View style={[styles.section, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
          {renderSectionHeader('Account', colors)}
          
          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Email</Text>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{merchantEmail || 'Not available'}</Text>
          </View>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('ChangePassword')}>
            <Text style={styles.actionButtonText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error }]} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={[styles.section, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
          {renderSectionHeader('About', colors)}
          
          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>App Version</Text>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>Version 1.0.0</Text>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    paddingTop: 8,
  },
  section: {
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectorContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  selectorOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  selectorOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    marginHorizontal: 20,
    marginVertical: 8,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    marginHorizontal: 20,
    marginVertical: 8,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 32,
  },
  settingInfo: {
    flex: 1,
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default SettingsScreen;
