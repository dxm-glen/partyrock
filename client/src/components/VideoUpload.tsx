import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface VideoUploadProps {
  onUploadSuccess?: () => void;
}

export default function VideoUpload({ onUploadSuccess }: VideoUploadProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    duration: "",
    videoUrl: "", // S3 URL input
    thumbnailUrl: "",
    subtitleUrl: "",
  });

  

  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (tutorialData: any) => {
      const response = await fetch("/api/tutorials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": "nxtcloud-partyrock-admin",
        },
        body: JSON.stringify(tutorialData),
      });
      
      if (!response.ok) {
        throw new Error("튜토리얼 업로드에 실패했습니다.");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "업로드 성공",
        description: "튜토리얼이 성공적으로 업로드되었습니다.",
      });
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        difficulty: "",
        duration: "",
        videoUrl: "",
        thumbnailUrl: "",
        subtitleUrl: "",
      });

      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "업로드 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.videoUrl || !formData.category || !formData.difficulty) {
      toast({
        title: "필수 항목을 입력해주세요",
        description: "제목, 비디오 URL, 카테고리, 난이도는 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }

    const tutorialData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      difficulty: formData.difficulty,
      duration: parseInt(formData.duration) || 0,
      videoUrl: formData.videoUrl,
      thumbnailUrl: formData.thumbnailUrl || null,
      subtitleUrl: formData.subtitleUrl || null,
    };

    uploadMutation.mutate(tutorialData);
  };



  return (
    <Card>
      <CardContent className="p-6">
        <div className="border-b border-nxt-gray-100 pb-4 mb-6">
          <h3 className="text-lg font-bold text-nxt-dark mb-2">튜토리얼 등록</h3>
          <p className="text-sm text-nxt-gray-500">AWS S3 비디오 URL로 새로운 튜토리얼을 등록하세요.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <Label htmlFor="videoUrl">비디오 URL (AWS S3)</Label>
            <Input
              id="videoUrl"
              placeholder="https://partyrock-guide-nxtcloud.s3.ap-northeast-2.amazonaws.com/video.mp4"
              value={formData.videoUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
              required
              className="mt-2"
            />
            <div className="text-sm text-gray-500 mt-1">
              AWS S3에 업로드된 비디오 파일의 전체 URL을 입력하세요
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">영상 제목</Label>
              <Input
                id="title"
                placeholder="튜토리얼 제목을 입력하세요"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                placeholder="영상 설명을 입력하세요"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>카테고리</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="가입 및 로그인 안내">가입 및 로그인 안내</SelectItem>
                    <SelectItem value="위젯 및 제작 실습">위젯 및 제작 실습</SelectItem>
                    <SelectItem value="데모 확인">데모 확인</SelectItem>
                    <SelectItem value="핸즈온 실습">핸즈온 실습</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>난이도</Label>
                <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="난이도 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">초급 (Beginner)</SelectItem>
                    <SelectItem value="intermediate">중급 (Intermediate)</SelectItem>
                    <SelectItem value="advanced">고급 (Advanced)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="duration">영상 길이 (초)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="0"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="thumbnailUrl">썸네일 URL (선택사항)</Label>
              <Input
                id="thumbnailUrl"
                placeholder="https://partyrock-guide-nxtcloud.s3.ap-northeast-2.amazonaws.com/thumbnail.jpg"
                value={formData.thumbnailUrl || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
              />
              <div className="text-xs text-nxt-gray-500 mt-1">S3에 업로드된 썸네일 이미지 URL</div>
            </div>

            <div>
              <Label htmlFor="subtitleUrl">자막 URL (선택사항)</Label>
              <Input
                id="subtitleUrl"
                placeholder="https://partyrock-guide-nxtcloud.s3.ap-northeast-2.amazonaws.com/subtitle.vtt"
                value={formData.subtitleUrl || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitleUrl: e.target.value }))}
              />
              <div className="text-xs text-nxt-gray-500 mt-1">S3에 업로드된 자막 파일 URL</div>
            </div>

            <Button
              type="submit"
              className="w-full bg-nxt-blue hover:bg-blue-600 text-white"
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "업로드 중..." : "업로드 및 발행"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
