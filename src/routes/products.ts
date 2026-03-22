import { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
import { db } from '../database.js';
import {
  createProductSchema,
  updateProductSchema,
  validateUUID,
} from '../schemas.js';
import { Product } from '../types.js';

type ErrorResponse = { error: string };
type ApiResponse<T> = T | ErrorResponse;

export async function registerProductRoutes(app: FastifyInstance) {
  app.get<{ Reply: Product[] }>(
    '/api/products',
    async (request, reply) => {
      const products = db.getAllProducts();
      return reply.code(200).send(products);
    }
  );

  app.get<{ Params: { productId: string }; Reply: ApiResponse<Product> }>(
    '/api/products/:productId',
    async (request, reply) => {
      const { productId } = request.params;

      if (!validateUUID(productId)) {
        return reply.code(400).send({
          error: 'Invalid product ID format. Must be a valid UUID.',
        });
      }

      const product = db.getProductById(productId);
      if (!product) {
        return reply.code(404).send({
          error: 'Product not found.',
        });
      }

      return reply.code(200).send(product);
    }
  );

  app.post<{ Body: unknown; Reply: ApiResponse<Product> }>(
    '/api/products',
    async (request, reply) => {
      try {
        const validated = createProductSchema.parse(request.body);
        const product: Product = {
          id: randomUUID(),
          ...validated,
        };

        db.createProduct(product);
        return reply.code(201).send(product);
      } catch (error) {
        if (error instanceof SyntaxError) {
          return reply.code(400).send({
            error: 'Invalid request body. Must be valid JSON.',
          });
        }

        let errorMessage = 'Invalid request body.';
        if (error instanceof Error && error.message) {
          errorMessage = error.message;
        }

        return reply.code(400).send({
          error: errorMessage,
        });
      }
    }
  );

  app.put<{ Params: { productId: string }; Body: unknown; Reply: ApiResponse<Product> }>(
    '/api/products/:productId',
    async (request, reply) => {
      const { productId } = request.params;

      if (!validateUUID(productId)) {
        return reply.code(400).send({
          error: 'Invalid product ID format. Must be a valid UUID.',
        });
      }

      try {
        const validated = updateProductSchema.parse(request.body);
        const updated = db.updateProduct(productId, validated);

        if (!updated) {
          return reply.code(404).send({
            error: 'Product not found.',
          });
        }

        return reply.code(200).send(updated);
      } catch (error) {
        if (error instanceof SyntaxError) {
          return reply.code(400).send({
            error: 'Invalid request body. Must be valid JSON.',
          });
        }

        let errorMessage = 'Invalid request body.';
        if (error instanceof Error && error.message) {
          errorMessage = error.message;
        }

        return reply.code(400).send({
          error: errorMessage,
        });
      }
    }
  );

  app.delete<{ Params: { productId: string } }>(
    '/api/products/:productId',
    async (request, reply) => {
      const { productId } = request.params;

      if (!validateUUID(productId)) {
        return reply.code(400).send({
          error: 'Invalid product ID format. Must be a valid UUID.',
        });
      }

      const deleted = db.deleteProduct(productId);

      if (!deleted) {
        return reply.code(404).send({
          error: 'Product not found.',
        });
      }

      return reply.code(204).send();
    }
  );
}
