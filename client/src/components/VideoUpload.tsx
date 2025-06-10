import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CloudUploadIcon } from "lucide-react";

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
  });
  const [selectedFiles, setSelectedFiles] = useState<{
    thumbnail?: File;
    subtitle?: File;
  }>({});
  

  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/tutorials", {
        method: "POST",
        headers: {
          "X-Admin-Key": process.env.ADMIN_KEY || "partyrock-korea-2024",
        },
        body: data,
      });
      
      if (!response.ok) {
        throw new Error("업로드에 실패했습니다.");
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
      });
      setSelectedFiles({});
      
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
    
    if (!formData.videoUrl) {
      toast({
        title: "비디오 URL을 입력해주세요",
        description: "AWS S3 비디오 URL을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("category", formData.category);
    submitData.append("difficulty", formData.difficulty);
    submitData.append("duration", formData.duration);
    submitData.append("videoUrl", formData.videoUrl);
    
    if (selectedFiles.thumbnail) {
      submitData.append("thumbnail", selectedFiles.thumbnail);
    }
    if (selectedFiles.subtitle) {
      submitData.append("subtitle", selectedFiles.subtitle);
    }

    uploadMutation.mutate(submitData);
  };



  return (
    <Card>
      <CardContent className="p-6">
        <div className="border-b border-nxt-gray-100 pb-4 mb-6">
          <h3 className="text-lg font-bold text-nxt-dark mb-2">동영상 업로드</h3>
          <p className="text-sm text-nxt-gray-500">새로운 튜토리얼 영상을 업로드하고 관리하세요.</p>
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
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="기초">기초</SelectItem>
                    <SelectItem value="응용">응용</SelectItem>
                    <SelectItem value="고급">고급</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>난이도</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="난이도 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="초급">초급</SelectItem>
                    <SelectItem value="중급">중급</SelectItem>
                    <SelectItem value="고급">고급</SelectItem>
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
              <Label htmlFor="subtitle">자막 파일 (선택사항)</Label>
              <Input
                id="subtitle"
                type="file"
                accept=".srt,.vtt"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    setSelectedFiles(prev => ({ ...prev, subtitle: files[0] }));
                  }
                }}
              />
              <div className="text-xs text-nxt-gray-500 mt-1">.srt 또는 .vtt 형식</div>
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
