import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, WalletBalance, Transaction, TransactionHistoryResponse } from '../services/api';
import { formatCurrency, formatRelativeTime } from '../utils/dateUtils';
import { useTheme } from '../contexts/ThemeContext';
import StyledButton from '../components/StyledButton';

interface UserData {
  id: string;
  email: string;
  name: string;
  merchantId: string;
}

const WalletScreen: React.FC = () => {
  const isFocused = useIsFocused();
  const { colors, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<TransactionHistoryResponse['pagination'] | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Fetch wallet data on component mount and when focused
  useEffect(() => {
    if (isFocused && userData?.id) {
      fetchWalletData();
    }
  }, [isFocused, userData]);

  // Get user data from AsyncStorage
  useEffect(() => {
    const getUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('@merchant_app_user_data');
        if (userDataString) {
          const user = JSON.parse(userDataString);
          setUserData(user);
        }
      } catch (error) {
        console.error('Error reading user data:', error);
      }
    };
    getUserData();
  }, []);

  const fetchWalletData = async (isRefresh = false) => {
    try {
      setError(null);
      if (!isRefresh) {
        setIsLoading(true);
      }

      if (!userData?.id) {
        throw new Error('User data not available');
      }

      // Make parallel API calls for faster loading
      const [balanceData, transactionData] = await Promise.all([
        api.getWalletBalance(userData.id),
        api.getTransactionHistory(1, 20)
      ]);

      setWalletBalance(balanceData);
      setTransactions(transactionData.transactions);
      setPagination(transactionData.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch wallet data';
      setError(errorMessage);
      console.error('Wallet data fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchWalletData(true);
  };

  const handleRetry = () => {
    fetchWalletData();
  };

  const loadMoreTransactions = async () => {
    if (!pagination?.hasNextPage || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = pagination.currentPage + 1;
      
      const transactionData = await api.getTransactionHistory(nextPage, 20);
      
      setTransactions(prev => [...prev, ...transactionData.transactions]);
      setPagination(transactionData.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more transactions';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'failed':
        return '#ef4444';
      case 'refunded':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'pending':
        return '⏳';
      case 'failed':
        return '✗';
      case 'refunded':
        return '↺';
      default:
        return '?';
    }
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <View style={[styles.transactionItem, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
      <View style={[styles.transactionLeft, { borderLeftColor: colors.primary }]}>
        <Text style={[styles.transactionType, { color: colors.text }]}>
          {item.studentName}
        </Text>
        <Text style={[styles.transactionTime, { color: colors.textSecondary }]}>
          {formatRelativeTime(item.timestamp)}
        </Text>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[
          styles.transactionAmount, 
          { color: colors.success }
        ]}>
          {formatCurrency(Math.abs(item.amount))}
        </Text>
        <Text style={[styles.transactionStatus, { color: colors.textSecondary }]}>
          {item.status}
        </Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingFooterText}>Loading more transactions...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>💰</Text>
      <Text style={styles.emptyStateTitle}>No Transactions Yet</Text>
      <Text style={styles.emptyStateMessage}>
        When you start processing payments, your transaction history will appear here.
      </Text>
    </View>
  );

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading wallet...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={[styles.errorTitle, { color: colors.text }]}>Failed to load wallet</Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>{error}</Text>
          <StyledButton title="Retry" onPress={handleRetry} variant="primary" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Wallet</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Manage your finances</Text>
      </View>

      {/* Balance Card */}
      {walletBalance && (
        <View style={[styles.balanceCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Current Balance</Text>
          <Text style={[styles.balanceAmount, { color: colors.text }]}>
            {formatCurrency(walletBalance.balance)}
          </Text>
          <Text style={[styles.balanceCurrency, { color: colors.textSecondary }]}>
            {walletBalance.currency}
          </Text>
        </View>
      )}

      {/* Transactions List */}
      <View style={styles.transactionsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction History</Text>
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.transactionsList}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={loadMoreTransactions}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingMoreText, { color: colors.textSecondary }]}>
                  Loading more transactions...
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No transactions found
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                Your transaction history will appear here
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  balanceCard: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceCurrency: {
    fontSize: 18,
    fontWeight: '500',
  },
  transactionsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  transactionsList: {
    paddingBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginBottom: 12,
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionLeft: {
    flex: 1,
    marginRight: 10,
    paddingLeft: 12,
    borderLeftWidth: 4,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 14,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionStatus: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  loadingMore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});

export default WalletScreen;
