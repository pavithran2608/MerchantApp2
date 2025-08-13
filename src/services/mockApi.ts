import { Student } from '../types';

// Mock student database
const mockStudents: Record<string, Student> = {
  'STU001': {
    id: 'STU001',
    name: 'John Smith',
    email: 'john.smith@university.edu',
    phone: '+1-555-0123',
    department: 'Computer Science',
    balance: 1250.00,
    studentId: 'STU001',
    semester: 'Fall 2024',
    year: '2024'
  },
  'STU002': {
    id: 'STU002',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    phone: '+1-555-0124',
    department: 'Business Administration',
    balance: 850.50,
    studentId: 'STU002',
    semester: 'Fall 2024',
    year: '2024'
  },
  'STU003': {
    id: 'STU003',
    name: 'Michael Chen',
    email: 'michael.chen@university.edu',
    phone: '+1-555-0125',
    department: 'Engineering',
    balance: 2100.75,
    studentId: 'STU003',
    semester: 'Fall 2024',
    year: '2024'
  },
  'STU004': {
    id: 'STU004',
    name: 'Emily Davis',
    email: 'emily.davis@university.edu',
    phone: '+1-555-0126',
    department: 'Arts & Humanities',
    balance: 675.25,
    studentId: 'STU004',
    semester: 'Fall 2024',
    year: '2024'
  },
  'STU005': {
    id: 'STU005',
    name: 'David Wilson',
    email: 'david.wilson@university.edu',
    phone: '+1-555-0127',
    department: 'Medicine',
    balance: 3200.00,
    studentId: 'STU005',
    semester: 'Fall 2024',
    year: '2024'
  }
};

export const fetchStudentDetails = async (studentId: string): Promise<Student> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const student = mockStudents[studentId];
  
  if (!student) {
    throw new Error(`Student with ID ${studentId} not found`);
  }
  
  return student;
};

export const processPayment = async (
  studentId: string, 
  amount: number, 
  paymentMethod: string
): Promise<{ success: boolean; reference: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate a random payment reference
  const reference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  // Simulate payment processing
  const success = Math.random() > 0.1; // 90% success rate
  
  return {
    success,
    reference: success ? reference : ''
  };
};
