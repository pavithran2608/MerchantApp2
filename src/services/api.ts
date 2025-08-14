import { embeddingService, EmbeddingResult } from './embeddingService';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    merchantId: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface DashboardStats {
  todaySales: number;
  todayTransactions: number;
  walletBalance: number;
  recentTransactions: Array<{
    id: string;
    studentName: string;
    amount: number;
    timestamp: string;
    status: 'completed' | 'pending' | 'failed';
  }>;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
  imageUrl?: string;
  isActive: boolean;
  stockQuantity: number;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  description?: string;
  category: string;
  isActive: boolean;
}

export interface UpdateProductRequest extends CreateProductRequest {
  id: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WalletBalance {
  balance: number;
  currency: string;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  amount: number;
  studentName: string;
  studentId: string;
  productName: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  transactionType: 'credit' | 'debit';
  reference: string;
}

export interface TransactionHistoryResponse {
  transactions: Transaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  parentPhone: string;
  department: string;
  semester: string;
  year: string;
  balance: number;
  imageUrl?: string;
}

export interface FindStudentResponse {
  student: Student;
  message: string;
}

export interface FaceVerificationRequest {
  studentId: string;
  imageData: string; // Base64 encoded image
  embedding?: number[]; // Optional FaceNet embedding
  cartItems: CartItem[];
  totalAmount: number;
}

export interface FaceVerificationResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  verificationScore?: number;
}

export interface VerifyPasscodeRequest {
  qrToken: string;
  passcode: string; // 4-digit
  cartItems: CartItem[];
  totalAmount: number;
}

export interface VerifyPasscodeResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  student?: Student;
  transaction?: Transaction; // Added for detailed transaction data
}

class ApiService {
  private baseUrl = 'https://api.merchantapp.com'; // Replace with your actual API URL
  private authToken: string | null = null;

