import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { KeyIcon } from "lucide-react";

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuth: (success: boolean) => void;
}

export default function AdminAuthModal({ isOpen, onClose, onAuth }: AdminAuthModalProps) {
  const [adminKey, setAdminKey] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const authMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await apiRequest("POST", "/api/auth/admin", { adminKey: key });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "인증 성공",
        description: "관리자 인증이 완료되었습니다.",
      });
      onAuth(true);
      setAdminKey("");
      setError("");
    },
    onError: () => {
      setError("올바르지 않은 관리자 키입니다.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim()) {
      setError("관리자 키를 입력해주세요.");
      return;
    }
    authMutation.mutate(adminKey.trim());
  };

  const handleClose = () => {
    setAdminKey("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-aws-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyIcon className="text-aws-orange h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold text-aws-dark mb-2">관리자 인증</DialogTitle>
            <p className="text-aws-gray-500 text-sm">관리자 키를 입력해주세요</p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="admin-key">관리자 키</Label>
            <Input
              id="admin-key"
              type="password"
              placeholder="관리자 키를 입력하세요"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              disabled={authMutation.isPending}
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
              disabled={authMutation.isPending}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-aws-orange hover:bg-orange-600 text-white"
              disabled={authMutation.isPending}
            >
              {authMutation.isPending ? "인증 중..." : "인증하기"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
