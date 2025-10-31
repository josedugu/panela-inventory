"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export function StyleGuide() {
  return (
    <div className="space-y-8 p-4 lg:p-6 max-w-7xl mx-auto">
      <div>
        <h1>Design System Style Guide</h1>
        <p className="text-text-secondary mt-1">
          Visual reference for design tokens, colors, typography, and spacing
        </p>
      </div>

      {/* Color Palette */}
      <Card>
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
          <CardDescription>Complete semantic color system with light and dark variants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Brand Colors */}
          <div>
            <h3 className="mb-4">Brand & Semantic Colors</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm font-medium mb-3">Primary</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-primary border border-border" />
                    <div>
                      <p className="text-sm font-medium">Primary</p>
                      <p className="text-xs text-text-secondary font-mono">--primary</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-primary-foreground border border-border" />
                    <div>
                      <p className="text-sm font-medium">Primary Foreground</p>
                      <p className="text-xs text-text-secondary font-mono">--primary-foreground</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium mb-3">Success</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-success border border-border" />
                    <div>
                      <p className="text-sm font-medium">Success</p>
                      <p className="text-xs text-text-secondary font-mono">--success</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-success-light border border-success-border" />
                    <div>
                      <p className="text-sm font-medium">Success Light</p>
                      <p className="text-xs text-text-secondary font-mono">--success-light</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium mb-3">Warning</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-warning border border-border" />
                    <div>
                      <p className="text-sm font-medium">Warning</p>
                      <p className="text-xs text-text-secondary font-mono">--warning</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-warning-light border border-warning-border" />
                    <div>
                      <p className="text-sm font-medium">Warning Light</p>
                      <p className="text-xs text-text-secondary font-mono">--warning-light</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium mb-3">Error</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-error border border-border" />
                    <div>
                      <p className="text-sm font-medium">Error</p>
                      <p className="text-xs text-text-secondary font-mono">--error</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-error-light border border-error-border" />
                    <div>
                      <p className="text-sm font-medium">Error Light</p>
                      <p className="text-xs text-text-secondary font-mono">--error-light</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium mb-3">Info</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-info border border-border" />
                    <div>
                      <p className="text-sm font-medium">Info</p>
                      <p className="text-xs text-text-secondary font-mono">--info</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-info-light border border-info-border" />
                    <div>
                      <p className="text-sm font-medium">Info Light</p>
                      <p className="text-xs text-text-secondary font-mono">--info-light</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Surface Layers */}
          <div>
            <h3 className="mb-4">Surface Layers</h3>
            <p className="text-sm text-text-secondary mb-4">
              Three-tier elevation system for depth hierarchy
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-6 rounded-lg bg-surface-1 border border-border">
                <p className="font-medium mb-1">Surface 1</p>
                <p className="text-sm text-text-secondary mb-2">Base surface</p>
                <p className="text-xs font-mono text-text-tertiary">--surface-1</p>
              </div>
              <div className="p-6 rounded-lg bg-surface-2 border border-border">
                <p className="font-medium mb-1">Surface 2</p>
                <p className="text-sm text-text-secondary mb-2">Elevated +1</p>
                <p className="text-xs font-mono text-text-tertiary">--surface-2</p>
              </div>
              <div className="p-6 rounded-lg bg-surface-3 border border-border">
                <p className="font-medium mb-1">Surface 3</p>
                <p className="text-sm text-text-secondary mb-2">Elevated +2</p>
                <p className="text-xs font-mono text-text-tertiary">--surface-3</p>
              </div>
            </div>
          </div>

          {/* Text Hierarchy */}
          <div>
            <h3 className="mb-4">Text Color Hierarchy</h3>
            <div className="space-y-3 bg-surface-2 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-text-primary">Primary text - Main content</p>
                <span className="text-xs font-mono text-text-secondary">--text-primary</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-text-secondary">Secondary text - Supporting content</p>
                <span className="text-xs font-mono text-text-secondary">--text-secondary</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-text-tertiary">Tertiary text - Subtle details</p>
                <span className="text-xs font-mono text-text-secondary">--text-tertiary</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-text-disabled">Disabled text - Inactive content</p>
                <span className="text-xs font-mono text-text-secondary">--text-disabled</span>
              </div>
            </div>
          </div>

          {/* Border Variants */}
          <div>
            <h3 className="mb-4">Border System</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-6 rounded-lg bg-surface-2 border border-border-subtle">
                <p className="font-medium mb-1">Subtle</p>
                <p className="text-xs font-mono text-text-tertiary">border-border-subtle</p>
              </div>
              <div className="p-6 rounded-lg bg-surface-2 border border-border">
                <p className="font-medium mb-1">Default</p>
                <p className="text-xs font-mono text-text-tertiary">border-border</p>
              </div>
              <div className="p-6 rounded-lg bg-surface-2 border-2 border-border-strong">
                <p className="font-medium mb-1">Strong</p>
                <p className="text-xs font-mono text-text-tertiary">border-border-strong</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography Scale */}
      <Card>
        <CardHeader>
          <CardTitle>Typography Scale</CardTitle>
          <CardDescription>Semantic heading and text styles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="pb-4 border-b border-border">
              <h1>Display Heading (H1)</h1>
              <p className="text-sm text-text-secondary mt-2 font-mono">
                text-2xl • font-weight: 500 • line-height: 1.5
              </p>
            </div>
            <div className="pb-4 border-b border-border">
              <h2>Section Heading (H2)</h2>
              <p className="text-sm text-text-secondary mt-2 font-mono">
                text-xl • font-weight: 500 • line-height: 1.5
              </p>
            </div>
            <div className="pb-4 border-b border-border">
              <h3>Subsection Heading (H3)</h3>
              <p className="text-sm text-text-secondary mt-2 font-mono">
                text-lg • font-weight: 500 • line-height: 1.5
              </p>
            </div>
            <div className="pb-4 border-b border-border">
              <h4>Component Heading (H4)</h4>
              <p className="text-sm text-text-secondary mt-2 font-mono">
                text-base • font-weight: 500 • line-height: 1.5
              </p>
            </div>
            <div className="pb-4 border-b border-border">
              <p>Body Text (Paragraph)</p>
              <p className="text-sm text-text-secondary mt-2 font-mono">
                text-base • font-weight: 400 • line-height: 1.5
              </p>
            </div>
            <div className="pb-4 border-b border-border">
              <p className="text-sm">Small Text</p>
              <p className="text-sm text-text-secondary mt-2 font-mono">
                text-sm • Used for captions and labels
              </p>
            </div>
            <div>
              <p className="font-mono">SKU-12345-XYZ</p>
              <p className="text-sm text-text-secondary mt-2 font-mono">
                font-mono • Used for codes, SKUs, and technical IDs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spacing Scale */}
      <Card>
        <CardHeader>
          <CardTitle>Spacing Scale</CardTitle>
          <CardDescription>8px grid-based spacing system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { value: 4, name: "space-1", use: "Minimal spacing" },
              { value: 8, name: "space-2", use: "Tight spacing" },
              { value: 12, name: "space-3", use: "Compact spacing" },
              { value: 16, name: "space-4", use: "Default spacing" },
              { value: 24, name: "space-6", use: "Comfortable spacing" },
              { value: 32, name: "space-8", use: "Loose spacing" },
              { value: 48, name: "space-12", use: "Section spacing" },
              { value: 64, name: "space-16", use: "Major section spacing" },
            ].map(({ value, name, use }) => (
              <div key={value} className="flex items-center gap-4">
                <div
                  className="bg-primary rounded h-8 flex items-center justify-center text-primary-foreground text-xs font-medium"
                  style={{ width: `${value}px` }}
                >
                  {value}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-text-secondary">{use}</p>
                </div>
                <p className="text-xs font-mono text-text-tertiary">{value}px</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Border Radius */}
      <Card>
        <CardHeader>
          <CardTitle>Border Radius Scale</CardTitle>
          <CardDescription>Consistent corner rounding system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary mx-auto mb-3 rounded-sm" />
              <p className="text-sm font-medium">Small</p>
              <p className="text-xs text-text-secondary font-mono">radius-sm</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-primary mx-auto mb-3 rounded-md" />
              <p className="text-sm font-medium">Medium</p>
              <p className="text-xs text-text-secondary font-mono">radius-md</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-primary mx-auto mb-3 rounded-lg" />
              <p className="text-sm font-medium">Large</p>
              <p className="text-xs text-text-secondary font-mono">radius-lg</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-primary mx-auto mb-3 rounded-xl" />
              <p className="text-sm font-medium">Extra Large</p>
              <p className="text-xs text-text-secondary font-mono">radius-xl</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shadows */}
      <Card>
        <CardHeader>
          <CardTitle>Shadow System</CardTitle>
          <CardDescription>Elevation through shadows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="w-24 h-24 bg-card mx-auto mb-3 rounded-lg shadow-sm border border-border" />
              <p className="text-sm font-medium">Small</p>
              <p className="text-xs text-text-secondary font-mono">shadow-sm</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-card mx-auto mb-3 rounded-lg shadow-md" />
              <p className="text-sm font-medium">Medium</p>
              <p className="text-xs text-text-secondary font-mono">shadow-md</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-card mx-auto mb-3 rounded-lg shadow-lg" />
              <p className="text-sm font-medium">Large</p>
              <p className="text-xs text-text-secondary font-mono">shadow-lg</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-card mx-auto mb-3 rounded-lg shadow-xl" />
              <p className="text-sm font-medium">Extra Large</p>
              <p className="text-xs text-text-secondary font-mono">shadow-xl</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responsive Breakpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Responsive Breakpoints</CardTitle>
          <CardDescription>Mobile-first responsive design system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-surface-2">
              <p className="font-medium mb-1">Mobile</p>
              <p className="text-sm text-text-secondary mb-2">&lt; 768px</p>
              <p className="text-xs font-mono text-text-tertiary">Default (no prefix)</p>
            </div>
            <div className="p-4 rounded-lg bg-surface-2">
              <p className="font-medium mb-1">Tablet</p>
              <p className="text-sm text-text-secondary mb-2">768px - 1023px</p>
              <p className="text-xs font-mono text-text-tertiary">md: prefix</p>
            </div>
            <div className="p-4 rounded-lg bg-surface-2">
              <p className="font-medium mb-1">Desktop</p>
              <p className="text-sm text-text-secondary mb-2">≥ 1024px</p>
              <p className="text-xs font-mono text-text-tertiary">lg: prefix</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
          <CardDescription>How to apply design tokens in code</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-surface-2 rounded-lg">
            <p className="text-sm font-medium mb-2">Semantic Colors</p>
            <pre className="text-xs font-mono text-text-secondary">
{`className="bg-success text-success-foreground"
className="bg-warning text-warning-foreground"
className="bg-error text-error-foreground"`}
            </pre>
          </div>

          <div className="p-4 bg-surface-2 rounded-lg">
            <p className="text-sm font-medium mb-2">Text Hierarchy</p>
            <pre className="text-xs font-mono text-text-secondary">
{`className="text-text-primary"
className="text-text-secondary"
className="text-text-tertiary"`}
            </pre>
          </div>

          <div className="p-4 bg-surface-2 rounded-lg">
            <p className="text-sm font-medium mb-2">Spacing (8px Grid)</p>
            <pre className="text-xs font-mono text-text-secondary">
{`className="gap-4"     // 16px
className="p-6"       // 24px
className="mb-8"      // 32px`}
            </pre>
          </div>

          <div className="p-4 bg-surface-2 rounded-lg">
            <p className="text-sm font-medium mb-2">Responsive Design</p>
            <pre className="text-xs font-mono text-text-secondary">
{`className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
className="hidden lg:block"
className="text-sm md:text-base"`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
