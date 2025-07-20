'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Upload, ExternalLink } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string;
}

export default function SubmitProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    website: '',
    pricing: 'Free',
    categoryId: '',
    features: [''],
    specifications: [{ key: '', value: '' }],
    pricingDetails: [{ tier: '', price: '', description: '' }],
    images: [{ url: '', alt: '' }],
  });
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch user, categories, and tags
  const { data: user } = useSWR('/api/user', fetcher);
  const { data: categoriesData } = useSWR('/api/categories', fetcher);
  const { data: tagsData } = useSWR('/api/tags', fetcher);

  const categories: Category[] = categoriesData?.categories || [];
  const tags: Tag[] = tagsData?.tags || [];

  // Redirect if not logged in
  useEffect(() => {
    if (user === null) {
      router.push('/sign-in?redirect=/products/submit');
    }
  }, [user, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].map((item: any, i: number) => 
        i === index ? value : item
      )
    }));
  };

  const handleObjectArrayChange = (field: string, index: number, key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].map((item: any, i: number) => 
        i === index ? { ...item, [key]: value } : item
      )
    }));
  };

  const addArrayItem = (field: string, defaultValue: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field as keyof typeof prev], defaultValue]
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].filter((_: any, i: number) => i !== index)
    }));
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name.trim() || !formData.description.trim() || !formData.categoryId) {
        throw new Error('Please fill in all required fields');
      }

      // Clean up data
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        shortDescription: formData.shortDescription.trim() || null,
        website: formData.website.trim() || null,
        pricing: formData.pricing,
        categoryId: parseInt(formData.categoryId),
        features: formData.features.filter(f => f.trim() !== ''),
        specifications: Object.fromEntries(
          formData.specifications
            .filter(spec => spec.key.trim() && spec.value.trim())
            .map(spec => [spec.key.trim(), spec.value.trim()])
        ),
        pricingDetails: Object.fromEntries(
          formData.pricingDetails
            .filter(tier => tier.tier.trim() && tier.price.trim())
            .map(tier => [tier.tier.trim(), tier.price.trim() + (tier.description ? ` - ${tier.description}` : '')])
        ),
        images: formData.images.filter(img => img.url.trim()),
        tagIds: selectedTags,
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit product');
      }

      setSuccess(true);
      // Redirect to the new product page after a short delay
      setTimeout(() => {
        router.push('/products');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking auth
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your AI product has been submitted for review. It will be published once approved.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to products page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Submit New AI Product
            </h1>
            <p className="text-lg text-gray-600">
              Share a new AI tool with the community. Help others discover innovative AI solutions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., ChatGPT, GitHub Copilot"
                  required
                />
              </div>

              <div>
                <Label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </Label>
                <div className="relative">
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://example.com"
                    className="pr-10"
                  />
                  <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </Label>
              <Input
                id="shortDescription"
                type="text"
                value={formData.shortDescription}
                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                placeholder="Brief one-line description"
                maxLength={200}
              />
            </div>

            <div>
              <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description *
              </Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide a detailed description of the AI product, its capabilities, and use cases..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Category and Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </Label>
                <select
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="pricing" className="block text-sm font-medium text-gray-700 mb-2">
                  Pricing Model *
                </Label>
                <select
                  id="pricing"
                  value={formData.pricing}
                  onChange={(e) => handleInputChange('pricing', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="Free">Free</option>
                  <option value="Freemium">Freemium</option>
                  <option value="Paid">Paid</option>
                  <option value="Subscription">Subscription</option>
                  <option value="One-time Purchase">One-time Purchase</option>
                </select>
              </div>
            </div>

            {/* Features */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Key Features
              </Label>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <Input
                    type="text"
                    value={feature}
                    onChange={(e) => handleArrayChange('features', index, e.target.value)}
                    placeholder="Enter a key feature"
                    className="flex-1"
                  />
                  {formData.features.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('features', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('features', '')}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Feature
              </Button>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </Label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        selectedTags.includes(tag.id)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Images */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images
              </Label>
              {formData.images.map((image, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
                  <div>
                    <Label className="block text-xs font-medium text-gray-600 mb-1">
                      Image URL
                    </Label>
                    <Input
                      type="url"
                      value={image.url}
                      onChange={(e) => handleObjectArrayChange('images', index, 'url', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <Label className="block text-xs font-medium text-gray-600 mb-1">
                        Alt Text
                      </Label>
                      <Input
                        type="text"
                        value={image.alt}
                        onChange={(e) => handleObjectArrayChange('images', index, 'alt', e.target.value)}
                        placeholder="Describe the image"
                      />
                    </div>
                    {formData.images.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('images', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('images', { url: '', alt: '' })}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Image
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-600 text-sm">{error}</div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Product'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}