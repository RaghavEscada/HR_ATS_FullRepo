import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Users, Plus, LogOut, Menu, FileText, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AllApplicants from '@/components/Dashboard/AllApplicants';
import AddNewApplication from '@/components/Dashboard/AddNewApplication';
import AIChatbot from '@/components/AIChatbot';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('applicants');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const sidebarItems = [
    { id: 'applicants', label: 'All Applicants', icon: Users },
    { id: 'add', label: 'Add New Application', icon: Plus },
    { id: 'job-description', label: 'Job Description Tool', icon: FileText, external: true, url: 'https://tldrjobdescription.vercel.app/' },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50/30">
        <Sidebar className="w-72 border-r border-slate-200/60 bg-white/80 backdrop-blur-sm">
          <SidebarContent className="p-8">
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center shadow-sm">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Tl;dr ATS</h1>
                  <p className="text-xs text-slate-500 font-medium">Recruitment Platform</p>
                </div>
              </div>
              <SidebarTrigger className="lg:hidden" />
            </div>
            
            <nav className="space-y-1 flex-1">
              {sidebarItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`w-full justify-start h-12 px-4 font-medium transition-all duration-200 ${
                    activeTab === item.id 
                      ? "bg-slate-900 text-white shadow-sm hover:bg-slate-800" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                  }`}
                  onClick={() => {
                    if (item.external && item.url) {
                      window.open(item.url, '_blank', 'noopener,noreferrer');
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                  {item.external && <ExternalLink className="w-3 h-3 ml-auto" />}
                </Button>
              ))}
            </nav>
            
            <div className="mt-auto pt-6 border-t border-slate-200/60">
              <Button 
                variant="ghost" 
                className="w-full justify-start h-12 px-4 text-slate-600 hover:text-red-600 hover:bg-red-50/50 font-medium" 
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 p-8 bg-slate-50/30">
          <div className="lg:hidden mb-6">
            <SidebarTrigger />
          </div>
          
          {activeTab === 'applicants' && <AllApplicants />}
          {activeTab === 'add' && <AddNewApplication />}
        </main>
        
        {/* AI Chatbot - Only show when user is signed in */}
        {user && <AIChatbot />}
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;