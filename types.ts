
export interface ProductSpec {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  specs: ProductSpec[];
  image?: string;
  description?: string;
}

export interface Customer {
  id: string;
  wechatNickname: string;
  realName: string;
  phone: string;
  address: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  specName?: string;
  quantity: number;
  priceAtTime: number;
}

export type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'SHIPPED';

export interface Order {
  id: string;
  wechatNickname: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  timestamp: number;
  matchedCustomer?: Customer;
  note?: string;
}

export interface ActionLog {
  id: string;
  timestamp: number;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  message: string;
}

export interface ParsedJielongItem {
  wechatNickname: string;
  items: {
    productName: string;
    specName?: string;
    quantity: number;
  }[];
}

export interface AppBackup {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  version: string;
  timestamp: number;
}
