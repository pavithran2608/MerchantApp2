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
  Modal,
  TextInput,
  Switch,
  ScrollView,
} from 'react-native';
import { api, Product, CreateProductRequest, UpdateProductRequest } from '../services/api';
import { formatCurrency } from '../utils/dateUtils';
import { useTheme } from '../contexts/ThemeContext';
import StyledButton from '../components/StyledButton';

interface ProductFormData {
  name: string;
  price: string;
  description: string;
  category: string;
  isActive: boolean;
}

const ProductsScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: '',
    description: '',
    category: '',
    isActive: true,
  });

  // Predefined categories for the dropdown
  const categories = [
    'Food & Dining',
    'Transportation',
    'Academic',
    'Administrative',
    'Recreation',
    'Entertainment',
    'Other'
  ];

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (isRefresh = false) => {
    try {
      setError(null);
      if (!isRefresh) {
        setIsLoading(true);
      }
      
      const productsData = await api.getMyProducts();
      setProducts(productsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
      console.error('Products fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchProducts(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      category: '',
      isActive: true,
    });
    setEditingProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalVisible(true);
  };

  const openEditModal = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description || '',
      category: product.category,
      isActive: product.isActive,
    });
    setEditingProduct(product);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    resetForm();
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Product name is required');
      return false;
    }
    if (!formData.price.trim() || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return false;
    }
    if (!formData.category.trim()) {
      Alert.alert('Error', 'Category is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const productData = {
        name: formData.name.trim(),
        price: Number(formData.price),
        description: formData.description.trim(),
        category: formData.category.trim(),
        isActive: formData.isActive,
      };

      if (editingProduct) {
        // Update existing product
        const updatedProduct = await api.updateProduct({
          id: editingProduct.id,
          ...productData,
        });
        
        setProducts(prevProducts =>
          prevProducts.map(p => p.id === editingProduct.id ? updatedProduct : p)
        );
        
        Alert.alert('Success', 'Product updated successfully');
      } else {
        // Create new product
        const newProduct = await api.createProduct(productData);
        
        setProducts(prevProducts => [newProduct, ...prevProducts]);
        
        Alert.alert('Success', 'Product created successfully');
      }
      
      closeModal();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Operation failed';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteProduct(product.id);
              
              // Remove from local state
              setProducts(prevProducts =>
                prevProducts.filter(p => p.id !== product.id)
              );
              
              Alert.alert('Success', 'Product deleted successfully');
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={[styles.productItem, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={[styles.statusIndicator, { backgroundColor: item.isActive ? colors.success : colors.error }]}>
            <Text style={styles.statusText}>
              {item.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.productPrice, { color: colors.primary }]}>
          {formatCurrency(item.price)}
        </Text>
        
        <Text style={[styles.productCategory, { color: colors.textSecondary }]}>
          {item.category}
        </Text>
        
        {item.description && (
          <Text style={[styles.productDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
      
      <View style={styles.productActions}>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.primary }]}
          onPress={() => openEditModal(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: '#e74c3c' }]}
          onPress={() => handleDelete(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategoryOption = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryOption,
        { backgroundColor: colors.border, borderColor: colors.border },
        formData.category === category && { backgroundColor: colors.primary, borderColor: colors.primary }
      ]}
      onPress={() => setFormData(prev => ({ ...prev, category }))}
    >
      <Text style={[
        styles.categoryOptionText,
        { color: colors.textSecondary },
        formData.category === category && { color: '#fff' }
      ]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

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
          <StyledButton title="Retry" onPress={() => fetchProducts()} variant="primary" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Products</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Manage your product catalog</Text>
      </View>

      {/* Add New Product Button */}
      <View style={[styles.addButtonContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={openAddModal}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+ Add New Product</Text>
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsList}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No products found</Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
              Tap "Add New Product" to create your first product
            </Text>
          </View>
        }
      />

      {/* Add/Edit Product Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </Text>
            <TouchableOpacity onPress={closeModal} activeOpacity={0.7}>
              <Text style={[styles.closeButton, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Product Name */}
            <View style={styles.formField}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Product Name *</Text>
              <TextInput
                style={[styles.textInput, { 
                  borderColor: colors.border, 
                  backgroundColor: colors.surface, 
                  color: colors.text 
                }]}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter product name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Price */}
            <View style={styles.formField}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Price *</Text>
              <TextInput
                style={[styles.textInput, { 
                  borderColor: colors.border, 
                  backgroundColor: colors.surface, 
                  color: colors.text 
                }]}
                value={formData.price}
                onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            {/* Description */}
            <View style={styles.formField}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea, { 
                  borderColor: colors.border, 
                  backgroundColor: colors.surface, 
                  color: colors.text 
                }]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Enter product description"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Category */}
            <View style={styles.formField}>
              <Text style={[styles.formLabel, { color: colors.text }]}>Category *</Text>
              <View style={styles.categoryGrid}>
                {categories.map(renderCategoryOption)}
              </View>
            </View>

            {/* Is Active Toggle */}
            <View style={styles.formField}>
              <View style={styles.toggleContainer}>
                <Text style={[styles.formLabel, { color: colors.text }]}>Is Active?</Text>
                <Switch
                  value={formData.isActive}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value }))}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={formData.isActive ? '#fff' : colors.textSecondary}
                />
              </View>
            </View>
          </ScrollView>

          {/* Modal Actions */}
          <View style={[styles.modalActions, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.border }]}
              onPress={closeModal}
              disabled={isSubmitting}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.saveButton, 
                { backgroundColor: colors.primary },
                isSubmitting && { backgroundColor: colors.border }
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {editingProduct ? 'Update' : 'Save'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
  addButtonContainer: {
    padding: 20,
    borderBottomWidth: 1,
  },
  addButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  productsList: {
    padding: 20,
  },
  productItem: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    marginBottom: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productCategory: {
    fontSize: 14,
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  productActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
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
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formField: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryOptionText: {
    fontSize: 14,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductsScreen;
