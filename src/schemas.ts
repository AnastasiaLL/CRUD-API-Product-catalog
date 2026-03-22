import { z } from 'zod';

export const createProductSchema = z
  .object({
    name: z.string().min(1, 'Name is required').trim(),
    description: z.string().min(1, 'Description is required').trim(),
    price: z.number().positive('Price must be a positive number'),
    category: z.string().min(1, 'Category is required').trim(),
    inStock: z.boolean(),
  })
  .strict();

export const updateProductSchema = z
  .object({
    name: z.string().min(1, 'Name is required').trim().optional(),
    description: z.string().min(1, 'Description is required').trim().optional(),
    price: z.number().positive('Price must be a positive number').optional(),
    category: z.string().min(1, 'Category is required').trim().optional(),
    inStock: z.boolean().optional(),
  })
  .strict();

export const validateUUID = (id: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
