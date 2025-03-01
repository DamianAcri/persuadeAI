// components/dashboard-header.tsx

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  description?: string;
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <div className="border-b">
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link 
                href="/" 
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                
              </Link>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}