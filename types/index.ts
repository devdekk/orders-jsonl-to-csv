/**
 * Order Interfaces with the properties used in this app
 */

export interface Order {
  order_id: string;
  order_date: string;
  items: Array<OrderItem>;
  discounts: Array<OrderDiscount>;
  customer: OrderCustomer;
}

interface OrderItem {
  quantity: number;
  unit_price: number;
}

export interface OrderDiscount {
  type: 'DOLLAR' | 'PERCENTAGE';
  value: number;
  priority: number;
}

interface OrderCustomer {
  shipping_address: OrderCustomerAddress;
}

interface OrderCustomerAddress {
  state: string;
}

export interface OrderReport {
  order_id: string;
  order_datetime: Date;
  total_order_value: string;
  average_unit_price: string;
  total_units_count: number;
  distinct_unit_count: number;
  customer_state: string;
}