  // Mock authentication token getter
  private async getAuthToken(): Promise<string> {
    if (this.authToken) {
      return this.authToken;
    }
    // For demo purposes, return a mock token
    return 'mock-jwt-token-12345';
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (credentials.email === 'demo@merchant.com' && credentials.password === 'password') {
        return {
          token: 'mock-jwt-token-12345',
          user: {
            id: '1',
            email: credentials.email,
            name: 'Demo Merchant',
            merchantId: 'MERCHANT_001'
          }
        };
      }
      throw new Error('Invalid credentials. Please try again.');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection.');
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        todaySales: 12450.75,
        todayTransactions: 156,
        walletBalance: 8750.25,
        recentTransactions: [
          { id: 'txn_001', studentName: 'John Smith', amount: 125.50, timestamp: '2024-01-15T10:30:00Z', status: 'completed' },
          { id: 'txn_002', studentName: 'Sarah Johnson', amount: 89.99, timestamp: '2024-01-15T10:25:00Z', status: 'completed' },
          { id: 'txn_003', studentName: 'Michael Chen', amount: 200.00, timestamp: '2024-01-15T10:20:00Z', status: 'completed' },
          { id: 'txn_004', studentName: 'Emily Davis', amount: 75.25, timestamp: '2024-01-15T10:15:00Z', status: 'completed' },
          { id: 'txn_005', studentName: 'David Wilson', amount: 150.00, timestamp: '2024-01-15T10:10:00Z', status: 'completed' }
        ]
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch dashboard data. Please try again.');
    }
  }

  async getMyProducts(): Promise<Product[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      return [
        { id: 'prod_001', name: 'Student Meal Plan', price: 12.99, description: 'Daily student meal plan with balanced nutrition', category: 'Food & Dining', imageUrl: 'https://example.com/meal-plan.jpg', isActive: true, stockQuantity: 100 },
        { id: 'prod_002', name: 'Campus Parking Pass', price: 45.00, description: 'Monthly parking permit for campus facilities', category: 'Transportation', imageUrl: 'https://example.com/parking.jpg', isActive: true, stockQuantity: 50 },
        { id: 'prod_003', name: 'Library Fine Payment', price: 5.00, description: 'Payment for overdue library materials', category: 'Academic', imageUrl: 'https://example.com/library.jpg', isActive: true, stockQuantity: 999 },
        { id: 'prod_004', name: 'Student ID Replacement', price: 25.00, description: 'Replacement student identification card', category: 'Administrative', imageUrl: 'https://example.com/student-id.jpg', isActive: true, stockQuantity: 200 },
        { id: 'prod_005', name: 'Gym Membership', price: 35.00, description: 'Monthly access to campus fitness center', category: 'Recreation', imageUrl: 'https://example.com/gym.jpg', isActive: true, stockQuantity: 75 },
        { id: 'prod_006', name: 'Event Ticket', price: 15.00, description: 'Admission to campus events and activities', category: 'Entertainment', imageUrl: 'https://example.com/event.jpg', isActive: true, stockQuantity: 150 },
        { id: 'prod_007', name: 'Printing Credits', price: 10.00, description: '100 pages of printing credits', category: 'Academic', imageUrl: 'https://example.com/printing.jpg', isActive: true, stockQuantity: 500 },
        { id: 'prod_008', name: 'Lab Equipment Rental', price: 20.00, description: 'Daily rental of laboratory equipment', category: 'Academic', imageUrl: 'https://example.com/lab-equipment.jpg', isActive: true, stockQuantity: 30 }
      ];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch products. Please try again.');
    }
  }

  async createProduct(productData: CreateProductRequest): Promise<Product> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newProduct: Product = { id: `prod_${Date.now()}`, ...productData, imageUrl: 'https://example.com/default.jpg', stockQuantity: 0 };
      return newProduct;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create product. Please try again.');
    }
  }

  async updateProduct(productData: UpdateProductRequest): Promise<Product> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedProduct: Product = { id: productData.id, name: productData.name, price: productData.price, description: productData.description, category: productData.category, isActive: productData.isActive, imageUrl: 'https://example.com/default.jpg', stockQuantity: 0 };
      return updatedProduct;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update product. Please try again.');
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log(`Product ${productId} deleted successfully`);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to delete product. Please try again.');
    }
  }

  async getWalletBalance(userId: string): Promise<WalletBalance> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      return { balance: 8750.25, currency: 'USD', lastUpdated: new Date().toISOString() };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch wallet balance. Please try again.');
    }
  }

  async getTransactionHistory(page: number = 1, limit: number = 20): Promise<TransactionHistoryResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockTransactions: Transaction[] = [
        { id: 'txn_001', amount: 125.50, studentName: 'John Smith', studentId: 'STU001', productName: 'Student Meal Plan', timestamp: '2024-01-15T10:30:00Z', status: 'completed', transactionType: 'credit', reference: 'REF001' },
        { id: 'txn_002', amount: 89.99, studentName: 'Sarah Johnson', studentId: 'STU002', productName: 'Campus Parking Pass', timestamp: '2024-01-15T10:25:00Z', status: 'completed', transactionType: 'credit', reference: 'REF002' },
        { id: 'txn_003', amount: 200.00, studentName: 'Michael Chen', studentId: 'STU003', productName: 'Gym Membership', timestamp: '2024-01-15T10:20:00Z', status: 'completed', transactionType: 'credit', reference: 'REF003' },
        { id: 'txn_004', amount: 75.25, studentName: 'Emily Davis', studentId: 'STU004', productName: 'Library Fine Payment', timestamp: '2024-01-15T10:15:00Z', status: 'completed', transactionType: 'credit', reference: 'REF004' },
        { id: 'txn_005', amount: 150.00, studentName: 'David Wilson', studentId: 'STU005', productName: 'Event Ticket', timestamp: '2024-01-15T10:10:00Z', status: 'completed', transactionType: 'credit', reference: 'REF005' },
        { id: 'txn_006', amount: 45.00, studentName: 'Lisa Brown', studentId: 'STU006', productName: 'Student ID Replacement', timestamp: '2024-01-15T10:05:00Z', status: 'completed', transactionType: 'credit', reference: 'REF006' },
        { id: 'txn_007', amount: 10.00, studentName: 'Robert Taylor', studentId: 'STU007', productName: 'Printing Credits', timestamp: '2024-01-15T10:00:00Z', status: 'completed', transactionType: 'credit', reference: 'REF007' },
        { id: 'txn_008', amount: 20.00, studentName: 'Jennifer Lee', studentId: 'STU008', productName: 'Lab Equipment Rental', timestamp: '2024-01-15T09:55:00Z', status: 'completed', transactionType: 'credit', reference: 'REF008' },
        { id: 'txn_009', amount: 35.00, studentName: 'Christopher Garcia', studentId: 'STU009', productName: 'Gym Membership', timestamp: '2024-01-15T09:50:00Z', status: 'completed', transactionType: 'credit', reference: 'REF009' },
        { id: 'txn_010', amount: 15.00, studentName: 'Amanda Martinez', studentId: 'STU010', productName: 'Event Ticket', timestamp: '2024-01-15T09:45:00Z', status: 'completed', transactionType: 'credit', reference: 'REF010' }
      ];
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedTransactions = mockTransactions.slice(startIndex, endIndex);
      const totalItems = mockTransactions.length;
      const totalPages = Math.ceil(totalItems / limit);
      return {
        transactions: paginatedTransactions,
        pagination: { currentPage: page, totalPages, totalItems, itemsPerPage: limit, hasNextPage: page < totalPages, hasPreviousPage: page > 1 }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch transaction history. Please try again.');
    }
  }

  async findStudentByPhone(parentPhone: string): Promise<FindStudentResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (parentPhone === '555-0123' || parentPhone === '5550123') {
        return { student: { id: 'stu_001', studentId: 'STU001', name: 'John Smith', email: 'john.smith@university.edu', phone: '+1-555-0124', parentPhone, department: 'Computer Science', semester: 'Fall 2024', year: '2024', balance: 1250.00, imageUrl: 'https://example.com/student-photo.jpg' }, message: 'Student found successfully' };
      } else if (parentPhone === '555-0125' || parentPhone === '5550125') {
        return { student: { id: 'stu_002', studentId: 'STU002', name: 'Sarah Johnson', email: 'sarah.johnson@university.edu', phone: '+1-555-0126', parentPhone, department: 'Engineering', semester: 'Fall 2024', year: '2024', balance: 890.50, imageUrl: 'https://example.com/student-photo-2.jpg' }, message: 'Student found successfully' };
      } else {
        throw new Error('No student found with this parent phone number. Please verify the number and try again.');
      }
    } catch (error) {
      if (error instanceof Error) { throw error; }
      throw new Error('Failed to find student. Please try again.');
    }
  }

  async findStudentByRegistrationId(registrationId: string): Promise<FindStudentResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (registrationId === 'STU001' || registrationId === 'stu001') {
        return { student: { id: 'stu_001', studentId: 'STU001', name: 'John Smith', email: 'john.smith@university.edu', phone: '+1-555-0124', parentPhone: '+1-555-0123', department: 'Computer Science', semester: 'Fall 2024', year: '2024', balance: 1250.00, imageUrl: 'https://example.com/student-photo.jpg' }, message: 'Student found successfully' };
      } else if (registrationId === 'STU002' || registrationId === 'stu002') {
        return { student: { id: 'stu_002', studentId: 'STU002', name: 'Sarah Johnson', email: 'sarah.johnson@university.edu', phone: '+1-555-0126', parentPhone: '+1-555-0125', department: 'Engineering', semester: 'Fall 2024', year: '2024', balance: 890.50, imageUrl: 'https://example.com/student-photo-2.jpg' }, message: 'Student found successfully' };
      } else {
        throw new Error('No student found with this registration ID. Please verify the ID and try again.');
      }
    } catch (error) {
      if (error instanceof Error) { throw error; }
      throw new Error('Failed to find student. Please try again.');
    }
  }

  async verifyFace(verificationData: FaceVerificationRequest) {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Log embedding if provided
      if (verificationData.embedding) {
        console.log('FaceNet embedding received:', {
          length: verificationData.embedding.length,
          first8Values: verificationData.embedding.slice(0, 8),
          last8Values: verificationData.embedding.slice(-8)
        });
      } else {
        console.log('No FaceNet embedding provided - using basic face detection only');
      }
      
      const randomSuccess = Math.random() > 0.3;
      if (randomSuccess) {
        return { success: true, message: 'Face verification successful! Identity confirmed.', transactionId: `TXN_${Date.now()}`, verificationScore: 0.94 };
      } else {
        throw new Error('Face verification failed. The captured image does not match the student\'s registered photo. Please try again.');
      }
    } catch (error) {
      if (error instanceof Error) { throw error; }
      throw new Error('Face verification failed. Please try again.');
    }
  }

  async verifyPasscode(request: VerifyPasscodeRequest): Promise<VerifyPasscodeResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Demo logic: accept passcode 1234 only
      if (request.passcode === '1234' && request.qrToken && request.cartItems.length > 0) {
        const transactionId = `TXN_${Date.now()}`;
        const student = {
          id: 'stu_001',
          studentId: 'STU001',
          name: 'John Smith',
          email: 'john.smith@university.edu',
          phone: '+1-555-0124',
          parentPhone: '+1-555-0123',
          department: 'Computer Science',
          semester: 'Fall 2024',
          year: '2024',
          balance: 1250.0,
          imageUrl: 'https://example.com/student-photo.jpg',
        };
        
        return {
          success: true,
          message: 'Passcode verified successfully',
          transactionId,
          student,
          // Add detailed transaction data
          transaction: {
            id: transactionId,
            amount: request.totalAmount,
            studentName: student.name,
            studentId: student.studentId,
            productName: request.cartItems.map(item => item.product.name).join(', '),
            timestamp: new Date().toISOString(),
            status: 'completed',
            transactionType: 'credit',
            reference: `REF_${Date.now()}`,
          },
        };
      }
      throw new Error('Incorrect Passcode. Please try again.');
    } catch (error) {
      if (error instanceof Error) { throw error; }
      throw new Error('Passcode verification failed. Please try again.');
    }
  }

  async verifyNfc(request: { cartItems: CartItem[]; totalAmount: number }): Promise<VerifyPasscodeResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Demo logic: simulate NFC verification success
      const transactionId = `TXN_${Date.now()}`;
      const student = {
        id: 'stu_002',
        studentId: 'STU002',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@university.edu',
        phone: '+1-555-0126',
        parentPhone: '+1-555-0125',
        department: 'Engineering',
        semester: 'Fall 2024',
        year: '2024',
        balance: 890.50,
        imageUrl: 'https://example.com/student-photo-2.jpg',
      };
      
      return {
        success: true,
        message: 'NFC verification successful',
        transactionId,
        student,
        // Add detailed transaction data
        transaction: {
          id: transactionId,
          amount: request.totalAmount,
          studentName: student.name,
          studentId: student.studentId,
          productName: request.cartItems.map(item => item.product.name).join(', '),
          timestamp: new Date().toISOString(),
          status: 'completed',
          transactionType: 'credit',
          reference: `REF_${Date.now()}`,
        },
      };
    } catch (error) {
      if (error instanceof Error) { throw error; }
      throw new Error('NFC verification failed. Please try again.');
    }
  }

  /**
   * Verify face using MobileNet embeddings
   * Sends the generated embedding vector to the backend for comparison
   */
  async verifyFaceWithEmbedding(
    imageUri: string, 
    studentId: string
  ): Promise<FaceVerificationResponse> {
    try {
      console.log('Starting face verification with embedding...');
      
      // Ensure embedding service is initialized
      if (!embeddingService.isReady()) {
        console.log('Initializing embedding service...');
        await embeddingService.initialize();
      }
      
      // Generate embedding on frontend
      console.log('Generating face embedding...');
      const embeddingResult: EmbeddingResult = await embeddingService.generateFaceEmbedding(imageUri);
      
      console.log(`Embedding generated: ${embeddingResult.embedding.length} dimensions, confidence: ${embeddingResult.confidence.toFixed(3)}`);
      
      // For demo purposes, simulate backend verification
      // In production, you would send the embedding to your backend
      console.log('Simulating backend verification...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      // Mock verification result (90% success rate for demo)
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        const transactionId = `TXN_${Date.now()}`;
        console.log('Face verification successful!');
        
        return {
          success: true,
          message: 'Face verification successful! Identity confirmed.',
          transactionId,
          verificationScore: 0.94
        };
      } else {
        throw new Error('Face verification failed. The captured image does not match the student\'s registered photo. Please try again.');
      }
      
    } catch (error) {
      console.error('Face verification error:', error);
      throw new Error(`Face verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const api = new ApiService();
export default api;
