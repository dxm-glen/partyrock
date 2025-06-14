import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Eye, EyeOff, Edit } from "lucide-react";
import type { Tutorial } from "@shared/schema";

interface TutorialManagementProps {
  adminKey: string;
}

export default function TutorialManagement({ adminKey }: TutorialManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all tutorials including unpublished ones
  const { data: tutorials = [], isLoading } = useQuery<Tutorial[]>({
    queryKey: ['/api/admin/tutorials'],
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
          <div className="space-y-4">
            {tutorials.map((tutorial) => (
              <div key={tutorial.id} className="border border-nxt-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-nxt-dark mb-1">{tutorial.title}</h4>
                    <p className="text-sm text-nxt-gray-500 mb-2">{tutorial.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {tutorial.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {tutorial.difficulty}
                      </Badge>
                      <Badge 
                        variant={tutorial.published ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {tutorial.published ? "공개" : "비공개"}
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
      </CardContent>
    </Card>
  );
}