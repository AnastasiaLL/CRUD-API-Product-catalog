import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { registerProductRoutes } from './routes/products.js';

dotenv.config();

const PORT = parseInt(process.env.PORT || '4000', 10);

export async function createApp(): Promise<FastifyInstance> {
  const app: FastifyInstance = Fastify({
    logger: false,
  });

  await app.register(cors, {
    origin: true,
  });

  await registerProductRoutes(app);

  app.setNotFoundHandler(async (request, reply) => {
    return reply.code(404).send({
      error: 'Endpoint not found.',
    });
  });

  app.setErrorHandler(async (error, request, reply) => {
    app.log.error(error);
    return reply.code(500).send({
      error: 'Internal server error.',
    });
  });

  return app;
}

async function bootstrap() {
  const app = await createApp();

  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server is running on http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();
