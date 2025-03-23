import React from 'react';
import { Chart, ChartSeries, ChartSeriesItem } from '@progress/kendo-react-charts';
import { Badge } from '@progress/kendo-react-indicators';
import { Button } from '@/components/ui/button';
import { useFormStore } from '@/utils/formStore';
import { ConversationalForm, FormStatus } from '@/utils/formTypes';
import { Play, Pause, AlertCircle } from 'lucide-react';

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

  const isExpired = form.schedule.endDate && new Date() > new Date(form.schedule.endDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Form Status</h3>
          <p className="text-sm text-muted-foreground">
            Control and monitor your form's availability
          </p>
        </div>
        
        {isExpired ? (
          <Badge themeColor="error">Expired</Badge>
        ) : (
          <Button
            onClick={toggleFormStatus}
            disabled={isExpired}
            variant={form.status === 'active' ? 'destructive' : 'default'}
          >
            {form.status === 'active' ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause Form
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Resume Form
              </>
            )}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <h4 className="text-sm font-medium mb-2">Total Views</h4>
          <p className="text-2xl font-bold">{form.analytics.totalViews}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="text-sm font-medium mb-2">Total Responses</h4>
          <p className="text-2xl font-bold">{form.analytics.totalResponses}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="text-sm font-medium mb-2">Completion Rate</h4>
          <p className="text-2xl font-bold">
            {((form.analytics.totalResponses / form.analytics.totalViews) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {form.schedule.endDate && (
        <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
          <p className="text-sm text-yellow-700">
            This form will expire on{' '}
            {new Date(form.schedule.endDate).toLocaleDateString()}
          </p>
        </div>
      )}

      <div className="h-64">
        <Chart>
          <ChartSeries>
            <ChartSeriesItem
              type="line"
              data={[/* Your analytics data here */]}
              name="Responses"
            />
          </ChartSeries>
        </Chart>
      </div>
    </div>
  );
}; 