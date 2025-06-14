import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Eye, EyeOff, Edit, Save, X } from "lucide-react";
import type { Tutorial } from "@shared/schema";

interface TutorialManagementProps {
  adminKey: string;
}

export default function TutorialManagement({ adminKey }: TutorialManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    subtitleUrl: "",
    category: "",
    difficulty: "",
    duration: 0,
  });

  // Fetch all tutorials including unpublished ones
  const { data: tutorials = [], isLoading } = useQuery<Tutorial[]>({
    queryKey: ['/api/admin/tutorials'],
    queryFn: async () => {
      const response = await fetch('/api/admin/tutorials', {
        headers: {
          'X-Admin-Key': adminKey,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch tutorials');
      }
      return response.json();
    },
    enabled: !!adminKey,
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, published }: { id: number; published: boolean }) => {
      const response = await fetch(`/api/tutorials/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": adminKey,
        },
        body: JSON.stringify({ published }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tutorials'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tutorials'] });
      toast({
        title: "상태 변경 완료",
        description: "튜토리얼 공개 상태가 변경되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "상태 변경 실패",
        description: error.message || "상태 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/tutorials/${id}`, {
        method: "DELETE",
        headers: {
          "X-Admin-Key": adminKey,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tutorials'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tutorials'] });
      toast({
        title: "삭제 완료",
        description: "튜토리얼이 성공적으로 삭제되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "삭제 실패",
        description: error.message || "삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/tutorials/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": adminKey,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tutorials'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tutorials'] });
      setEditingTutorial(null);
      toast({
        title: "수정 완료",
        description: "튜토리얼이 성공적으로 수정되었습니다.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "수정 실패",
        description: error.message || "수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (tutorial: Tutorial) => {
    setEditingTutorial(tutorial);
    setEditForm({
      title: tutorial.title,
      description: tutorial.description || "",
      videoUrl: tutorial.videoUrl,
      thumbnailUrl: tutorial.thumbnailUrl || "",
      subtitleUrl: tutorial.subtitleUrl || "",
      category: tutorial.category,
      difficulty: tutorial.difficulty,
      duration: tutorial.duration || 0,
    });
  };

  const handleSaveEdit = () => {
    if (!editingTutorial) return;
    
    updateMutation.mutate({
      id: editingTutorial.id,
      data: editForm
    });
  };

  const handleCancelEdit = () => {
    setEditingTutorial(null);
    setEditForm({
      title: "",
      description: "",
      videoUrl: "",
      thumbnailUrl: "",
      subtitleUrl: "",
      category: "",
      difficulty: "",
      duration: 0,
    });
  };

  const handleTogglePublish = (tutorial: Tutorial) => {
    togglePublishMutation.mutate({
      id: tutorial.id,
      published: !tutorial.published
    });
  };

  const handleDelete = (tutorial: Tutorial) => {
    if (window.confirm(`"${tutorial.title}" 튜토리얼을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      deleteMutation.mutate(tutorial.id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="border-b border-nxt-gray-100 pb-4 mb-6">
            <h3 className="text-lg font-bold text-nxt-dark mb-2">튜토리얼 관리</h3>
            <p className="text-sm text-nxt-gray-500">등록된 튜토리얼을 관리하고 편집하세요.</p>
          </div>
          <div className="text-center py-8">
            <p className="text-nxt-gray-500">튜토리얼을 불러오는 중...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="border-b border-nxt-gray-100 pb-4 mb-6">
          <h3 className="text-lg font-bold text-nxt-dark mb-2">튜토리얼 관리</h3>
          <p className="text-sm text-nxt-gray-500">등록된 튜토리얼을 관리하고 편집하세요.</p>
        </div>

        {tutorials.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-nxt-gray-500">등록된 튜토리얼이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {tutorials.map((tutorial) => (
              <div key={tutorial.id} className="border border-nxt-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-lg text-nxt-dark">{tutorial.title}</h4>
                      <Badge 
                        variant={tutorial.published ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {tutorial.published ? "공개" : "비공개"}
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-xs font-medium text-nxt-gray-600">설명</Label>
                        <p className="text-sm text-nxt-gray-700 mt-1">{tutorial.description || "설명 없음"}</p>
                      </div>
                      
                      <div>
                        <Label className="text-xs font-medium text-nxt-gray-600">비디오 URL</Label>
                        <p className="text-sm text-nxt-gray-700 mt-1 font-mono break-all">{tutorial.videoUrl}</p>
                      </div>
                      
                      {tutorial.thumbnailUrl && (
                        <div>
                          <Label className="text-xs font-medium text-nxt-gray-600">썸네일 URL</Label>
                          <p className="text-sm text-nxt-gray-700 mt-1 font-mono break-all">{tutorial.thumbnailUrl}</p>
                        </div>
                      )}
                      
                      {tutorial.subtitleUrl && (
                        <div>
                          <Label className="text-xs font-medium text-nxt-gray-600">자막 URL</Label>
                          <p className="text-sm text-nxt-gray-700 mt-1 font-mono break-all">{tutorial.subtitleUrl}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="text-xs">
                        카테고리: {tutorial.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        난이도: {tutorial.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        재생시간: {tutorial.duration ? `${Math.floor(tutorial.duration / 60)}분 ${tutorial.duration % 60}초` : "미설정"}
                      </Badge>
                      <span className="text-xs text-nxt-gray-400">
                        조회수: {tutorial.views}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(tutorial)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    수정
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTogglePublish(tutorial)}
                    disabled={togglePublishMutation.isPending}
                    className="flex items-center gap-1"
                  >
                    {tutorial.published ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        비공개로 변경
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        공개로 변경
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(tutorial)}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingTutorial} onOpenChange={(open) => !open && handleCancelEdit()}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>튜토리얼 수정</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <Label htmlFor="edit-title">제목</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="edit-description">설명</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-videoUrl">비디오 URL</Label>
                <Input
                  id="edit-videoUrl"
                  value={editForm.videoUrl}
                  onChange={(e) => setEditForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder="https://partyrock-guide-nxtcloud.s3.ap-northeast-2.amazonaws.com/..."
                />
              </div>

              <div>
                <Label htmlFor="edit-thumbnailUrl">썸네일 URL (선택사항)</Label>
                <Input
                  id="edit-thumbnailUrl"
                  value={editForm.thumbnailUrl}
                  onChange={(e) => setEditForm(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                  placeholder="https://partyrock-guide-nxtcloud.s3.ap-northeast-2.amazonaws.com/..."
                />
              </div>

              <div>
                <Label htmlFor="edit-subtitleUrl">자막 URL (선택사항)</Label>
                <Input
                  id="edit-subtitleUrl"
                  value={editForm.subtitleUrl}
                  onChange={(e) => setEditForm(prev => ({ ...prev, subtitleUrl: e.target.value }))}
                  placeholder="https://partyrock-guide-nxtcloud.s3.ap-northeast-2.amazonaws.com/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>카테고리</Label>
                  <Select value={editForm.category} onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}>
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
                  <Select value={editForm.difficulty} onValueChange={(value) => setEditForm(prev => ({ ...prev, difficulty: value }))}>
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
                <Label htmlFor="edit-duration">재생시간 (초)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={editForm.duration}
                  onChange={(e) => setEditForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  placeholder="재생시간을 초 단위로 입력"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="h-4 w-4 mr-1" />
                취소
              </Button>
              <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
                <Save className="h-4 w-4 mr-1" />
                {updateMutation.isPending ? "저장 중..." : "저장"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}