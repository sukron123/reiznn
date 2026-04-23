export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  balance: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'account' | 'topup';
  game: string;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  productId: string;
  productName: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: string;
  gameId?: string;
  details?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
}
