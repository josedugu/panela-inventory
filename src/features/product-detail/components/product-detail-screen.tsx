"use client";

import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Edit,
  Package,
  Trash2,
  User,
} from "lucide-react";
import Image from "next/image";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockBadge, StockLevelIndicator } from "@/features/inventory";

const mockStockHistory = [
  { date: "Jan 1", stock: 120 },
  { date: "Jan 8", stock: 95 },
  { date: "Jan 15", stock: 110 },
  { date: "Jan 22", stock: 85 },
  { date: "Jan 29", stock: 67 },
  { date: "Feb 5", stock: 78 },
  { date: "Feb 12", stock: 45 },
];

const productImages = [
  "https://images.unsplash.com/photo-1592286927505-b0c8e0d16f3f?w=600",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600",
  "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600",
];

export function ProductDetailScreen({ onBack }: { onBack?: () => void }) {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1>iPhone 15 Pro Max</h1>
            <p className="text-text-secondary mt-1 font-mono">
              SKU: IPH-15PM-256-BLK
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" className="text-error">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Product Images and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card>
            <CardContent className="p-6">
              <div className="aspect-video bg-surface-2 rounded-lg overflow-hidden mb-4 relative">
                <Image
                  src={productImages[0]}
                  alt="Product main view"
                  fill
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {productImages.map((image) => (
                  <div
                    key={image}
                    className="aspect-square bg-surface-2 rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all relative"
                  >
                    <Image
                      src={image}
                      alt="Product thumbnail"
                      fill
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Additional Info */}
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="description">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="specifications">
                    Specifications
                  </TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="space-y-4 mt-4">
                  <div>
                    <h3>Product Description</h3>
                    <p className="text-text-secondary mt-2">
                      The iPhone 15 Pro Max features a stunning titanium design,
                      powerful A17 Pro chip, and an advanced camera system. With
                      256GB storage, you'll have plenty of space for all your
                      photos, videos, and apps.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4>Key Features</h4>
                    <ul className="mt-2 space-y-1 text-text-secondary">
                      <li>• 6.7-inch Super Retina XDR display</li>
                      <li>• A17 Pro chip with 6-core GPU</li>
                      <li>• Pro camera system (48MP Main, 12MP Ultra Wide)</li>
                      <li>• Up to 29 hours video playback</li>
                      <li>• Titanium design with textured matte glass back</li>
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="specifications" className="space-y-3 mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-text-secondary">Brand</p>
                      <p className="font-medium">Apple</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Model</p>
                      <p className="font-medium">iPhone 15 Pro Max</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Storage</p>
                      <p className="font-medium">256GB</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Color</p>
                      <p className="font-medium">Black Titanium</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Display</p>
                      <p className="font-medium">6.7" OLED</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Weight</p>
                      <p className="font-medium">221g</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="history" className="space-y-4 mt-4">
                  <div>
                    <h4>Stock Level History</h4>
                    <div className="mt-4">
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={mockStockHistory}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--border)"
                          />
                          <XAxis
                            dataKey="date"
                            stroke="var(--text-secondary)"
                            fontSize={12}
                          />
                          <YAxis stroke="var(--text-secondary)" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "var(--card)",
                              border: "1px solid var(--border)",
                              borderRadius: "var(--radius-md)",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="stock"
                            stroke="var(--chart-1)"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h4>Recent Updates</h4>
                    <div className="space-y-3 mt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">
                          Stock adjusted
                        </span>
                        <span>Feb 12, 2025</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">
                          Price updated
                        </span>
                        <span>Feb 8, 2025</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">
                          Product added
                        </span>
                        <span>Jan 1, 2025</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Info */}
        <div className="space-y-6">
          {/* Price & Stock */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-text-secondary mb-1">Price</p>
                <p className="text-3xl font-semibold">$1,199.00</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-text-secondary mb-2">Stock Status</p>
                <StockBadge status="in-stock" quantity={45} />
              </div>
              <Separator />
              <div>
                <p className="text-sm text-text-secondary mb-3">Stock Level</p>
                <StockLevelIndicator current={45} max={150} />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <Button className="w-full">Adjust Stock</Button>
                <Button variant="outline" className="w-full">
                  Reorder
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Categories & Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Categories & Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-text-secondary mb-2">Category</p>
                <Badge variant="secondary">Smartphones</Badge>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-text-secondary mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Premium</Badge>
                  <Badge variant="outline">iPhone</Badge>
                  <Badge variant="outline">Apple</Badge>
                  <Badge variant="outline">5G</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-surface-2 rounded-lg">
                  <Package className="h-5 w-5 text-text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-secondary">Total Sold</p>
                  <p className="font-semibold">234 units</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-surface-2 rounded-lg">
                  <DollarSign className="h-5 w-5 text-text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-secondary">Revenue</p>
                  <p className="font-semibold">$280,566</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-surface-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-secondary">Added</p>
                  <p className="font-semibold">Jan 1, 2025</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-surface-2 rounded-lg">
                  <User className="h-5 w-5 text-text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-secondary">Supplier</p>
                  <p className="font-semibold">TechCorp Inc.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
