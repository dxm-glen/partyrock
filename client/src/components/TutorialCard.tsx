import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Eye, Star } from "lucide-react";
import { useState, useRef } from "react";
import type { Tutorial } from "@shared/schema";

interface TutorialCardProps {
  tutorial: Tutorial;
}

export default function TutorialCard({ tutorial }: TutorialCardProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const rating = tutorial.rating ? tutorial.rating / 10 : 0;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "가입 및 로그인 안내":
        return "bg-green-100 text-green-800";
      case "위젯 및 제작 실습":
        return "bg-blue-100 text-blue-800";
      case "데모 확인":
        return "bg-purple-100 text-purple-800";
      case "샘플":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleVideoClick = () => {
    setIsVideoOpen(true);
    console.log('Playing video:', tutorial.id);
  };

  const handleCloseModal = (open: boolean) => {
    console.log('handleCloseModal called with:', open);
    if (!open && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsVideoOpen(open);
  };

  const handleCloseClick = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsVideoOpen(false);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={handleVideoClick}>
      <div className="relative">
        {tutorial.thumbnailUrl ? (
          <img
            src={tutorial.thumbnailUrl}
            alt={tutorial.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-nxt-gray-200 flex items-center justify-center">
            <Play className="h-12 w-12 text-nxt-gray-400" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
            <Play className="text-nxt-blue h-6 w-6 ml-1" />
          </div>
        </div>
        
        {tutorial.duration && (
          <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {formatDuration(tutorial.duration)}
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge className={getCategoryColor(tutorial.category)}>{tutorial.category}</Badge>
          <span className="text-xs text-nxt-gray-500">
            {tutorial.createdAt ? new Date(tutorial.createdAt).toLocaleDateString('ko-KR') : ''}
          </span>
        </div>
        
        <h3 className="font-semibold text-nxt-dark mb-2 line-clamp-2">{tutorial.title}</h3>
        
        <p className="text-sm text-nxt-gray-500 mb-4 line-clamp-2">{tutorial.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-nxt-gray-500">
            <Eye className="h-3 w-3" />
            <span>{tutorial.views?.toLocaleString() || 0} 조회</span>
          </div>
          
          {rating > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-xs text-nxt-gray-500">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Video Player Modal */}
      <Dialog open={isVideoOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="text-nxt-dark">{tutorial.title}</DialogTitle>
            <DialogDescription className="text-nxt-gray-500">
              {tutorial.description}
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-video">
            <video
              ref={videoRef}
              controls
              autoPlay
              className="w-full h-full rounded-lg"
              src={tutorial.videoUrl ?? undefined}
            >
              죄송합니다. 브라우저에서 동영상을 재생할 수 없습니다.
            </video>
          </div>
          <div className="flex justify-center mt-4">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleCloseModal(false);
              }}
              variant="outline"
              className="px-6"
            >
              닫기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
