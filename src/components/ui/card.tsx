import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, style, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("rounded-2xl border text-card-foreground transition-all duration-300 hover:-translate-y-1", className)} 
    style={{
      background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
      backgroundImage: `
        linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%),
        radial-gradient(circle, rgba(139, 92, 246, 0.08) 1px, transparent 1px)
      `,
      backgroundSize: 'cover, 16px 16px',
      backgroundPosition: 'center, 0 0',
      borderColor: 'rgba(139, 92, 246, 0.2)',
      boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)',
      ...style
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.05)';
    }}
    {...props} 
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
