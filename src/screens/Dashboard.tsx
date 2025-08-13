import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, DashboardStats } from '../services/api';
import { formatRelativeTime, formatCurrency } from '../utils/dateUtils';
import { useTheme } from '../contexts/ThemeContext';
import StyledButton from '../components/StyledButton';
import StatCard from '../components/StatCard';

interface UserData {
  id: string;
  email: string;
  name: string;
  merchantId: string;
}

const Dashboard: React.FC = () => {
  const isFocused = useIsFocused();
  const { colors, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      setError(null);
      if (!isRefresh) {
        setIsLoading(true);
      }
      
      const [statsResponse, storedUserData] = await Promise.all([
        api.getDashboardStats(),
        AsyncStorage.getItem('userData')
      ]);

      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }

      setDashboardData(statsResponse);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Dashboard data fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRetry = () => {
    fetchDashboardData();
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData(true);
  };

  useEffect(() => {
    if (isFocused) {
      fetchDashboardData();
    }
  }, [isFocused]);

  const renderTransactionItem = ({ item }: { item: DashboardStats['recentTransactions'][0] }) => (
    <View style={[styles.transactionItem, { borderBottomColor: colors.border }]}>
      <View style={styles.transactionLeft}>
        <Text style={[styles.studentName, { color: colors.text }]}>{item.studentName}</Text>
        <Text style={[styles.transactionTime, { color: colors.textSecondary }]}>{formatRelativeTime(item.timestamp)}</Text>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[styles.transactionAmount, { color: colors.success }]}>{formatCurrency(item.amount)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'failed':
        return colors.error;
      default:
        return colors.secondary;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={[styles.errorTitle, { color: colors.text }]}>Something went wrong</Text>
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
        <Text style={[styles.title, { color: colors.text }]}>Dashboard</Text>
        {userData && (
          <Text style={[styles.businessName, { color: colors.textSecondary }]}>{userData.name}</Text>
        )}
      </View>

      {/* Content */}
      <FlatList
        style={styles.content}
        data={[1]} // Single item to render the content
        keyExtractor={() => 'dashboard-content'}
        renderItem={() => (
          <>
            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              {dashboardData && (
                <>
                  <StatCard
                    title="TOTAL SALES"
                    value={formatCurrency(dashboardData.todaySales)}
                    subtitle="TODAY"
                  />
                  <StatCard
                    title="TRANSACTIONS"
                    value={dashboardData.todayTransactions.toString()}
                    subtitle="TODAY"
                  />
                </>
              )}
            </View>

            {/* Recent Transactions */}
            <View style={[styles.transactionsCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
              <View style={styles.transactionsHeader}>
                <Text style={[styles.transactionsTitle, { color: colors.text }]}>Recent Transactions</Text>
                <TouchableOpacity>
                  <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
                </TouchableOpacity>
              </View>
              
              {dashboardData?.recentTransactions && (
                <FlatList
                  data={dashboardData.recentTransactions}
                  keyExtractor={(item) => item.id}
                  renderItem={renderTransactionItem}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          </>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
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
  businessName: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  transactionsCard: {
    margin: 16,
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  transactionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  transactionLeft: {
    flex: 1,
    marginRight: 16,
  },
  studentName: {
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
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
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
});

export default Dashboard;
