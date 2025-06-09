import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, Lock } from "lucide-react";
import type { LearningPath } from "@/lib/constants";

interface LearningPathCardProps {
  path: LearningPath;
}

export default function LearningPathCard({ path }: LearningPathCardProps) {
  const completedModules = path.modules.filter(module => module.completed).length;
  const progressPercentage = (completedModules / path.modules.length) * 100;

  return (
    <Card className="overflow-hidden">
      <div className={`p-6 border-b ${path.bgColor}`}>
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${path.badgeColor}`}>
            {path.level}
          </span>
          <path.icon className={`h-6 w-6 ${path.iconColor}`} />
        </div>
        <h3 className="text-xl font-bold text-aws-dark mb-2">{path.title}</h3>
        <p className="text-aws-gray-500 text-sm">{path.description}</p>
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-3 mb-6">
          {path.modules.map((module, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                module.completed 
                  ? 'bg-green-100'
                  : path.locked 
                  ? 'bg-aws-gray-100'
                  : 'bg-aws-gray-100'
              }`}>
                {module.completed ? (
                  <Check className="text-green-600 h-3 w-3" />
                ) : path.locked ? (
                  <Lock className="text-aws-gray-400 h-3 w-3" />
                ) : (
                  <span className="text-xs text-aws-gray-500">{index + 1}</span>
                )}
              </div>
              <span className={`text-sm ${
                module.completed ? 'text-aws-dark' : path.locked ? 'text-aws-gray-400' : 'text-aws-gray-500'
              }`}>
                {module.title}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm text-aws-gray-500 mb-2">
            <span>진행률</span>
            <span>{path.locked ? '잠금됨' : `${progressPercentage.toFixed(0)}%`}</span>
          </div>
          <Progress 
            value={path.locked ? 0 : progressPercentage} 
            className={`h-2 ${path.locked ? 'opacity-50' : ''}`}
          />
        </div>
        
        <Button 
          className={`w-full font-medium ${
            path.locked 
              ? 'bg-aws-gray-300 text-aws-gray-500 cursor-not-allowed hover:bg-aws-gray-300'
              : progressPercentage > 0
              ? `${path.buttonColor} hover:${path.buttonHover} text-white`
              : `${path.buttonColor} hover:${path.buttonHover} text-white`
          }`}
          disabled={path.locked}
        >
          {path.locked ? path.lockMessage : progressPercentage > 0 ? '학습 계속하기' : '학습 시작하기'}
        </Button>
      </CardContent>
    </Card>
  );
}
