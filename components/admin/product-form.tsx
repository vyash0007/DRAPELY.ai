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
import { createProduct, updateProduct, SizeStockData } from '@/actions/admin-products';

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
  fit: string | null;
  composition: string | null;
  sizes: string[];
  metadata: Record<string, string> | null;
  sizeStocks: Array<{
    id: string;
    size: string;
    quantity: number;
    productId: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  category: Category;
}

interface ProductFormProps {
  product?: SerializedProduct;
  categories: Category[];
}

// Generate a temporary ID for new products (similar to cuid format)
function generateTempId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `cl${timestamp}${random}`;
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Generate temp ID for new products, use existing ID for updates
  const [productId] = useState(() => product?.id || generateTempId());

  const [formData, setFormData] = useState({
    title: product?.title || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product?.price ? Number(product.price) : 0,
    stock: product?.stock || 0,
    categoryId: product?.categoryId || '',
    images: product?.images || [],
    featured: product?.featured || false,
    fit: product?.fit || '',
    composition: product?.composition || '',
    sizes: product?.sizes || [],
    metadata: product?.metadata || {},
    sizeStocks: product?.sizeStocks?.map(ss => ({
      size: ss.size,
      quantity: ss.quantity,
    })) || [],
  });

  // Calculate total stock from size stocks
  const totalStock = formData.sizeStocks.reduce((sum, sizeStock) => sum + sizeStock.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Filter out empty metadata keys
      const cleanedMetadata: Record<string, string> = {};
      Object.entries(formData.metadata).forEach(([key, value]) => {
        if (key.trim() && value.trim()) {
          cleanedMetadata[key.trim()] = value.trim();
        }
      });

      // Use calculated total stock instead of manual input
      const submitData = {
        ...formData,
        stock: totalStock,
        metadata: cleanedMetadata,
        // For new products, include the temp ID so images match
        ...(product ? {} : { id: productId }),
      };

      const result = product
        ? await updateProduct(product.id, submitData)
        : await createProduct(submitData);

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

        {/* Stock (Auto-calculated) */}
        <div>
          <Label htmlFor="stock">
            Stock Quantity *
            <span className="ml-2 text-xs text-gray-500 font-normal">
              (Auto-calculated from sizes)
            </span>
          </Label>
          <Input
            id="stock"
            type="number"
            value={totalStock}
            readOnly
            disabled
            className="mt-1 bg-gray-50 cursor-not-allowed"
            title="This value is automatically calculated from the sum of all size stock quantities"
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Fit */}
        <div>
          <Label htmlFor="fit">Fit</Label>
          <Input
            id="fit"
            value={formData.fit}
            onChange={(e) =>
              setFormData({ ...formData, fit: e.target.value })
            }
            placeholder="e.g., Oversize, Slim Fit, Regular"
            className="mt-1"
          />
        </div>

        {/* Composition */}
        <div>
          <Label htmlFor="composition">Composition</Label>
          <Input
            id="composition"
            value={formData.composition}
            onChange={(e) =>
              setFormData({ ...formData, composition: e.target.value })
            }
            placeholder="e.g., Linen, Cotton, Polyester"
            className="mt-1"
          />
        </div>
      </div>

      {/* Sizes & Stock */}
      <div>
        <Label htmlFor="sizes">Available Sizes & Stock Quantity</Label>
        <div className="mt-2 space-y-3">
          <div className="text-sm text-gray-500 mb-2">
            Select sizes and enter stock quantity for each:
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => {
              const sizeStock = formData.sizeStocks.find(s => s.size === size);
              const isSelected = formData.sizes.includes(size);

              return (
                <div key={size} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`size-${size}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            sizes: [...formData.sizes, size],
                            sizeStocks: [...formData.sizeStocks, { size, quantity: 0 }],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            sizes: formData.sizes.filter((s) => s !== size),
                            sizeStocks: formData.sizeStocks.filter((s) => s.size !== size),
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`size-${size}`} className="cursor-pointer font-medium">
                      {size}
                    </Label>
                  </div>
                  {isSelected && (
                    <div>
                      <Label htmlFor={`stock-${size}`} className="text-xs text-gray-600">
                        Stock Qty
                      </Label>
                      <Input
                        id={`stock-${size}`}
                        type="number"
                        min="0"
                        value={sizeStock?.quantity || 0}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value) || 0;
                          setFormData({
                            ...formData,
                            sizeStocks: formData.sizeStocks.map(s =>
                              s.size === size ? { ...s, quantity: newQuantity } : s
                            ),
                          });
                        }}
                        placeholder="0"
                        className="mt-1 h-9"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Images */}
      <div>
        <Label>Product Images</Label>
        <ImageUploader
          images={formData.images}
          onChange={(images) => setFormData({ ...formData, images })}
          categorySlug={categories.find(c => c.id === formData.categoryId)?.slug}
          productId={productId}
        />
      </div>

      {/* Metadata */}
      <div>
        <Label>Product Metadata (Key-Value Pairs)</Label>
        <div className="mt-2 text-sm text-gray-500">
          Add custom metadata as key-value pairs (e.g., Brand, Material, Care Instructions, etc.)
        </div>
        <div className="mt-3 border-2 border-gray-200 rounded-lg p-6">
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  ...formData,
                  metadata: { ...formData.metadata, '': '' },
                });
              }}
              className="w-full border-2 border-gray-900 text-gray-900 hover:bg-gray-100 hover:border-gray-900 hover:text-gray-900 font-medium bg-white"
            >
              + Add Metadata Field
            </Button>

            {Object.keys(formData.metadata).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No metadata added. Click &quot;Add Metadata Field&quot; to add key-value pairs.
              </p>
            ) : (
              <div className="space-y-3 mt-4">
                {Object.entries(formData.metadata).map(([key, value], index) => (
                  <div key={index} className="grid grid-cols-2 gap-3 items-end">
                    <div>
                      <Label htmlFor={`meta-key-${index}`} className="text-xs text-gray-600">
                        Key
                      </Label>
                      <Input
                        id={`meta-key-${index}`}
                        value={key}
                        onChange={(e) => {
                          const newMetadata = { ...formData.metadata };
                          delete newMetadata[key];
                          newMetadata[e.target.value] = value;
                          setFormData({ ...formData, metadata: newMetadata });
                        }}
                        placeholder="e.g., Brand"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`meta-value-${index}`} className="text-xs text-gray-600">
                        Value
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id={`meta-value-${index}`}
                          value={value}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              metadata: { ...formData.metadata, [key]: e.target.value },
                            });
                          }}
                          placeholder="e.g., Nike"
                          className="mt-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newMetadata = { ...formData.metadata };
                            delete newMetadata[key];
                            setFormData({ ...formData, metadata: newMetadata });
                          }}
                          className="mt-1 shrink-0"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
