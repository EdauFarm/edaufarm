import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Jumia E-Commerce API',
      version: '1.0.0',
      description: 'Complete API documentation for Jumia E-Commerce Platform - Kenya',
      contact: {
        name: 'Jumia Kenya',
        url: 'https://jumia.loopnet.tech',
      },
    },
    servers: [
      {
        url: 'https://jumia.loopnet.tech/api',
        description: 'Production Server',
      },
      {
        url: 'http://localhost:3000/api',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            title: { type: 'string', example: 'Samsung Galaxy A54' },
            description: { type: 'string', example: 'Latest Samsung smartphone with amazing features' },
            price: { type: 'number', example: 45000 },
            originalPrice: { type: 'number', example: 55000 },
            category: { type: 'string', example: 'Electronics' },
            images: { type: 'array', items: { type: 'string' }, example: ['https://example.com/image1.jpg'] },
            stock: { type: 'number', example: 50 },
            featured: { type: 'boolean', example: true },
            active: { type: 'boolean', example: true },
            rating: {
              type: 'object',
              properties: {
                average: { type: 'number', example: 4.5 },
                count: { type: 'number', example: 128 },
              },
            },
            tags: { type: 'array', items: { type: 'string' }, example: ['smartphone', 'samsung'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439013' },
            user: { type: 'string', example: '507f1f77bcf86cd799439014' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { type: 'string', example: '507f1f77bcf86cd799439011' },
                  quantity: { type: 'number', example: 2 },
                  price: { type: 'number', example: 45000 },
                },
              },
            },
            totalAmount: { type: 'number', example: 90000 },
            status: { type: 'string', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], example: 'pending' },
            paymentMethod: { type: 'string', example: 'mpesa' },
            mpesaCode: { type: 'string', example: 'UAHJ643NOC' },
            mpesaPhone: { type: 'string', example: '+254712345678' },
            mpesaVerified: { type: 'boolean', example: false },
            shippingAddress: {
              type: 'object',
              properties: {
                fullName: { type: 'string', example: 'John Doe' },
                phone: { type: 'string', example: '+254712345678' },
                address: { type: 'string', example: '123 Kenyatta Avenue' },
                city: { type: 'string', example: 'Nairobi' },
                county: { type: 'string', example: 'Nairobi' },
                postalCode: { type: 'string', example: '00100' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439014' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            phone: { type: 'string', example: '+254712345678' },
            emailVerified: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
          },
        },
      },
    },
    tags: [
      { name: 'Products', description: 'Product management endpoints' },
      { name: 'Orders', description: 'Order management endpoints' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Cart', description: 'Shopping cart endpoints' },
      { name: 'Admin', description: 'Admin-only endpoints' },
      { name: 'Email', description: 'Email and OTP endpoints' },
    ],
  },
  apis: ['./app/api/**/*.ts'], // Path to API routes with JSDoc annotations
};

export const swaggerSpec = swaggerJsdoc(options);
