'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUploader } from './image-uploader';
import { createProduct, updateProduct } from '@/actions/admin-products';

import type { Category } from '@prisma/client';

// Match the serialized product type from server actions
interface SerializedProduct {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  featured: boolean;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  category: Category;
}

interface ProductFormProps {
  product?: SerializedProduct;
  categories: Category[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: product?.title || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product?.price ? Number(product.price) : 0,
    stock: product?.stock || 0,
    categoryId: product?.categoryId || '',
    images: product?.images || [],
    featured: product?.featured || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = product
        ? await updateProduct(product.id, formData)
        : await createProduct(formData);

      if (result.success) {
        router.push('/admin/products');
        router.refresh();
      } else {
        setError(result.error || 'Failed to save product');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: product ? prev.slug : generateSlug(title),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Title */}
        <div>
          <Label htmlFor="title">Product Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            placeholder="Enter product title"
            className="mt-1"
          />
        </div>

        {/* Slug */}
        <div>
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) =>
              setFormData({ ...formData, slug: e.target.value })
            }
            required
            placeholder="product-slug"
            className="mt-1"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Enter product description"
          rows={5}
          className="mt-1"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Price */}
        <div>
          <Label htmlFor="price">Price ($) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
            }
            required
            placeholder="0.00"
            className="mt-1"
          />
        </div>

        {/* Stock */}
        <div>
          <Label htmlFor="stock">Stock Quantity *</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
            }
            required
            placeholder="0"
            className="mt-1"
          />
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) =>
              setFormData({ ...formData, categoryId: value })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Featured */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="featured"
          checked={formData.featured}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, featured: checked as boolean })
          }
        />
        <Label htmlFor="featured" className="cursor-pointer">
          Mark as featured product
        </Label>
      </div>

      {/* Images */}
      <div>
        <Label>Product Images</Label>
        <ImageUploader
          images={formData.images}
          onChange={(images) => setFormData({ ...formData, images })}
        />
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>{product ? 'Update Product' : 'Create Product'}</>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
