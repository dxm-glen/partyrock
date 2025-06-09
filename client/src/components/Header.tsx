import { Button } from "@/components/ui/button";
import { Cog } from "lucide-react";
import nxtLogo from "@assets/image_1749483306062.png";

interface HeaderProps {
  onAdminClick: () => void;
}

export default function Header({ onAdminClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-nxt-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img src={nxtLogo} alt="NXT Cloud" className="h-10 w-auto" />
              <span className="text-xl font-bold text-nxt-dark">PartyRock 가이드</span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            onClick={onAdminClick}
            className="text-nxt-gray-500 hover:text-nxt-blue"
          >
            <Cog className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
