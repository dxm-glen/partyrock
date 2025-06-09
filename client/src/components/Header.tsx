import { Button } from "@/components/ui/button";
import { Cloud } from "lucide-react";

interface HeaderProps {
  onAdminClick: () => void;
}

export default function Header({ onAdminClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-aws-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Cloud className="text-aws-orange h-8 w-8" />
              <span className="text-xl font-bold text-aws-dark">PartyRock Korea</span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            onClick={onAdminClick}
            className="text-aws-gray-500 hover:text-aws-orange"
          >
            관리자
          </Button>
        </div>
      </div>
    </header>
  );
}
