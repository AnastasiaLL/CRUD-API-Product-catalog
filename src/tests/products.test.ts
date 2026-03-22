import { FastifyInstance } from "fastify";
import { db } from "../database";
import { createApp } from "../main";
import { Product } from "../types";

describe('Product CRUD API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    db.clear();
  });

  describe('GET /api/products', () => {
    it('should return an empty array initially', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/products',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([]);
    });

    it('should return all products', async () => {
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          name: 'Test Product',
          description: 'A test product',
          price: 29.99,
          category: 'electronics',
          inStock: true,
        },
      });

      const createdProduct = createResponse.json<Product>();

      const response = await app.inject({
        method: 'GET',
        url: '/api/products',
      });

      expect(response.statusCode).toBe(200);
      const products = response.json<Product[]>();
      expect(products).toHaveLength(1);
      expect(products[0]).toEqual(createdProduct);
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product successfully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          name: 'Laptop',
          description: 'A powerful laptop',
          price: 999.99,
          category: 'electronics',
          inStock: true,
        },
      });

      expect(response.statusCode).toBe(201);
      const product = response.json<Product>();
      expect(product.name).toBe('Laptop');
      expect(product.description).toBe('A powerful laptop');
      expect(product.price).toBe(999.99);
      expect(product.category).toBe('electronics');
      expect(product.inStock).toBe(true);
      expect(product.id).toBeDefined();
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          name: 'Incomplete Product',
        },
      });

      expect(response.statusCode).toBe(400);
      const error = response.json();
      expect(error.error).toBeDefined();
    });

    it('should return 400 if price is not positive', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          name: 'Invalid Price Product',
          description: 'A product with invalid price',
          price: -10,
          category: 'electronics',
          inStock: true,
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error).toContain('positive');
    });

    it('should return 400 if price is zero', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          name: 'Zero Price Product',
          description: 'A product with zero price',
          price: 0,
          category: 'electronics',
          inStock: true,
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error).toContain('positive');
    });
  });

  describe('GET /api/products/:productId', () => {
    it('should return a product by valid ID', async () => {
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          name: 'Book',
          description: 'A great book',
          price: 15.99,
          category: 'books',
          inStock: true,
        },
      });

      const createdProduct = createResponse.json<Product>();

      const response = await app.inject({
        method: 'GET',
        url: `/api/products/${createdProduct.id}`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(createdProduct);
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/products/invalid-id',
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error).toContain('Invalid product ID format');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/products/550e8400-e29b-41d4-a716-446655440000',
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().error).toContain('not found');
    });
  });

  describe('PUT /api/products/:productId', () => {
    it('should update a product successfully', async () => {
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          name: 'Original Name',
          description: 'Original description',
          price: 50.0,
          category: 'clothing',
          inStock: true,
        },
      });

      const createdProduct = createResponse.json<Product>();

      const updateResponse = await app.inject({
        method: 'PUT',
        url: `/api/products/${createdProduct.id}`,
        payload: {
          name: 'Updated Name',
          price: 75.0,
        },
      });

      expect(updateResponse.statusCode).toBe(200);
      const updated = updateResponse.json<Product>();
      expect(updated.id).toBe(createdProduct.id);
      expect(updated.name).toBe('Updated Name');
      expect(updated.price).toBe(75.0);
      expect(updated.description).toBe('Original description');
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/products/invalid-id',
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error).toContain('Invalid product ID format');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/products/550e8400-e29b-41d4-a716-446655440000',
        payload: {
          name: 'Updated Name',
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().error).toContain('not found');
    });

    it('should return 400 for invalid price', async () => {
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          name: 'Test Product',
          description: 'Test',
          price: 50.0,
          category: 'electronics',
          inStock: true,
        },
      });

      const createdProduct = createResponse.json<Product>();

      const updateResponse = await app.inject({
        method: 'PUT',
        url: `/api/products/${createdProduct.id}`,
        payload: {
          price: -10,
        },
      });

      expect(updateResponse.statusCode).toBe(400);
      expect(updateResponse.json().error).toContain('positive');
    });
  });

  describe('DELETE /api/products/:productId', () => {
    it('should delete a product successfully', async () => {
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          name: 'Product to Delete',
          description: 'Will be deleted',
          price: 25.0,
          category: 'electronics',
          inStock: true,
        },
      });

      const createdProduct = createResponse.json<Product>();

      const deleteResponse = await app.inject({
        method: 'DELETE',
        url: `/api/products/${createdProduct.id}`,
      });

      expect(deleteResponse.statusCode).toBe(204);
      expect(deleteResponse.body).toBe('');

      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/products/${createdProduct.id}`,
      });

      expect(getResponse.statusCode).toBe(404);
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/products/invalid-id',
      });

      expect(response.statusCode).toBe(400);
      expect(response.json().error).toContain('Invalid product ID format');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/products/550e8400-e29b-41d4-a716-446655440000',
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().error).toContain('not found');
    });
  });

  describe('CRUD workflow', () => {
    it('should successfully create, read, update, and delete a product', async () => {
      let response = await app.inject({
        method: 'GET',
        url: '/api/products',
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([]);

      response = await app.inject({
        method: 'POST',
        url: '/api/products',
        payload: {
          name: 'Test Product',
          description: 'A test product for CRUD workflow',
          price: 99.99,
          category: 'electronics',
          inStock: true,
        },
      });
      expect(response.statusCode).toBe(201);
      const createdProduct = response.json<Product>();
      expect(createdProduct.id).toBeDefined();

      response = await app.inject({
        method: 'GET',
        url: `/api/products/${createdProduct.id}`,
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(createdProduct);

      response = await app.inject({
        method: 'PUT',
        url: `/api/products/${createdProduct.id}`,
        payload: {
          name: 'Updated Test Product',
          price: 149.99,
        },
      });
      expect(response.statusCode).toBe(200);
      const updatedProduct = response.json<Product>();
      expect(updatedProduct.id).toBe(createdProduct.id);
      expect(updatedProduct.name).toBe('Updated Test Product');
      expect(updatedProduct.price).toBe(149.99);

      response = await app.inject({
        method: 'DELETE',
        url: `/api/products/${createdProduct.id}`,
      });
      expect(response.statusCode).toBe(204);

      response = await app.inject({
        method: 'GET',
        url: `/api/products/${createdProduct.id}`,
      });
      expect(response.statusCode).toBe(404);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/some-non/existing/resource',
      });

      expect(response.statusCode).toBe(404);
      expect(response.json().error).toContain('not found');
    });
  });
});
