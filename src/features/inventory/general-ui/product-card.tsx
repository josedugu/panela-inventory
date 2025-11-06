"use client";

import { Edit, Eye, MoreVertical, Trash2 } from "lucide-react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/components/ui/utils";
import { StockBadge, type StockStatus } from "./stock-badge";

export interface Product {
  id: string;
  name: string;
  imei: string;
  category: string;
  price: number;
  stock: number;
  stockStatus: StockStatus;
  image?: string;
}

interface ProductCardProps {
  product: Product;
  variant?: "grid" | "list";
  onView?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  className?: string;
}

export function ProductCard({
  product,
  variant = "grid",
  onView,
  onEdit,
  onDelete,
  className,
}: ProductCardProps) {
  if (variant === "list") {
    return (
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-surface-2 rounded-lg overflow-hidden shrink-0">
              {product.image && (
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{product.name}</h3>
              <p className="text-sm text-text-secondary">
                IMEI: {product.imei}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-text-secondary">{product.category}</p>
            </div>

            <div className="text-right min-w-[100px]">
              <p className="font-semibold">${product.price.toFixed(2)}</p>
            </div>

            <div className="min-w-[120px]">
              <StockBadge
                status={product.stockStatus}
                quantity={product.stock}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView?.(product)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(product)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(product)}
                  className="text-error"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="p-0">
        <div className="aspect-square bg-surface-2 rounded-t-lg overflow-hidden relative">
          {product.image && (
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView?.(product)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(product)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(product)}
                  className="text-error"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-medium line-clamp-1">{product.name}</h3>
          <p className="text-sm text-text-secondary font-mono">
            {product.imei}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">
            {product.category}
          </span>
          <span className="font-semibold">${product.price.toFixed(2)}</span>
        </div>

        <StockBadge status={product.stockStatus} quantity={product.stock} />
      </CardContent>
    </Card>
  );
}
