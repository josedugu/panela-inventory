"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { StockBadge } from "../inventory/stock-badge";
import { StockLevelIndicator } from "../inventory/stock-level-indicator";
import { StatCard } from "../inventory/stat-card";
import { Switch } from "../ui/switch";
import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Slider } from "../ui/slider";
import { Progress } from "../ui/progress";
import { Separator } from "../ui/separator";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Skeleton } from "../ui/skeleton";
import {
  Package,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner@2.0.3";

export function ComponentShowcase() {
  return (
    <div className="space-y-8 p-4 lg:p-6">
      <div>
        <h1>Component Showcase</h1>
        <p className="text-text-secondary mt-1">
          Visual reference for all design system components
        </p>
      </div>

      {/* Buttons Section */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>All button variants and states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="mb-3">Variants</h4>
            <div className="flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="mb-3">Sizes</h4>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <Package className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="mb-3">States</h4>
            <div className="flex flex-wrap gap-3">
              <Button>Default</Button>
              <Button disabled>Disabled</Button>
              <Button>
                <Package className="mr-2 h-4 w-4" />
                With Icon
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Status indicators and labels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="mb-3">Standard Badges</h4>
            <div className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="mb-3">Stock Badges</h4>
            <div className="flex flex-wrap gap-3">
              <StockBadge status="in-stock" quantity={125} />
              <StockBadge status="low-stock" quantity={8} />
              <StockBadge status="out-of-stock" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Components */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Components</CardTitle>
          <CardDescription>Domain-specific components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="mb-3">Stat Cards</h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Total Products"
                value="1,284"
                change={{ value: 12.5, label: "from last month" }}
                icon={Package}
              />
              <StatCard
                title="Low Stock"
                value="23"
                change={{ value: -15.3, label: "from last week" }}
                icon={AlertCircle}
              />
              <StatCard title="Out of Stock" value="5" icon={AlertTriangle} />
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="mb-3">Stock Level Indicators</h4>
            <div className="space-y-4 max-w-md">
              <div>
                <p className="text-sm text-text-secondary mb-2">In Stock</p>
                <StockLevelIndicator current={125} max={150} />
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-2">Low Stock</p>
                <StockLevelIndicator current={15} max={150} />
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-2">Out of Stock</p>
                <StockLevelIndicator current={0} max={150} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Form Inputs</CardTitle>
          <CardDescription>Input fields and controls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="text-input">Text Input</Label>
              <Input id="text-input" placeholder="Enter text..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="number-input">Number Input</Label>
              <Input id="number-input" type="number" placeholder="0" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="select">Select Dropdown</Label>
              <Select>
                <SelectTrigger id="select">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Option 1</SelectItem>
                  <SelectItem value="option2">Option 2</SelectItem>
                  <SelectItem value="option3">Option 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="textarea">Textarea</Label>
              <Textarea
                id="textarea"
                placeholder="Enter multiple lines..."
                rows={3}
              />
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="mb-3">Checkboxes & Radio</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox id="check1" />
                <Label htmlFor="check1">Checkbox option 1</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="check2" defaultChecked />
                <Label htmlFor="check2">Checkbox option 2 (checked)</Label>
              </div>

              <Separator className="my-4" />

              <RadioGroup defaultValue="radio1">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="radio1" id="radio1" />
                  <Label htmlFor="radio1">Radio option 1</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="radio2" id="radio2" />
                  <Label htmlFor="radio2">Radio option 2</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="mb-3">Switches</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="switch1">Enable notifications</Label>
                <Switch id="switch1" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="switch2">Dark mode</Label>
                <Switch id="switch2" defaultChecked />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4>Slider</h4>
            <Slider defaultValue={[50]} max={100} step={1} />
          </div>
        </CardContent>
      </Card>

      {/* Alerts & Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Alerts & Notifications</CardTitle>
          <CardDescription>Feedback and messaging components</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>
                This is an informational message for general updates.
              </AlertDescription>
            </Alert>

            <Alert className="border-success-border bg-success-light">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertTitle className="text-success">Success</AlertTitle>
              <AlertDescription className="text-success-foreground">
                Your changes have been saved successfully.
              </AlertDescription>
            </Alert>

            <Alert className="border-warning-border bg-warning-light">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <AlertTitle className="text-warning">Warning</AlertTitle>
              <AlertDescription className="text-warning-foreground">
                Some items are running low on stock.
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to update product. Please try again.
              </AlertDescription>
            </Alert>
          </div>

          <Separator />

          <div>
            <h4 className="mb-3">Toast Notifications</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("Product added successfully")}
              >
                Success Toast
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.error("Failed to delete product")}
              >
                Error Toast
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("Stock level updated")}
              >
                Info Toast
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast("Simple notification")}
              >
                Default Toast
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress & Loading */}
      <Card>
        <CardHeader>
          <CardTitle>Progress & Loading States</CardTitle>
          <CardDescription>Loading indicators and progress bars</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h4>Progress Bars</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-text-secondary mb-2">25% Complete</p>
                <Progress value={25} />
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-2">60% Complete</p>
                <Progress value={60} />
              </div>
              <div>
                <p className="text-sm text-text-secondary mb-2">100% Complete</p>
                <Progress value={100} />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4>Skeleton Loaders</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>Text styles and hierarchy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h1>Display Heading (H1)</h1>
            <h2>Section Heading (H2)</h2>
            <h3>Subsection Heading (H3)</h3>
            <h4>Component Heading (H4)</h4>
          </div>

          <Separator />

          <div className="space-y-2">
            <p>Body text: This is regular paragraph text using the default font size and weight.</p>
            <p className="text-text-secondary">
              Secondary text: Used for supporting information with reduced emphasis.
            </p>
            <p className="text-text-tertiary">
              Tertiary text: Used for subtle details with minimal emphasis.
            </p>
            <p className="text-text-disabled">
              Disabled text: Used for inactive or disabled content.
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="font-mono">SKU-12345-XYZ (Monospace for codes)</p>
            <p className="text-sm">Small text for captions and labels</p>
            <p className="text-xs">Extra small text for fine print</p>
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Color System</CardTitle>
          <CardDescription>Semantic color palette</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="mb-3">Semantic Colors</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="h-16 rounded-lg bg-primary mb-2" />
                <p className="text-sm font-medium">Primary</p>
              </div>
              <div>
                <div className="h-16 rounded-lg bg-success mb-2" />
                <p className="text-sm font-medium">Success</p>
              </div>
              <div>
                <div className="h-16 rounded-lg bg-warning mb-2" />
                <p className="text-sm font-medium">Warning</p>
              </div>
              <div>
                <div className="h-16 rounded-lg bg-error mb-2" />
                <p className="text-sm font-medium">Error</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="mb-3">Surface Layers</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="h-16 rounded-lg bg-surface-1 border border-border mb-2" />
                <p className="text-sm font-medium">Surface 1</p>
              </div>
              <div>
                <div className="h-16 rounded-lg bg-surface-2 border border-border mb-2" />
                <p className="text-sm font-medium">Surface 2</p>
              </div>
              <div>
                <div className="h-16 rounded-lg bg-surface-3 border border-border mb-2" />
                <p className="text-sm font-medium">Surface 3</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spacing */}
      <Card>
        <CardHeader>
          <CardTitle>Spacing System</CardTitle>
          <CardDescription>8px grid-based spacing scale</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[4, 8, 12, 16, 24, 32, 48, 64].map((size) => (
            <div key={size} className="flex items-center gap-4">
              <div
                className="bg-primary h-4"
                style={{ width: `${size}px` }}
              />
              <span className="text-sm font-mono">{size}px</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
