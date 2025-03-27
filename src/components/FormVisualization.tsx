import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, Pie, Line, Area, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { BarChart, PieChart, LineChart, AreaChart, ScatterChart } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, BarChart2, PieChart as PieChartIcon, LineChart as LineChartIcon, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

interface FormVisualizationProps {
  onAddVisualization: (visualization: {
    id: string;
    type: 'bar' | 'pie' | 'line' | 'area' | 'scatter';
    title: string;
    data: Array<Record<string, any>>;
    config: Record<string, any>;
  }) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const sampleData = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 },
  { name: 'Group D', value: 200 },
];

const timeSeriesData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
];

const scatterData = [
  { x: 100, y: 200, z: 200 },
  { x: 120, y: 100, z: 260 },
  { x: 170, y: 300, z: 400 },
  { x: 140, y: 250, z: 280 },
  { x: 150, y: 400, z: 500 },
  { x: 110, y: 280, z: 200 },
];

const FormVisualization: React.FC<FormVisualizationProps> = ({ onAddVisualization }) => {
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line' | 'area' | 'scatter'>('bar');
  const [chartTitle, setChartTitle] = useState('');
  const [dataItems, setDataItems] = useState(sampleData);
  const [newItemName, setNewItemName] = useState('');
  const [newItemValue, setNewItemValue] = useState('');
  
  const handleAddDataItem = () => {
    if (!newItemName.trim() || !newItemValue.trim()) return;
    
    const value = parseFloat(newItemValue);
    if (isNaN(value)) return;
    
    setDataItems([...dataItems, { name: newItemName, value }]);
    setNewItemName('');
    setNewItemValue('');
  };
  
  const handleRemoveDataItem = (index: number) => {
    const newData = [...dataItems];
    newData.splice(index, 1);
    setDataItems(newData);
  };
  
  const handleAddVisualization = () => {
    const title = chartTitle.trim() || `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`;
    
    let data;
    if (chartType === 'line' || chartType === 'area') {
      data = timeSeriesData;
    } else if (chartType === 'scatter') {
      data = scatterData;
    } else {
      data = dataItems;
    }
    
    onAddVisualization({
      id: uuidv4(),
      type: chartType,
      title,
      data,
      config: {
        showLegend: true,
        showGrid: true,
        showTooltip: true,
      }
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add Visualization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Chart Title</label>
          <Input
            value={chartTitle}
            onChange={(e) => setChartTitle(e.target.value)}
            placeholder="Enter chart title"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Chart Type</label>
          <Tabs value={chartType} onValueChange={(value) => setChartType(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="bar" className="flex items-center gap-1">
                <BarChart2 className="h-3 w-3" />
                Bar
              </TabsTrigger>
              <TabsTrigger value="pie" className="flex items-center gap-1">
                <PieChartIcon className="h-3 w-3" />
                Pie
              </TabsTrigger>
              <TabsTrigger value="line" className="flex items-center gap-1">
                <LineChartIcon className="h-3 w-3" />
                Line
              </TabsTrigger>
              <TabsTrigger value="area" className="flex items-center gap-1">
                <LineChartIcon className="h-3 w-3" />
                Area
              </TabsTrigger>
              <TabsTrigger value="scatter" className="flex items-center gap-1">
                <Settings className="h-3 w-3" />
                Scatter
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="border rounded-md p-4">
          <div className="h-64">
            <ChartContainer
              config={{
                name: { label: "Category" },
                value: { label: "Value" },
                x: { label: "X" },
                y: { label: "Y" },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' && (
                  <BarChart data={dataItems}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="#8884d8">
                      {dataItems.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
                
                {chartType === 'pie' && (
                  <PieChart>
                    <Pie
                      data={dataItems}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {dataItems.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent />} />
                  </PieChart>
                )}
                
                {chartType === 'line' && (
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                )}
                
                {chartType === 'area' && (
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                )}
                
                {chartType === 'scatter' && (
                  <ScatterChart>
                    <CartesianGrid />
                    <XAxis type="number" dataKey="x" name="X" />
                    <YAxis type="number" dataKey="y" name="Y" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ChartTooltipContent />} />
                    <Scatter name="Values" data={scatterData} fill="#8884d8">
                      {scatterData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                )}
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
        
        {(chartType === 'bar' || chartType === 'pie') && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Data Items</h4>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {dataItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1 text-sm">{item.name}</div>
                  <div className="text-sm font-medium">{item.value}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemoveDataItem(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <Input
                placeholder="Item name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Value"
                type="number"
                value={newItemValue}
                onChange={(e) => setNewItemValue(e.target.value)}
                className="w-24"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddDataItem}
                className="shrink-0"
              >
                <PlusCircle className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
          </div>
        )}
        
        <Button
          onClick={handleAddVisualization}
          className="w-full"
        >
          Add to Form
        </Button>
      </CardContent>
    </Card>
  );
};

export default FormVisualization; 