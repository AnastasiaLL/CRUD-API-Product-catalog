# Product Catalog CRUD API

A simple CRUD API for managing a Product Catalog built with Fastify and TypeScript, featuring in-memory database management, comprehensive validation, and horizontal scaling capabilities.

## Features

- ✅ Full CRUD operations for products
- ✅ Async API with Fastify framework
- ✅ Input validation with Zod
- ✅ In-memory database
- ✅ Development and production modes
- ✅ Comprehensive test suite
- ✅ Horizontal scaling with Node.js Cluster API and round-robin load balancing
- ✅ Error handling and validation

## Technical Stack

- **Runtime**: Node.js 24.10.0+
- **Framework**: Fastify 4.x
- **Language**: TypeScript
- **Validation**: Zod
- **Testing**: Jest with ts-jest
- **Dev Tools**: tsx, nodemon

## Setup

### Prerequisites

- Node.js 24.10.0 or higher

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration if needed

## Running the Application

### Development Mode

Run the application with auto-reload on file changes:
```bash
npm run start:dev
```

### Production Mode

Build and run the application:
```bash
npm run start:prod
```

### Horizontal Scaling Mode

Run multiple instances with load balancing:
```bash
npm run start:multi
```

This will:
- Start a load balancer on the configured PORT (default: 4000)
- Start worker processes on PORT+1, PORT+2, etc. (one for each available CPU core minus 1)
- Use round-robin algorithm to distribute requests across workers
- Maintain consistent database state across all workers

## API Endpoints

### Get All Products
```
GET /api/products
```
**Response**: `200 OK` with array of products

### Get Product by ID
```
GET /api/products/:productId
```
**Response**: 
- `200 OK` with product object
- `400 Bad Request` if productId is not a valid UUID
- `404 Not Found` if product doesn't exist

### Create Product
```
POST /api/products
Content-Type: application/json

{
  "name": "string (required)",
  "description": "string (required)",
  "price": "number (required, must be > 0)",
  "category": "string (required)",
  "inStock": "boolean (required)"
}
```
**Response**: 
- `201 Created` with created product object
- `400 Bad Request` if validation fails

### Update Product
```
PUT /api/products/:productId
Content-Type: application/json

{
  "name": "string (optional)",
  "description": "string (optional)",
  "price": "number (optional, must be > 0)",
  "category": "string (optional)",
  "inStock": "boolean (optional)"
}
```
**Response**: 
- `200 OK` with updated product object
- `400 Bad Request` if productId is invalid UUID or validation fails
- `404 Not Found` if product doesn't exist

### Delete Product
```
DELETE /api/products/:productId
```
**Response**: 
- `204 No Content` if deleted successfully
- `400 Bad Request` if productId is not a valid UUID
- `404 Not Found` if product doesn't exist

## Product Schema

```typescript
interface Product {
  id: string;              // UUID, generated server-side
  name: string;            // Required, non-empty
  description: string;     // Required, non-empty
  price: number;           // Required, must be > 0
  category: string;        // Required, non-empty (e.g., "electronics")
  inStock: boolean;        // Required
}
```

## Testing

Run the test suite:
```bash
npm test
```

Tests cover:
- All CRUD operations
- Input validation
- Error handling
- UUID validation
- Complete workflow scenarios
- Non-existent endpoint handling

## Scripts

```json
{
  "start:dev": "Run with hot reload (development)",
  "start:prod": "Build and run optimized version (production)",
  "start:multi": "Run with clustering and load balancing",
  "build": "Compile TypeScript to JavaScript",
  "test": "Run Jest test suite",
  "lint": "Run ESLint",
  "format": "Format code with Prettier"
}
```

## Environment Variables

- `PORT` (default: 4000) - Port on which the application listens

## Database

The application uses an in-memory database that:
- Stores products during runtime
- Is shared across all worker processes in clustering mode
- Resets when the application restarts

## Error Handling

The API returns appropriate HTTP status codes and error messages:
- `400 Bad Request` - Invalid input or malformed requests
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server-side errors

## Horizontal Scaling Details

When running with `npm run start:multi`:

1. **Load Balancer**: Listens on configured PORT (e.g., 4000)
2. **Workers**: Each worker listens on PORT+1 to PORT+n
3. **Distribution**: Requests are distributed using round-robin algorithm
4. **State**: Database state is consistent across all workers
5. **Auto-recovery**: Failed workers are automatically restarted

### Example with PORT=4000 and 3 available CPUs:

```
Load Balancer: localhost:4000
Worker 1: localhost:4001
Worker 2: localhost:4002
```

Request flow:
1. User sends request to localhost:4000/api/products
2. Load balancer forwards to localhost:4001 (round-robin)
3. Next request goes to localhost:4002
4. Next request goes to localhost:4001 again
5. And so on...

## License

ISC
