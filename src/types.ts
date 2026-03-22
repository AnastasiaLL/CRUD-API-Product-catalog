export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
}

export type CreateProductInput = Omit<Product, 'id'>;
export type UpdateProductInput = Partial<Omit<Product, 'id'>>;
