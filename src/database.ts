import { Product } from './types.js';

class Database {
  private products: Map<string, Product> = new Map();

  getAllProducts(): Product[] {
    return Array.from(this.products.values());
  }

  getProductById(id: string): Product | undefined {
    return this.products.get(id);
  }

  createProduct(product: Product): Product {
    this.products.set(product.id, product);
    return product;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const product = this.products.get(id);
    if (!product) {
      return undefined;
    }

    const updated = { ...product, ...updates, id };
    this.products.set(id, updated);
    return updated;
  }

  deleteProduct(id: string): boolean {
    return this.products.delete(id);
  }

  clear(): void {
    this.products.clear();
  }
}

export const db = new Database();
