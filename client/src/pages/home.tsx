import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import AdminAuthModal from "@/components/AdminAuthModal";
import VideoUpload from "@/components/VideoUpload";
import AppGalleryCard from "@/components/AppGalleryCard";
import TutorialCard from "@/components/TutorialCard";
import LearningPathCard from "@/components/LearningPathCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Brain, GraduationCap, Users, Video, Smartphone, Users as UsersIcon, Upload, CloudUploadIcon, ImageIcon } from "lucide-react";
import { LEARNING_PATHS, TUTORIAL_CATEGORIES, APP_CATEGORIES } from "@/lib/constants";
import type { Tutorial, AppGalleryItem } from "@shared/schema";

interface AdminStats {
  totalTutorials: number;
  totalApps: number;
  totalViews: number;
  recentTutorials: Tutorial[];
  recentApps: AppGalleryItem[];
}

export default function Home() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedTutorialCategory, setSelectedTutorialCategory] = useState("전체");
  const [selectedAppCategory, setSelectedAppCategory] = useState("전체");
  const [activeTab, setActiveTab] = useState("home");

  // Fetch tutorials
  const { data: tutorials = [], isLoading: tutorialsLoading } = useQuery<Tutorial[]>({
    queryKey: ['/api/tutorials', selectedTutorialCategory],
    enabled: true,
  });

  // Fetch apps
  const { data: apps = [], isLoading: appsLoading } = useQuery<AppGalleryItem[]>({
    queryKey: ['/api/apps', selectedAppCategory],
    enabled: true,
  });

  // Fetch admin stats
  const { data: adminStats } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    enabled: isAdminAuthenticated,
  });

  const handleAdminAuth = (success: boolean) => {
    setIsAdminAuthenticated(success);
    setShowAdminModal(false);
  };

  return (
    <div className="min-h-screen bg-nxt-gray-50">
      <Header onAdminClick={() => setShowAdminModal(true)} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="home">홈</TabsTrigger>
            <TabsTrigger value="tutorials">튜토리얼</TabsTrigger>
            <TabsTrigger value="learning">학습 센터</TabsTrigger>
            <TabsTrigger value="gallery">앱 갤러리</TabsTrigger>
            <TabsTrigger value="admin">관리자</TabsTrigger>
          </TabsList>

          {/* Home Tab */}
          <TabsContent value="home" className="tab-content">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-nxt-blue/90 to-nxt-purple/90 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[#3477ff]"></div>
              <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
                <div>
                  <h1 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">
                    AWS PartyRock으로<br />AI 앱을 쉽게 만들어보세요
                  </h1>
                  <p className="text-lg mb-6 text-white/95 drop-shadow">
                    코딩 없이도 생성형 AI를 활용한 웹 애플리케이션을 제작할 수 있습니다. 
                    대학생, 교직원, 공무원을 위한 전문 교육 과정을 제공합니다.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      className="bg-white text-nxt-blue hover:bg-gray-100 px-6 py-3 rounded-lg font-medium shadow-lg"
                      onClick={() => setActiveTab('tutorials')}
                    >
                      튜토리얼 영상 보기
                    </Button>
                  </div>
                </div>
                <div className="hidden md:block">
                  <img 
                    src="https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                    alt="AI 개발 개념 시각화" 
                    className="rounded-xl shadow-lg w-full h-auto"
                  />
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-nxt-blue/10 rounded-lg flex items-center justify-center mb-4">
                    <Brain className="text-nxt-blue h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-nxt-dark">노코드 AI 개발</h3>
                  <p className="text-nxt-gray-500">
                    프로그래밍 지식 없이도 드래그 앤 드롭으로 AI 애플리케이션을 제작할 수 있습니다.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-nxt-purple/10 rounded-lg flex items-center justify-center mb-4">
                    <GraduationCap className="text-nxt-purple h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-nxt-dark">체계적인 학습 과정</h3>
                  <p className="text-nxt-gray-500">
                    기초부터 전문가 수준까지 단계별로 구성된 한국어 교육 콘텐츠를 제공합니다.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="text-green-600 h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-nxt-dark">한국 사용자 맞춤</h3>
                  <p className="text-nxt-gray-500">
                    교육, 비즈니스, 공공 분야 한국 사용자를 위한 실무 중심 예제를 제공합니다.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Stats Section */}
            <Card>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-4 gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold text-nxt-blue mb-2">{tutorials.length}+</div>
                    <div className="text-nxt-gray-500">튜토리얼 영상</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-nxt-purple mb-2">{apps.length}+</div>
                    <div className="text-nxt-gray-500">예제 앱</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-2">1000+</div>
                    <div className="text-nxt-gray-500">활성 사용자</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600 mb-2">2</div>
                    <div className="text-nxt-gray-500">학습 단계</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Center Tab */}
          <TabsContent value="learning" className="tab-content">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-nxt-dark mb-4">학습 센터</h2>
              <p className="text-lg text-nxt-gray-500">체계적인 학습 과정으로 AI 앱 개발 전문가가 되어보세요.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              {LEARNING_PATHS.map((path, index) => (
                <LearningPathCard key={index} path={path} />
              ))}
            </div>

            {/* Learning Resources */}
            <Card>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-nxt-dark mb-6">추가 학습 자료</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-nxt-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="text-nxt-blue h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-nxt-dark mb-2">PartyRock 가이드북</h4>
                      <p className="text-sm text-nxt-gray-500 mb-3">
                        상세한 기능 설명과 활용 팁이 담긴 종합 가이드입니다.
                      </p>
                      <Button variant="link" className="text-nxt-blue hover:text-blue-700 text-sm font-medium p-0">
                        다운로드
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-nxt-purple/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="text-nxt-purple h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-nxt-dark mb-2">커뮤니티 포럼</h4>
                      <p className="text-sm text-nxt-gray-500 mb-3">
                        다른 사용자들과 경험을 공유하고 질문을 나눠보세요.
                      </p>
                      <Button variant="link" className="text-nxt-purple hover:text-purple-700 text-sm font-medium p-0">
                        참여하기
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tutorials Tab */}
          <TabsContent value="tutorials" className="tab-content">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-nxt-dark mb-4">튜토리얼</h2>
              <p className="text-lg text-nxt-gray-500">동영상으로 배우는 PartyRock 완전정복</p>
            </div>



            {/* Tutorial Grid */}
            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
              {tutorialsLoading ? (
                <div className="col-span-full text-center py-12">
                  <div className="spinner mx-auto mb-4"></div>
                  <p className="text-nxt-gray-500">튜토리얼을 불러오는 중...</p>
                </div>
              ) : tutorials.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-nxt-gray-500">튜토리얼이 없습니다.</p>
                </div>
              ) : (
                tutorials.map((tutorial) => (
                  <TutorialCard key={tutorial.id} tutorial={tutorial} />
                ))
              )}
            </div>

            {tutorials.length > 0 && (
              <div className="text-center mt-12">
                <Button className="bg-nxt-blue hover:bg-blue-600 text-white px-8 py-3">
                  더 많은 튜토리얼 보기
                </Button>
              </div>
            )}
          </TabsContent>

          {/* App Gallery Tab */}
          <TabsContent value="gallery" className="tab-content">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-nxt-dark mb-4">앱 갤러리</h2>
              <p className="text-lg text-nxt-gray-500">분야별 AI 앱 예제와 템플릿을 둘러보세요</p>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {APP_CATEGORIES.map((category) => (
                <Button
                  key={category.name}
                  variant={selectedAppCategory === category.name ? "default" : "outline"}
                  className={selectedAppCategory === category.name ? 
                    "bg-nxt-purple text-white" : 
                    "bg-white text-nxt-gray-500 hover:bg-nxt-gray-100"
                  }
                  onClick={() => setSelectedAppCategory(category.name)}
                >
                  {category.name}
                  {category.count && (
                    <Badge variant="secondary" className="ml-2">
                      {category.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* App Gallery Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
              {appsLoading ? (
                <div className="col-span-full text-center py-12">
                  <div className="spinner mx-auto mb-4"></div>
                  <p className="text-nxt-gray-500">앱 갤러리를 불러오는 중...</p>
                </div>
              ) : apps.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-nxt-gray-500">등록된 앱이 없습니다.</p>
                </div>
              ) : (
                apps.map((app) => (
                  <AppGalleryCard key={app.id} app={app} />
                ))
              )}
            </div>
          </TabsContent>

          {/* Admin Tab */}
          <TabsContent value="admin" className="tab-content">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-nxt-dark mb-4">관리자 패널</h2>
              <p className="text-lg text-nxt-gray-500">콘텐츠 관리 및 시스템 설정</p>
            </div>

            {!isAdminAuthenticated ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-nxt-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="text-nxt-blue h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-nxt-dark mb-4">관리자 인증이 필요합니다</h3>
                  <p className="text-nxt-gray-500 mb-6">관리자 기능에 접근하려면 인증 키를 입력해주세요.</p>
                  <Button 
                    className="bg-nxt-blue hover:bg-blue-600 text-white px-6 py-3"
                    onClick={() => setShowAdminModal(true)}
                  >
                    인증하기
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {/* Stats Cards */}
                <div className="grid lg:grid-cols-3 gap-8 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-nxt-blue/10 rounded-lg flex items-center justify-center">
                          <Video className="text-nxt-blue h-6 w-6" />
                        </div>
                        <span className="text-sm text-nxt-gray-500">전체</span>
                      </div>
                      <div className="text-2xl font-bold text-nxt-dark mb-2">
                        {adminStats?.totalTutorials || 0}
                      </div>
                      <div className="text-sm text-nxt-gray-500">튜토리얼 영상</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-nxt-purple/10 rounded-lg flex items-center justify-center">
                          <Smartphone className="text-nxt-purple h-6 w-6" />
                        </div>
                        <span className="text-sm text-nxt-gray-500">승인됨</span>
                      </div>
                      <div className="text-2xl font-bold text-nxt-dark mb-2">
                        {adminStats?.totalApps || 0}
                      </div>
                      <div className="text-sm text-nxt-gray-500">갤러리 앱</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-nxt-orange/10 rounded-lg flex items-center justify-center">
                          <UsersIcon className="text-nxt-orange h-6 w-6" />
                        </div>
                        <span className="text-sm text-nxt-gray-500">이번 달</span>
                      </div>
                      <div className="text-2xl font-bold text-nxt-dark mb-2">
                        {adminStats?.totalViews || 0}
                      </div>
                      <div className="text-sm text-nxt-gray-500">총 조회수</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Content Management Sections */}
                <div className="grid lg:grid-cols-2 gap-8">
                  <VideoUpload onUploadSuccess={() => {
                    // Refresh tutorials list
                    window.location.reload();
                  }} />

                  {/* App Gallery Management */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="border-b border-nxt-gray-100 pb-4 mb-6">
                        <h3 className="text-lg font-bold text-nxt-dark mb-2">앱 갤러리 관리</h3>
                        <p className="text-sm text-nxt-gray-500">갤러리에 새로운 앱을 등록하고 관리하세요.</p>
                      </div>
                      
                      <form className="space-y-4">
                        <div>
                          <Label htmlFor="app-name">앱 이름</Label>
                          <Input id="app-name" placeholder="앱 이름을 입력하세요" />
                        </div>
                        
                        <div>
                          <Label htmlFor="app-description">설명</Label>
                          <Textarea id="app-description" placeholder="앱 설명을 입력하세요" rows={3} />
                        </div>
                        
                        <div>
                          <Label htmlFor="partyrock-link">PartyRock 링크</Label>
                          <Input id="partyrock-link" type="url" placeholder="https://partyrock.aws/..." />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>분야</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="분야 선택" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="교육">교육</SelectItem>
                                <SelectItem value="비즈니스">비즈니스</SelectItem>
                                <SelectItem value="정부/공공">정부/공공</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>난이도</Label>
                            <Select>
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
                          <Label>스크린샷 업로드</Label>
                          <div className="border-2 border-dashed border-nxt-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-nxt-purple transition-colors">
                            <ImageIcon className="text-nxt-gray-400 h-8 w-8 mx-auto mb-2" />
                            <div className="text-sm text-nxt-gray-500">앱 스크린샷을 업로드하세요</div>
                          </div>
                        </div>
                        
                        <Button className="w-full bg-nxt-purple hover:bg-purple-600 text-white">
                          앱 등록하기
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <AdminAuthModal 
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onAuth={handleAdminAuth}
      />
    </div>
  );
}
