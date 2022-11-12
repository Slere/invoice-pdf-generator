export interface PDFInformation {
  path: string;
  orderID?: number;
  vendorID?: number;
  orderDate: Date;
}
export interface VendorOrderData {
  orderItems: OrderItem[];
  orderDateString: string;
  billingAddress: Address;
  shippingAddress: Address;
  itemsTotalPrice: string;
  orderShipping: string;
  cartDiscount: string;
  orderTotal: string;
  vendor: Vendor;
}

export interface Vendor {
  pageTitle?: string;
  address?: string;
  postcode?: string;
  country?: string;
}

export interface OrderItem {
  brandName: string;
  name: string;
  sku: string;
  quantity: string;
  lineTotal: string;
}

export interface Address {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  country?: string;
  postcode?: string;
  city?: string;
}
