import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ExternalLink, Copy, Bookmark } from "lucide-react";
import type { AppGalleryItem } from "@shared/schema";

interface AppGalleryCardProps {
  app: AppGalleryItem;
}

export default function AppGalleryCard({ app }: AppGalleryCardProps) {
  const rating = app.rating ? app.rating / 10 : 0;
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "교육":
        return "bg-green-100 text-green-800";
      case "비즈니스":
        return "bg-blue-100 text-blue-800";
      case "정부/공공":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "초급":
        return "bg-blue-100 text-blue-800";
      case "중급":
        return "bg-orange-100 text-orange-800";
      case "고급":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleOpenApp = () => {
    if (app.partyrockLink) {
      window.open(app.partyrockLink, '_blank');
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={getCategoryColor(app.category)}>{app.category}</Badge>
              <Badge className={getDifficultyColor(app.difficulty)}>{app.difficulty}</Badge>
            </div>
            <h3 className="text-xl font-bold text-aws-dark mb-2">{app.name}</h3>
            <p className="text-aws-gray-500 text-sm">{app.description}</p>
          </div>
          <Button variant="ghost" size="sm">
            <Bookmark className="text-aws-gray-400 h-4 w-4" />
          </Button>
        </div>

        {/* App Screenshot */}
        {app.screenshotUrl && (
          <div className="mb-6">
            <img
              src={app.screenshotUrl}
              alt={`${app.name} 스크린샷`}
              className="w-full h-40 object-cover rounded-lg"
            />
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-aws-gray-500">사용자 평점</span>
            <div className="flex items-center space-x-1">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= rating ? 'fill-current' : ''
                    }`}
                  />
                ))}
              </div>
              <span className="text-aws-gray-500">({rating.toFixed(1)})</span>
            </div>
          </div>

          {app.useCase && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-aws-gray-500">활용 사례</span>
              <span className="text-aws-dark font-medium">{app.useCase}</span>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              className="flex-1 bg-aws-orange hover:bg-orange-600 text-white"
              onClick={handleOpenApp}
              disabled={!app.partyrockLink}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              PartyRock에서 열기
            </Button>
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
