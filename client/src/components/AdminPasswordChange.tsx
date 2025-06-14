import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { KeyIcon } from "lucide-react";

interface AdminPasswordChangeProps {
  isOpen: boolean;
  onClose: () => void;
  adminKey: string;
}

export default function AdminPasswordChange({ isOpen, onClose, adminKey }: AdminPasswordChangeProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await fetch("/api/auth/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'x-admin-key': data.currentPassword
        },
        body: JSON.stringify({
          newPassword: data.newPassword
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "비밀번호 변경 완료",
        description: "관리자 비밀번호가 성공적으로 변경되었습니다.",
      });
      handleClose();
    },
    onError: (error: any) => {
      setError(error.message || "비밀번호 변경 중 오류가 발생했습니다.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentPassword.trim()) {
      setError("현재 비밀번호를 입력해주세요.");
      return;
    }

    if (!newPassword.trim()) {
      setError("새 비밀번호를 입력해주세요.");
      return;
    }

    if (newPassword.length < 6) {
      setError("새 비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (currentPassword !== adminKey) {
      setError("현재 비밀번호가 올바르지 않습니다.");
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword
    });
  };

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-nxt-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyIcon className="text-nxt-blue h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold text-nxt-dark mb-2">관리자 비밀번호 변경</DialogTitle>
            <p className="text-nxt-gray-500 text-sm">새로운 관리자 비밀번호를 설정해주세요</p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="current-password">현재 비밀번호</Label>
            <Input
              id="current-password"
              type="password"
              placeholder="현재 비밀번호를 입력하세요"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={changePasswordMutation.isPending}
            />
          </div>

          <div>
            <Label htmlFor="new-password">새 비밀번호</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="새 비밀번호를 입력하세요 (최소 6자)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={changePasswordMutation.isPending}
            />
          </div>

          <div>
            <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="새 비밀번호를 다시 입력하세요"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={changePasswordMutation.isPending}
            />
          </div>
          
          {error && (
            <div className="text-xs text-red-500">{error}</div>
          )}
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={changePasswordMutation.isPending}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-nxt-blue hover:bg-blue-600 text-white"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? "변경 중..." : "비밀번호 변경"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}