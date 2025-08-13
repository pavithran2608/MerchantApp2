export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  balance: number;
  studentId: string;
  semester: string;
  year: string;
}

export interface PaymentDetails {
  student: Student;
  amount: number;
  paymentMethod: string;
  reference: string;
}

export type RootStackParamList = {
  Dashboard: undefined;
  QrScanner: undefined;
  FaceScanner: undefined;
  PaymentScreen: { student: Student };
};
