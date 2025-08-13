import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, BackHandler } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../contexts/ThemeContext';

// Navigation types
type RootStackParamList = {
  TransactionFailure: { errorMessage: string };
  MainTabs: undefined;
};

type TransactionFailureNavigationProp = StackNavigationProp<RootStackParamList, 'TransactionFailure'>;
type TransactionFailureRouteProp = RouteProp<RootStackParamList, 'TransactionFailure'>;

const TransactionFailureScreen: React.FC = () => {
  const navigation = useNavigation<TransactionFailureNavigationProp>();
  const route = useRoute<TransactionFailureRouteProp>();
  const { errorMessage } = route.params;
  const { colors } = useTheme();

  const crossScale = useRef(new Animated.Value(0)).current;
  const crossOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;

  const handleRetry = () => {
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.navigate('MainTabs');
  };

  useEffect(() => {
    // Disable back button on Android
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return true; // Prevent back navigation
    });

    // Animate failure icon entrance
    const entranceAnimation = Animated.sequence([
      Animated.parallel([
        Animated.timing(containerOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(crossOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(crossScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(buttonsOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    entranceAnimation.start();

    return () => {
      backHandler.remove();
    };
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity, backgroundColor: colors.background }]}>
      {/* Animated Failure Icon */}
      <Animated.View
        style={[
          styles.crossContainer,
          {
            opacity: crossOpacity,
            transform: [{ scale: crossScale }],
          },
        ]}
      >
        <View style={[styles.cross, { 
          backgroundColor: colors.error,
          shadowColor: colors.error 
        }]}>
          <Text style={[styles.crossText, { color: '#ffffff' }]}>✕</Text>
        </View>
      </Animated.View>

      {/* Failure Title */}
      <Text style={[styles.title, { color: colors.error }]}>Payment Failed</Text>

      {/* Error Message */}
      <View style={[styles.errorContainer, { 
        backgroundColor: colors.surface,
        shadowColor: colors.shadow,
        borderLeftColor: colors.error 
      }]}>
        <Text style={[styles.errorMessage, { color: colors.text }]}>{errorMessage}</Text>
      </View>

      {/* Action Buttons */}
      <Animated.View style={[styles.buttonContainer, { opacity: buttonsOpacity }]}>
        <TouchableOpacity style={[styles.retryButton, { 
          backgroundColor: colors.error,
          shadowColor: colors.error 
        }]} onPress={handleRetry}>
          <Text style={[styles.retryButtonText, { color: '#ffffff' }]}>Retry Transaction</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.cancelButton, { 
          backgroundColor: colors.secondary,
          shadowColor: colors.secondary 
        }]} onPress={handleCancel}>
          <Text style={[styles.cancelButtonText, { color: '#ffffff' }]}>Return to Sale</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  crossContainer: {
    marginBottom: 32,
  },
  cross: {
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
  crossText: {
    fontSize: 60,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 32,
    textAlign: 'center',
  },
  errorContainer: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 48,
    width: '100%',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
  },
  errorMessage: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  cancelButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default TransactionFailureScreen;
