import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { api, Product, CartItem } from '../services/api';
import { formatCurrency } from '../utils/dateUtils';
import { useTheme } from '../contexts/ThemeContext';
import StyledButton from '../components/StyledButton';

type RootStackParamList = {
  PosScreen: undefined;
  CheckoutModal: { cartItems: CartItem[]; totalAmount: number };
  FaceVerification: { cartData: CartItem[]; totalAmount: number };
  QrVerification: { cartData: CartItem[]; totalAmount: number };
  Passcode: { cartData: CartItem[]; totalAmount: number };
  NfcVerification: { cartData: CartItem[]; totalAmount: number };
};

type PosScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PosScreen'>;

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;
const numColumns = isTablet ? 3 : 2;
const productCardWidth = (screenWidth - 60 - (numColumns - 1) * 12) / numColumns;

const PosScreen: React.FC = () => {
  const navigation = useNavigation<PosScreenNavigationProp>();
  const { colors, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const productsData = await api.getMyProducts();
      setProducts(productsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
      console.error('Products fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Memoized cart operations for performance
  const addToCart = useCallback((product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Increment quantity if item exists
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item with quantity 1
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  }, []);

  const updateQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or negative
      setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    } else {
      // Update quantity
      setCart(prevCart =>
        prevCart.map(item =>
          item.product.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Memoized calculations for performance
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // Memoized render functions for FlatList optimization
  const renderProductCard = useCallback(({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[styles.productCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
      onPress={() => addToCart(item)}
      activeOpacity={0.7}
    >
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.productPrice, { color: colors.primary }]}>
          {formatCurrency(item.price)}
        </Text>
        <Text style={[styles.productCategory, { color: colors.textSecondary }]}>
          {item.category}
        </Text>
      </View>
    </TouchableOpacity>
  ), [addToCart, colors]);

  const renderCartItem = useCallback(({ item }: { item: CartItem }) => (
    <View style={[styles.cartItem, { borderBottomColor: colors.border }]}>
      <View style={styles.cartItemLeft}>
        <Text style={[styles.cartItemName, { color: colors.text }]} numberOfLines={1}>
          {item.product.name}
        </Text>
        <Text style={[styles.cartItemPrice, { color: colors.textSecondary }]}>
          {formatCurrency(item.product.price)} each
        </Text>
      </View>
      
      <View style={styles.cartItemRight}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: colors.border }]}
            onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
            activeOpacity={0.7}
          >
            <Text style={[styles.quantityButtonText, { color: colors.text }]}>-</Text>
          </TouchableOpacity>
          
          <Text style={[styles.quantityText, { color: colors.text }]}>{item.quantity}</Text>
          
          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: colors.border }]}
            onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
            activeOpacity={0.7}
          >
            <Text style={[styles.quantityButtonText, { color: colors.text }]}>+</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.cartItemSubtotal, { color: colors.success }]}>
          {formatCurrency(item.product.price * item.quantity)}
        </Text>
        
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: colors.error + '20' }]}
          onPress={() => removeFromCart(item.product.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.removeButtonText, { color: colors.error }]}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [updateQuantity, removeFromCart, colors]);

  const handleCheckout = useCallback(() => {
    if (cart.length === 0) return;
    
    // Navigate to CheckoutModal
    navigation.navigate('CheckoutModal', { 
      cartItems: cart, 
      totalAmount: cartTotal 
    });
  }, [cart, cartTotal, navigation]);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading products...</Text>
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
          <Text style={[styles.errorTitle, { color: colors.text }]}>Failed to load products</Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>{error}</Text>
          <StyledButton title="Retry" onPress={fetchProducts} variant="primary" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Point of Sale</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Select products to add to cart</Text>
      </View>

      <View style={styles.mainContent}>
        {/* Products Grid */}
        <View style={styles.productsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Products</Text>
          <FlatList
            data={products}
            renderItem={renderProductCard}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            columnWrapperStyle={styles.productRow}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.productsList}
            removeClippedSubviews={true}
            maxToRenderPerBatch={8}
            windowSize={10}
            initialNumToRender={6}
          />
        </View>

        {/* Shopping Cart Panel */}
        <View style={[styles.cartPanel, { 
          backgroundColor: colors.surface, 
          borderColor: colors.border 
        }]}>
          <View style={styles.cartHeader}>
            <Text style={[styles.cartTitle, { color: colors.text }]}>Shopping Cart</Text>
            {cart.length > 0 && (
              <TouchableOpacity onPress={clearCart} activeOpacity={0.7}>
                <Text style={[styles.clearCartText, { color: colors.error }]}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <Text style={[styles.emptyCartText, { color: colors.textSecondary }]}>No items in cart</Text>
              <Text style={[styles.emptyCartSubtext, { color: colors.textSecondary }]}>Tap on products to add them</Text>
            </View>
          ) : (
            <>
              <FlatList
                data={cart}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.product.id}
                showsVerticalScrollIndicator={false}
                style={styles.cartItemsList}
                removeClippedSubviews={true}
                maxToRenderPerBatch={5}
                windowSize={5}
              />
              
              <View style={[styles.cartFooter, { borderTopColor: colors.border }]}>
                <View style={styles.cartSummaryRow}>
                  <View style={styles.cartSummaryLeft}>
                    <Text style={[styles.cartSummaryText, { color: colors.textSecondary }]}>
                      {cartItemCount} item{cartItemCount !== 1 ? 's' : ''} - Total: {formatCurrency(cartTotal)}
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    style={[
                      styles.checkoutButton, 
                      { backgroundColor: colors.primary },
                      cart.length === 0 && { backgroundColor: colors.border }
                    ]}
                    onPress={handleCheckout}
                    disabled={cart.length === 0}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.checkoutButtonText}>
                      Checkout
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
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
  mainContent: {
    flex: 1,
    flexDirection: isTablet ? 'row' : 'column',
  },
  productsSection: {
    flex: isTablet ? 2 : 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  productsList: {
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productCard: {
    width: productCardWidth,
    borderRadius: 12,
    padding: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 100,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
  },
  cartPanel: {
    flex: isTablet ? 1 : undefined,
    borderLeftWidth: isTablet ? 1 : 0,
    borderTopWidth: isTablet ? 0 : 1,
    padding: 20,
    minHeight: isTablet ? undefined : 300,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  clearCartText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCartText: {
    fontSize: 18,
    marginBottom: 8,
  },
  emptyCartSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  cartItemsList: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  cartItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
  },
  cartItemRight: {
    alignItems: 'flex-end',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  cartItemSubtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartFooter: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 16,
  },
  cartSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartSummaryLeft: {
    flex: 1,
  },
  cartSummaryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  checkoutButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
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

export default PosScreen;
