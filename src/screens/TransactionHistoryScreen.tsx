import React, { useCallback, useEffect, useState } from 'react';
import {
	SafeAreaView,
	StatusBar,
	View,
	Text,
	StyleSheet,
	FlatList,
	ActivityIndicator,
	RefreshControl,
	TouchableOpacity,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { api, Transaction } from '../services/api';

interface PaginationState {
	currentPage: number;
	totalPages: number;
	hasNextPage: boolean;
}

const PAGE_SIZE = 20;

const TransactionHistoryScreen: React.FC = () => {
	const { colors, isDark } = useTheme();
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [pagination, setPagination] = useState<PaginationState>({ currentPage: 1, totalPages: 1, hasNextPage: false });
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
	const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const fetchPage = useCallback(async (page: number, replace: boolean = false) => {
		try {
			if (!replace && page > 1) {
				setIsLoadingMore(true);
			} else if (!isRefreshing) {
				setIsLoading(true);
			}
			setError(null);
			const resp = await api.getTransactionHistory(page, PAGE_SIZE);
			setTransactions(prev => (replace ? resp.transactions : [...prev, ...resp.transactions]));
			setPagination({
				currentPage: resp.pagination.currentPage,
				totalPages: resp.pagination.totalPages,
				hasNextPage: resp.pagination.hasNextPage,
			});
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to load transactions';
			setError(message);
		} finally {
			setIsLoading(false);
			setIsRefreshing(false);
			setIsLoadingMore(false);
		}
	}, [isRefreshing]);

	useEffect(() => {
		fetchPage(1, true);
	}, [fetchPage]);

	const onRefresh = () => {
		setIsRefreshing(true);
		fetchPage(1, true);
	};

	const loadMore = () => {
		if (!isLoadingMore && pagination.hasNextPage) {
			fetchPage(pagination.currentPage + 1);
		}
	};

	const renderItem = ({ item }: { item: Transaction }) => (
		<View style={[styles.itemContainer, { borderBottomColor: colors.border }]}>
			<View style={styles.itemLeft}>
				<Text style={[styles.itemTitle, { color: colors.text }]}>{item.studentName}</Text>
				<Text style={[styles.itemSub, { color: colors.textSecondary }]}>{item.productName}</Text>
				<Text style={[styles.itemMeta, { color: colors.textSecondary }]}>{new Date(item.timestamp).toLocaleString()}</Text>
			</View>
			<View style={styles.itemRight}>
				<Text style={[styles.amount, { color: colors.success }]}>${item.amount.toFixed(2)}</Text>
				<View style={[styles.statusBadge, { backgroundColor: statusToColor(item.status, colors) }]}>
					<Text style={styles.statusText}>{item.status}</Text>
				</View>
			</View>
		</View>
	);

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
			<StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

			{isLoading && !isRefreshing ? (
				<View style={styles.center}>
					<ActivityIndicator size="large" color={colors.primary} />
					<Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
				</View>
			) : error ? (
				<View style={styles.center}>
					<Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
					<TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={() => fetchPage(1, true)}>
						<Text style={styles.retryText}>Retry</Text>
					</TouchableOpacity>
				</View>
			) : (
				<FlatList
					data={transactions}
					keyExtractor={(item) => item.id}
					renderItem={renderItem}
					contentContainerStyle={transactions.length === 0 ? styles.center : undefined}
					ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.textSecondary }]}>No transactions found</Text>}
					refreshControl={
						<RefreshControl
							refreshing={isRefreshing}
							onRefresh={onRefresh}
							colors={[colors.primary]}
																		
																		
						/>
					}
					onEndReachedThreshold={0.5}
					onEndReached={loadMore}
					ListFooterComponent={isLoadingMore ? (
						<View style={styles.footerLoading}>
							<ActivityIndicator size="small" color={colors.primary} />
						</View>
					) : null}
				/>
			)}
		</SafeAreaView>
	);
};

function statusToColor(status: string, colors: any) {
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
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
	loadingText: { marginTop: 12, fontSize: 16 },
	errorText: { fontSize: 16, marginBottom: 12 },
	retryButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
	retryText: { color: '#FFFFFF', fontWeight: '600' },
	itemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, borderBottomWidth: 1 },
	itemLeft: { flex: 1, paddingRight: 12 },
	itemRight: { alignItems: 'flex-end' },
	itemTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
	itemSub: { fontSize: 14, marginBottom: 4 },
	itemMeta: { fontSize: 12 },
	amount: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
	statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
	statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
	footerLoading: { paddingVertical: 16 },
	emptyText: { fontSize: 16 },
});

export default TransactionHistoryScreen;


