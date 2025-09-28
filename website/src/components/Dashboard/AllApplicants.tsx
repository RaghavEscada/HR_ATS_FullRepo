import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  Download, 
  Users, 
  Filter,
  SortAsc,
  SortDesc,
  Mail,
  Calendar,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ApplicantCard from './ApplicantCard';

interface Applicant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  email_content_summary?: string;
  candidate_summary?: string;
  overall_score?: number;
  quick_read?: string;
  cv_gdrive_link?: string;
  status: 'Applied' | 'Reviewing' | 'Interviewed' | 'Rejected' | 'Hired';
  is_interviewed: boolean;
  created_at: string;
  updated_at: string;
}

const AllApplicants = () => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchApplicants();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortApplicants();
  }, [applicants, searchTerm, statusFilter, scoreFilter, sortBy, sortOrder]);

  const fetchApplicants = async () => {
    try {
      const { data, error } = await supabase
        .from('applicants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplicants((data || []) as Applicant[]);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load applicants",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortApplicants = () => {
    let filtered = [...applicants];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (applicant) =>
          applicant.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          applicant.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          applicant.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((applicant) => applicant.status === statusFilter);
    }

    // Score filter
    if (scoreFilter !== 'all') {
      const [min, max] = scoreFilter.split('-').map(Number);
      filtered = filtered.filter(
        (applicant) => applicant.overall_score && applicant.overall_score >= min && applicant.overall_score <= max
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Applicant];
      let bValue: any = b[sortBy as keyof Applicant];

      if (sortBy === 'name') {
        aValue = `${a.first_name} ${a.last_name}`;
        bValue = `${b.first_name} ${b.last_name}`;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredApplicants(filtered);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('applicants')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setApplicants(prev =>
        prev.map(applicant =>
          applicant.id === id ? { ...applicant, status: newStatus as any } : applicant
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status",
      });
    }
  };

  const handleInterviewToggle = async (id: string, interviewed: boolean) => {
    try {
      const { error } = await supabase
        .from('applicants')
        .update({ is_interviewed: interviewed })
        .eq('id', id);

      if (error) throw error;

      setApplicants(prev =>
        prev.map(applicant =>
          applicant.id === id ? { ...applicant, is_interviewed: interviewed } : applicant
        )
      );
    } catch (error) {
      console.error('Error updating interview status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update interview status",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('applicants')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setApplicants(prev => prev.filter(applicant => applicant.id !== id));
    } catch (error) {
      console.error('Error deleting applicant:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete applicant",
      });
    }
  };

  const handleExportCSV = () => {
    if (filteredApplicants.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "No applicants to export",
      });
      return;
    }

    const csvHeaders = [
      'First Name',
      'Last Name', 
      'Email',
      'Overall Score',
      'Status',
      'Interviewed',
      'Email Summary',
      'Candidate Summary',
      'Quick Read',
      'CV Link',
      'Applied Date'
    ];

    const csvData = filteredApplicants.map(applicant => [
      applicant.first_name,
      applicant.last_name,
      applicant.email,
      applicant.overall_score || '',
      applicant.status,
      applicant.is_interviewed ? 'Yes' : 'No',
      applicant.email_content_summary || '',
      applicant.candidate_summary || '',
      applicant.quick_read || '',
      applicant.cv_gdrive_link || '',
      new Date(applicant.created_at).toLocaleDateString()
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applicants-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${filteredApplicants.length} applicants to CSV`,
    });
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="w-8 h-8 animate-pulse text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Loading applicants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">All Applicants</h1>
          <p className="text-slate-600 font-medium">
            {filteredApplicants.length} of {applicants.length} applicants
          </p>
        </div>
        <Button 
          onClick={handleExportCSV} 
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 font-medium shadow-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-slate-200/60 focus:border-slate-400 focus:ring-slate-400/20 font-medium"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 border-slate-200/60 focus:border-slate-400 focus:ring-slate-400/20 font-medium">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Applied">Applied</SelectItem>
                <SelectItem value="Reviewing">Reviewing</SelectItem>
                <SelectItem value="Interviewed">Interviewed</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Hired">Hired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="h-11 border-slate-200/60 focus:border-slate-400 focus:ring-slate-400/20 font-medium">
                <SelectValue placeholder="Filter by overall score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="8-10">8-10 (High)</SelectItem>
                <SelectItem value="5-7">5-7 (Medium)</SelectItem>
                <SelectItem value="1-4">1-4 (Low)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-11 border-slate-200/60 focus:border-slate-400 focus:ring-slate-400/20 font-medium">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Applied</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="overall_score">Overall Score</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applicants Grid */}
      {filteredApplicants.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No applicants found</h3>
            <p className="text-muted-foreground">
              {applicants.length === 0 
                ? "Start by adding your first applicant using the 'Add New Application' tab."
                : "Try adjusting your search or filter criteria."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredApplicants.map((applicant) => (
            <ApplicantCard
              key={applicant.id}
              applicant={applicant}
              onStatusChange={handleStatusChange}
              onInterviewToggle={handleInterviewToggle}
              onDelete={handleDelete}
              onViewDetails={setSelectedApplicant}
            />
          ))}
        </div>
      )}

      {/* Applicant Details Modal */}
      <Dialog open={!!selectedApplicant} onOpenChange={() => setSelectedApplicant(null)}>
        <DialogContent className="max-w-3xl bg-white/95 backdrop-blur-sm border-slate-200/60">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-semibold text-slate-900 tracking-tight">
              {selectedApplicant?.first_name} {selectedApplicant?.last_name}
            </DialogTitle>
            <DialogDescription className="text-slate-600 font-medium">
              Complete applicant information and details
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplicant && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50/50 rounded-lg p-4">
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Email Address</label>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-600 font-medium">{selectedApplicant.email}</span>
                  </div>
                </div>
                <div className="bg-slate-50/50 rounded-lg p-4">
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Overall Score</label>
                  <Badge 
                    className={`px-3 py-1 text-sm font-semibold ${
                      selectedApplicant.overall_score && selectedApplicant.overall_score >= 7 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : selectedApplicant.overall_score && selectedApplicant.overall_score >= 5 
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : selectedApplicant.overall_score
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {selectedApplicant.overall_score ? `${selectedApplicant.overall_score}/10` : 'No Score'}
                  </Badge>
                </div>
                <div className="bg-slate-50/50 rounded-lg p-4">
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Current Status</label>
                  <Badge 
                    className={`px-3 py-1 text-sm font-semibold ${
                      selectedApplicant.status === 'Hired' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : selectedApplicant.status === 'Interviewed'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : selectedApplicant.status === 'Reviewing'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : selectedApplicant.status === 'Rejected'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}
                  >
                    {selectedApplicant.status}
                  </Badge>
                </div>
                <div className="bg-slate-50/50 rounded-lg p-4">
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Applied Date</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-600 font-medium">
                      {new Date(selectedApplicant.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {selectedApplicant.email_content_summary && (
                <div className="bg-slate-50/50 rounded-lg p-6">
                  <label className="text-sm font-semibold text-slate-700 mb-3 block">Email Content Summary</label>
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedApplicant.email_content_summary}</p>
                </div>
              )}

              {selectedApplicant.candidate_summary && (
                <div className="bg-blue-50/50 rounded-lg p-6">
                  <label className="text-sm font-semibold text-slate-700 mb-3 block">Candidate Summary</label>
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedApplicant.candidate_summary}</p>
                </div>
              )}

              {selectedApplicant.quick_read && (
                <div className="bg-green-50/50 rounded-lg p-6">
                  <label className="text-sm font-semibold text-slate-700 mb-3 block">Quick Read</label>
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedApplicant.quick_read}</p>
                </div>
              )}

              {selectedApplicant.cv_gdrive_link && (
                <div className="bg-amber-50/50 rounded-lg p-6">
                  <label className="text-sm font-semibold text-slate-700 mb-3 block">CV Document</label>
                  <a 
                    href={selectedApplicant.cv_gdrive_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-slate-600 hover:text-slate-800 flex items-center space-x-2 font-medium transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View CV Document</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllApplicants;