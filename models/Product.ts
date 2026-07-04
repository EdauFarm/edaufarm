import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  title_fr?: string;
  title_ar?: string;
  description: string;
  description_fr?: string;
  description_ar?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  brand?: string;
  sku: string;
  stock: number;
  variants?: {
    name: string;
    options: string[];
    price?: number;
    stock?: number;
  }[];
  specifications?: {
    key: string;
    value: string;
  }[];
  rating: {
    average: number;
    count: number;
  };
  tags: string[];
  featured: boolean;
  active: boolean;
  buybackEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a product title'],
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    title_fr: {
      type: String,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    title_ar: {
      type: String,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
    },
    description_fr: {
      type: String,
    },
    description_ar: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      min: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
    },
    subcategory: {
      type: String,
    },
    brand: {
      type: String,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    variants: [
      {
        name: String,
        options: [String],
        price: Number,
        stock: Number,
      },
    ],
    specifications: [
      {
        key: String,
        value: String,
      },
    ],
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    buybackEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.index({ title: 'text', description: 'text', tags: 'text', title_fr: 'text', title_ar: 'text', description_fr: 'text', description_ar: 'text' });
ProductSchema.index({ category: 1, subcategory: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ featured: 1, active: 1 });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
