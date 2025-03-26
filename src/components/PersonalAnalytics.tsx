import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface PersonalAnalyticsProps {
  userResponses: Array<{
    questionId: string;
    question: string;
    answer: string;
    category?: string;
  }>;
  aggregatedData: {
    totalResponses: number;
    averageCompletionTime: number;
    responseDistribution: Array<{
      category: string;
      count: number;
      percentage: number;
      color: string;
    }>;
    popularAnswers: Array<{
      question: string;
      answers: Array<{
        text: string;
        count: number;
      }>;
    }>;
  };
}

const PersonalAnalytics: React.FC<PersonalAnalyticsProps> = ({
  userResponses,
  aggregatedData,
}) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Response Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Questions Answered</p>
                <p className="text-2xl font-bold">{userResponses.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Completion Time</p>
                <p className="text-2xl font-bold">{Math.round(aggregatedData.averageCompletionTime / 60)} min</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Participants</p>
                <p className="text-2xl font-bold">{aggregatedData.totalResponses}</p>
              </div>
            </div>
            
            <div className="h-64">
              <ChartContainer
                config={{
                  category: { label: "Category" },
                  value: { label: "Value" },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={aggregatedData.responseDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                      nameKey="category"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {aggregatedData.responseDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How Your Answers Compare</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {aggregatedData.popularAnswers.map((item, index) => (
                <div key={index}>
                  <h3 className="text-sm font-medium mb-2">{item.question}</h3>
                  <div className="h-48">
                    <ChartContainer
                      config={{
                        answer: { label: "Answer" },
                        count: { label: "Count" },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={item.answers}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <XAxis dataKey="text" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PersonalAnalytics; 