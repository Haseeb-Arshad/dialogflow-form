import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Trash2, Vote, BarChart2, PieChartIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

interface FormPollProps {
  onAddPoll: (poll: {
    id: string;
    question: string;
    options: string[];
    allowMultipleSelections: boolean;
    displayType: 'bar' | 'pie';
  }) => void;
}

const FormPoll: React.FC<FormPollProps> = ({ onAddPoll }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [allowMultipleSelections, setAllowMultipleSelections] = useState(false);
  const [displayType, setDisplayType] = useState<'bar' | 'pie'>('bar');
  
  const handleAddOption = () => {
    setOptions([...options, '']);
  };
  
  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return; // Minimum 2 options
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };
  
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  
  const handleAddPoll = () => {
    if (!question.trim()) return;
    
    // Filter out empty options
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) return;
    
    onAddPoll({
      id: uuidv4(),
      question,
      options: validOptions,
      allowMultipleSelections,
      displayType
    });
    
    // Reset form
    setQuestion('');
    setOptions(['', '']);
    setAllowMultipleSelections(false);
    setDisplayType('bar');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add Poll</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Poll Question</label>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your poll question"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Options</label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                {options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleRemoveOption(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddOption}
              className="w-full mt-2"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add Option
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Poll Settings</label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="multipleSelections"
              checked={allowMultipleSelections}
              onChange={(e) => setAllowMultipleSelections(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="multipleSelections" className="text-sm">
              Allow multiple selections
            </label>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Results Display</label>
          <Tabs value={displayType} onValueChange={(value) => setDisplayType(value as 'bar' | 'pie')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bar" className="flex items-center gap-1">
                <BarChart2 className="h-3 w-3" />
                Bar Chart
              </TabsTrigger>
              <TabsTrigger value="pie" className="flex items-center gap-1">
                <PieChartIcon className="h-3 w-3" />
                Pie Chart
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <Button
          onClick={handleAddPoll}
          className="w-full"
          disabled={!question.trim() || options.filter(o => o.trim()).length < 2}
        >
          <Vote className="h-4 w-4 mr-1" />
          Add Poll to Form
        </Button>
      </CardContent>
    </Card>
  );
};

export default FormPoll; 