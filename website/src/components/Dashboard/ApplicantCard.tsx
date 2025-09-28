import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Eye, 
  MoreVertical, 
  Trash2, 
  UserCheck, 
  UserX, 
  Calendar,
  FileText,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface ApplicantCardProps {
  applicant: Applicant;
  onStatusChange: (id: string, status: string) => void;
  onInterviewToggle: (id: string, interviewed: boolean) => void;
  onDelete: (id: string) => void;
  onViewDetails: (applicant: Applicant) => void;
}

const ApplicantCard = ({
  applicant,
  onStatusChange,
  onInterviewToggle,
  onDelete,
  onViewDetails
}: ApplicantCardProps) => {
  const { toast } = useToast();

  const getOverallScoreBadge = (score?: number) => {
    if (!score) return { variant: 'default' as const, className: 'bg-slate-100 text-slate-700 border border-slate-200' };
    if (score >= 7) return { variant: 'default' as const, className: 'bg-emerald-100 text-emerald-800 border border-emerald-200' };
    if (score >= 5) return { variant: 'default' as const, className: 'bg-amber-100 text-amber-800 border border-amber-200' };
    return { variant: 'default' as const, className: 'bg-rose-100 text-rose-800 border border-rose-200' };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Hired':
        return { variant: 'default' as const, className: 'bg-emerald-100 text-emerald-800 border border-emerald-200' };
      case 'Interviewed':
        return { variant: 'default' as const, className: 'bg-blue-100 text-blue-800 border border-blue-200' };
      case 'Reviewing':
        return { variant: 'default' as const, className: 'bg-amber-100 text-amber-800 border border-amber-200' };
      case 'Rejected':
        return { variant: 'default' as const, className: 'bg-rose-100 text-rose-800 border border-rose-200' };
      case 'Applied':
        return { variant: 'default' as const, className: 'bg-slate-100 text-slate-800 border border-slate-200' };
      default:
        return { variant: 'secondary' as const, className: 'bg-slate-100 text-slate-800 border border-slate-200' };
    }
  };

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(applicant.id, newStatus);
    toast({
      title: "Status Updated",
      description: `${applicant.first_name} ${applicant.last_name}'s status changed to ${newStatus}`,
    });
  };

  const handleInterviewToggle = () => {
    onInterviewToggle(applicant.id, !applicant.is_interviewed);
    toast({
      title: applicant.is_interviewed ? "Removed from Interviewed" : "Marked as Interviewed",
      description: `${applicant.first_name} ${applicant.last_name} interview status updated`,
    });
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${applicant.first_name} ${applicant.last_name}?`)) {
      onDelete(applicant.id);
      toast({
        title: "Applicant Deleted",
        description: `${applicant.first_name} ${applicant.last_name} has been removed`,
      });
    }
  };

  const overallScoreBadge = getOverallScoreBadge(applicant.overall_score);
  const statusBadge = getStatusBadge(applicant.status);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer group">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <h3 className="font-semibold text-xl text-slate-900 tracking-tight group-hover:text-slate-700 transition-colors">
              {applicant.first_name} {applicant.last_name}
            </h3>
            <p className="text-sm text-slate-600 font-medium">{applicant.email}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge {...overallScoreBadge} className="px-3 py-1 text-sm font-semibold">
              {applicant.overall_score ? `${applicant.overall_score}/10` : 'No Score'}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100/50">
                  <MoreVertical className="h-4 w-4 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onViewDetails(applicant)} className="font-medium">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleInterviewToggle} className="font-medium">
                  {applicant.is_interviewed ? (
                    <>
                      <UserX className="h-4 w-4 mr-2" />
                      Mark Not Interviewed
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Mark Interviewed
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600 font-medium">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        <div className="flex items-center justify-between">
          <Badge 
            className={`px-3 py-1 text-sm font-semibold ${
              applicant.status === 'Hired' 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : applicant.status === 'Interviewed'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : applicant.status === 'Reviewing'
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : applicant.status === 'Rejected'
                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                : 'bg-slate-100 text-slate-800 border border-slate-200'
            }`}
          >
            {applicant.status}
          </Badge>
          {applicant.is_interviewed && (
            <Badge variant="outline" className="text-slate-600 border-slate-300 bg-slate-50 px-3 py-1 text-sm font-semibold">
              <Calendar className="h-3 w-3 mr-1" />
              Interviewed
            </Badge>
          )}
        </div>
        
        {applicant.email_content_summary && (
          <div className="bg-slate-50/50 rounded-lg p-4">
            <p className="text-sm font-semibold text-slate-700 mb-2">Email Summary</p>
            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {applicant.email_content_summary}
            </p>
          </div>
        )}

        {applicant.candidate_summary && (
          <div className="bg-blue-50/50 rounded-lg p-4">
            <p className="text-sm font-semibold text-slate-700 mb-2">Candidate Summary</p>
            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {applicant.candidate_summary}
            </p>
          </div>
        )}
        
        {applicant.quick_read && (
          <div className="bg-green-50/50 rounded-lg p-4">
            <p className="text-sm font-semibold text-slate-700 mb-2">Quick Read</p>
            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {applicant.quick_read}
            </p>
          </div>
        )}

        {applicant.cv_gdrive_link && (
          <div className="bg-amber-50/50 rounded-lg p-4">
            <p className="text-sm font-semibold text-slate-700 mb-2">CV Document</p>
            <a 
              href={applicant.cv_gdrive_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-slate-600 hover:text-slate-800 flex items-center space-x-2 font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View CV Document</span>
            </a>
          </div>
        )}
        
        <div className="space-y-3 pt-2 border-t border-slate-200/60">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              Applied: {new Date(applicant.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {['Applied', 'Reviewing', 'Interviewed', 'Rejected', 'Hired'].map((status) => {
              const getStatusButtonStyle = (status: string, isActive: boolean) => {
                if (isActive) {
                  switch (status) {
                    case 'Applied': return "bg-slate-900 text-white hover:bg-slate-800";
                    case 'Reviewing': return "bg-amber-600 text-white hover:bg-amber-700";
                    case 'Interviewed': return "bg-blue-600 text-white hover:bg-blue-700";
                    case 'Rejected': return "bg-rose-600 text-white hover:bg-rose-700";
                    case 'Hired': return "bg-emerald-600 text-white hover:bg-emerald-700";
                    default: return "bg-slate-900 text-white hover:bg-slate-800";
                  }
                } else {
                  switch (status) {
                    case 'Applied': return "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300";
                    case 'Reviewing': return "border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300";
                    case 'Interviewed': return "border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300";
                    case 'Rejected': return "border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300";
                    case 'Hired': return "border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300";
                    default: return "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300";
                  }
                }
              };

              return (
                <Button
                  key={status}
                  variant={applicant.status === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusChange(status)}
                  className={`text-xs px-3 py-1 h-7 font-medium transition-all ${getStatusButtonStyle(status, applicant.status === status)}`}
                >
                  {status}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicantCard;