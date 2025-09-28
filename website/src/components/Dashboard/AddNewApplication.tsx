import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Plus, Loader2, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  email_content_summary: string;
  cv_scoring: number;
  quick_read: string;
}

const AddNewApplication = () => {
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    email_content_summary: '',
    cv_scoring: 5,
    quick_read: '',
  });
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to add applicants.",
      });
      return;
    }

    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields (First Name, Last Name, Email).",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('applicants')
        .insert([{
          ...formData,
          user_id: user.id,
        }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `${formData.first_name} ${formData.last_name} has been added successfully.`,
      });

      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        email_content_summary: '',
        cv_scoring: 5,
        quick_read: '',
      });

    } catch (error: any) {
      console.error('Error adding applicant:', error);
      
      let errorMessage = "Failed to add applicant. Please try again.";
      if (error.message?.includes('unique')) {
        errorMessage = "An applicant with this email already exists.";
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      email_content_summary: '',
      cv_scoring: 5,
      quick_read: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add New Application</h1>
        <p className="text-muted-foreground">
          Enter the details of a new job applicant to add them to your ATS system.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Applicant Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="first_name"
                  type="text"
                  placeholder="Enter first name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_name">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="last_name"
                  type="text"
                  placeholder="Enter last name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            {/* CV Scoring */}
            <div className="space-y-2">
              <Label htmlFor="cv_scoring">CV Scoring (1-10)</Label>
              <Select 
                value={formData.cv_scoring.toString()} 
                onValueChange={(value) => handleInputChange('cv_scoring', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select CV score" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <SelectItem key={score} value={score.toString()}>
                      {score}/10 {score >= 8 ? '(High)' : score >= 5 ? '(Medium)' : '(Low)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Email Content Summary */}
            <div className="space-y-2">
              <Label htmlFor="email_content_summary">Email Content Summary</Label>
              <Textarea
                id="email_content_summary"
                placeholder="Brief summary of the applicant's email or cover letter..."
                value={formData.email_content_summary}
                onChange={(e) => handleInputChange('email_content_summary', e.target.value)}
                rows={3}
              />
            </div>

            {/* Quick Read */}
            <div className="space-y-2">
              <Label htmlFor="quick_read">Quick Read</Label>
              <Textarea
                id="quick_read"
                placeholder="Quick notes about the applicant (key skills, experience, etc.)..."
                value={formData.quick_read}
                onChange={(e) => handleInputChange('quick_read', e.target.value)}
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                type="submit" 
                variant="hero" 
                className="flex-1" 
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                <Plus className="w-4 h-4 mr-2" />
                Add Applicant
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={resetForm}
                disabled={loading}
                className="flex-1"
              >
                Clear Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="max-w-2xl bg-muted/30">
        <CardContent className="p-4">
          <h3 className="font-medium text-foreground mb-2">Tips for Adding Applicants</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• CV Scoring: Rate from 1-10 based on job requirements and qualifications</li>
            <li>• Email Summary: Include key points from their application email or cover letter</li>
            <li>• Quick Read: Note important skills, experience, or standout qualities</li>
            <li>• All applicants start with "Applied" status and can be updated later</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddNewApplication;