import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';


// Import all screens
import AuthScreen from './src/screens/AuthScreen';
import Dashboard from './src/screens/Dashboard';
import POS from './src/screens/POS';
import Products from './src/screens/Products';
import Wallet from './src/screens/Wallet';
import Settings from './src/screens/SettingsScreen';
import FaceVerification from './src/screens/FaceVerification';
import QrVerification from './src/screens/QrVerification';
import Passcode from './src/screens/Passcode';
import NfcVerification from './src/screens/NfcVerification';
import TransactionConfirmation from './src/screens/TransactionConfirmation';
import TransactionSuccess from './src/screens/confirmation/TransactionSuccessScreen';
import TransactionFailure from './src/screens/confirmation/TransactionFailureScreen';
import CheckoutModal from './src/screens/modals/CheckoutModal';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';

// Import existing components
import QrScanner from './src/QrScanner';
import FaceScanner from './src/FaceScanner';
import PaymentScreen from './src/screens/PaymentScreen';

type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  CheckoutModal: { cartItems: any[]; totalAmount: number };
  FaceVerification: { cartData?: any[]; totalAmount?: number };
  QrVerification: { cartData?: any[]; totalAmount?: number };
  Passcode: { cartData?: any[]; totalAmount?: number };
  NfcVerification: { cartData?: any[]; totalAmount?: number };
  TransactionConfirmation: {
    transactionId: string;
    student: any;
    cartItems: any[];
    totalAmount: number;
  };
  TransactionSuccess: { totalAmount: number; newBalance: number };
  TransactionFailure: { errorMessage: string };
  QrScanner: undefined;
  FaceScanner: undefined;
  PaymentScreen: undefined;
  ChangePassword: undefined;
};

type TabsParamList = {
  Dashboard: undefined;
  POS: undefined;
  Products: undefined;
  Wallet: undefined;
  Settings: undefined;
};



const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabsParamList>();

// Custom tab bar component that uses theme
function ThemedTabNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={Dashboard}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Feather name="bar-chart-2" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="POS" 
        component={POS}
        options={{
          tabBarLabel: 'POS',
          tabBarIcon: ({ color, size }) => (
            <Feather name="shopping-cart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Products" 
        component={Products}
        options={{
          tabBarLabel: 'Products',
          tabBarIcon: ({ color, size }) => (
            <Feather name="box" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Wallet" 
        component={Wallet}
        options={{
          tabBarLabel: 'Wallet',
          tabBarIcon: ({ color, size }) => (
            <Feather name="briefcase" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={Settings}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const modalOptions: StackNavigationOptions = {
  presentation: 'modal',
  headerShown: false,
};

export default function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Auth"
          screenOptions={{ headerShown: false }}
        >
          {/* Initial auth flow */}
          <Stack.Screen name="Auth" component={AuthScreen} />

          {/* Main app (bottom tabs) after successful login */}
          <Stack.Screen name="MainTabs" component={ThemedTabNavigator} />

          {/* Checkout Modal */}
          <Stack.Screen 
            name="CheckoutModal" 
            component={CheckoutModal} 
            options={{ 
              presentation: 'modal',
              headerShown: false,
            }} 
          />

          {/* Verification modals */}
          <Stack.Screen name="FaceVerification" component={FaceVerification} options={modalOptions} />
          <Stack.Screen name="QrVerification" component={QrVerification} options={modalOptions} />
          <Stack.Screen name="Passcode" component={Passcode} options={modalOptions} />
          <Stack.Screen name="NfcVerification" component={NfcVerification} options={modalOptions} />

          {/* Transaction screens */}
          <Stack.Screen name="TransactionConfirmation" component={TransactionConfirmation} />
          <Stack.Screen name="TransactionSuccess" component={TransactionSuccess} />
          <Stack.Screen name="TransactionFailure" component={TransactionFailure} />

          {/* Existing screens */}
          <Stack.Screen name="QrScanner" component={QrScanner} />
          <Stack.Screen name="FaceScanner" component={FaceScanner} />
          <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
