import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Mail, FileText, Loader2, Eye, CheckCircle, XCircle, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Applicant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string | null;
  created_at: string;
  cv_scoring: number;
  cv_gdrive_link?: string;
  quick_read?: string;
}

const Reviewing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviewingCandidates = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('applicants')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'Reviewing')
          .order('created_at', { ascending: false });

        if (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
          });
        } else {
          setApplicants(data || []);
        }
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch applicants",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReviewingCandidates();
  }, [user, toast]);

  const updateStatus = async (applicantId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('applicants')
        .update({ 
          status: newStatus,
          is_interviewed: newStatus === 'Interviewed' ? true : null
        })
        .eq('id', applicantId);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      } else {
        toast({
          title: "Success",
          description: `Status updated to ${newStatus}`,
        });
        // Refresh the list
        setApplicants(prev => prev.filter(app => app.id !== applicantId));
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Under Review</h1>
            <p className="text-sm text-muted-foreground">Candidates currently being reviewed</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Under Review</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{applicants.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Avg CV Score</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {applicants.length > 0 ? (applicants.reduce((sum, a) => sum + (a.cv_scoring || 0), 0) / applicants.length).toFixed(1) : 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>High Scores (8+)</CardDescription>
              <CardTitle className="text-3xl text-purple-600">
                {applicants.filter(app => (app.cv_scoring || 0) >= 8).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-4">
          {applicants.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Candidates Under Review</h3>
                <p className="text-muted-foreground">No candidates are currently being reviewed.</p>
              </CardContent>
            </Card>
          ) : (
            applicants.map((applicant) => (
              <Card key={applicant.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${applicant.first_name}+${applicant.last_name}&background=f59e0b&color=fff`} alt={`${applicant.first_name} ${applicant.last_name}`} />
                        <AvatarFallback>
                          {applicant.first_name[0]}{applicant.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{applicant.first_name} {applicant.last_name}</h3>
                        <p className="text-muted-foreground">{applicant.email}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Applied: {new Date(applicant.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            CV Score: {applicant.cv_scoring || 'N/A'}
                          </div>
                        </div>
                        {applicant.quick_read && (
                          <p className="text-sm text-muted-foreground mt-2 max-w-md">
                            {applicant.quick_read}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {applicant.status || 'Reviewing'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {applicant.cv_gdrive_link && (
                          <Button variant="outline" size="sm" onClick={() => window.open(applicant.cv_gdrive_link, '_blank')}>
                            <Eye className="w-4 h-4 mr-1" />
                            View CV
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => updateStatus(applicant.id, 'Interviewed')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Interview
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => updateStatus(applicant.id, 'Rejected')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviewing;
