import React from 'react';
import { Chart, ChartSeries, ChartSeriesItem } from '@progress/kendo-react-charts';
import { Badge } from '@progress/kendo-react-indicators';
import { Button } from '@/components/ui/button';
import { useFormStore } from '@/utils/formStore';
import { ConversationalForm, FormStatus } from '@/utils/formTypes';
import { Play, Pause, AlertCircle, BarChart, Calendar, Users, CheckCircle } from 'lucide-react';

interface FormControlProps {
  form: ConversationalForm;
}

export const FormControl: React.FC<FormControlProps> = ({ form }) => {
  const { updateForm } = useFormStore();

  const toggleFormStatus = () => {
    const newStatus: FormStatus = form.status === 'active' ? 'paused' : 'active';
    updateForm(form.id, {
      status: newStatus,
      [newStatus === 'paused' ? 'lastPausedAt' : 'lastResumedAt']: new Date(),
    });
  };

  const isExpired = form.schedule?.endDate && new Date() > new Date(form.schedule.endDate);
  
  // Calculate completion rate
  const completionRate = form.analytics?.totalViews && form.analytics.totalViews > 0
    ? ((form.analytics.totalResponses / form.analytics.totalViews) * 100).toFixed(1)
    : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Status Badge */}
      <div className="flex justify-between items-center mb-3">
        {/* <Badge
          themeColor={
            isExpired ? "error" : 
            form.status === 'active' ? "success" : "warning"
          }
          className="px-2.5 py-1 text-xs font-medium rounded-full"
        >
          {isExpired ? "Expired" : form.status === 'active' ? "Active" : "Paused"}
        </Badge> */}
        
        {/* Control Button */}
        {!isExpired && (
          <Button
            onClick={toggleFormStatus}
            variant={form.status === 'active' ? 'outline' : 'default'}
            size="sm"
            className={`flex items-center gap-1.5 px-3 py-1 text-xs ${
              form.status === 'active' 
                ? 'border-red-200 text-red-600 hover:bg-red-50' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {form.status === 'active' ? (
              <>
                <Pause className="h-3 w-3" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-3 w-3" />
                Resume
              </>
            )}
          </Button>
        )}
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-white rounded-md border border-gray-100 shadow-sm p-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1">
            <Users className="h-3 w-3" />
            Views
          </div>
          <p className="text-lg font-bold">{form.analytics?.totalViews || 0}</p>
        </div>
        
        <div className="bg-white rounded-md border border-gray-100 shadow-sm p-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1">
            <CheckCircle className="h-3 w-3" />
            Responses
          </div>
          <p className="text-lg font-bold">{form.analytics?.totalResponses || 0}</p>
        </div>
        
        <div className="bg-white rounded-md border border-gray-100 shadow-sm p-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1">
            <BarChart className="h-3 w-3" />
            Completion
          </div>
          <p className="text-lg font-bold">{completionRate}%</p>
        </div>
      </div>

      {/* Chart Section */}
      {form.analytics?.responseHistory && form.analytics.responseHistory.length > 0 ? (
        <div className="flex-grow bg-white border border-gray-100 rounded-md shadow-sm p-2 mb-2">
          <div className="h-28">
            <Chart>
              <ChartSeries>
                <ChartSeriesItem
                  type="line"
                  data={form.analytics.responseHistory}
                  name="Responses"
                  color="#4338ca"
                  style={{
                    line: {
                      width: 2
                    }
                  }}
                />
              </ChartSeries>
            </Chart>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center bg-gray-50 border border-gray-100 rounded-md p-2 mb-2">
          <p className="text-xs text-gray-400 italic">No response data available</p>
        </div>
      )}

      {/* Expiration Notice */}
      {form.schedule?.endDate && (
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-amber-50 border border-amber-100 rounded-md text-xs text-amber-700">
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span>
            {isExpired 
              ? `Expired on ${new Date(form.schedule.endDate).toLocaleDateString()}`
              : `Expires on ${new Date(form.schedule.endDate).toLocaleDateString()}`
            }
          </span>
        </div>
      )}
    </div>
  );
};