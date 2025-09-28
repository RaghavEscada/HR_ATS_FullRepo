import { Button } from "@/components/ui/button";
import { Users, Target, BarChart3, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-recruitment.jpg";

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: "Smart Resume Parsing",
      description: "Automatically extract and analyze key information from resumes with AI-powered parsing technology."
    },
    {
      icon: BarChart3,
      title: "CV Scoring System",
      description: "Rate candidates with intelligent CV scoring from 1-10 based on job requirements and qualifications."
    },
    {
      icon: Clock,
      title: "Application Tracking",
      description: "Track candidates through every stage of your hiring pipeline with real-time status updates."
    },
    {
      icon: Users,
      title: "Interview Management",
      description: "Seamlessly manage interviews, schedule meetings, and collaborate with your hiring team."
    },
    {
      icon: CheckCircle,
      title: "Status Management",
      description: "Update candidate status from Applied to Hired with a simple, intuitive interface."
    },
    {
      icon: ArrowRight,
      title: "Bulk Operations",
      description: "Perform bulk actions, export data to CSV, and manage multiple candidates efficiently."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">CVScoreHub</span>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/auth')}
              className="hover:bg-primary hover:text-white transition-colors"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Streamline Your 
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Hiring Process </span>
                  with Smart ATS Tracking
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Transform your recruitment workflow with intelligent CV scoring, automated tracking, and seamless candidate management. Make better hiring decisions faster.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="hero" 
                  size="lg" 
                  onClick={() => navigate('/auth')}
                  className="text-lg px-8 py-6"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="text-lg px-8 py-6 hover:bg-primary hover:text-white"
                >
                  Explore Companies
                </Button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Setup in minutes</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl transform rotate-3"></div>
              <img 
                src={heroImage} 
                alt="Modern recruitment and hiring process"
                className="relative rounded-2xl shadow-[var(--shadow-elevated)] w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Hire Smarter
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive ATS platform combines powerful automation with intuitive design to help you find and hire the best talent efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-accent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Hiring Process?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of HR teams who have streamlined their recruitment with CVScoreHub.
          </p>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/auth')}
            className="bg-white text-primary hover:bg-white/90 border-white text-lg px-8 py-6"
          >
            Start Recruiting Today
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">CVScoreHub</span>
            </div>
            <p className="text-muted-foreground">© 2025 CVScoreHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;