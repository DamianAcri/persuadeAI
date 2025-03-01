// app/ai/analysis/components/ResultsDisplay.tsx

"use client";

import { useState } from 'react';

interface AnalysisResult {
  strengths: string[];
  weaknesses: string[];
  tips: string[];
  overall: string;
  score: number;
}

interface ResultsDisplayProps {
  result: AnalysisResult;
}

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'strengths' | 'weaknesses' | 'tips'>('overview');
  
  // Función para determinar el color de la puntuación
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Función para determinar el ancho de la barra de progreso
  const getProgressWidth = (score: number) => {
    return `${score * 10}%`;
  };
  
  return (
    <div className="mt-8 border rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b p-4">
        <h3 className="text-xl font-semibold">Analysis Results</h3>
      </div>
      
      {/* Scorecard */}
      <div className="p-6 border-b bg-white">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="mb-4 md:mb-0 md:mr-6 flex-1">
            <h4 className="text-lg font-medium mb-2">Overall Assessment</h4>
            <p className="text-gray-700">{result.overall}</p>
          </div>
          
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-500 mb-1">Persuasion Score</span>
            <span className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
              {result.score}/10
            </span>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-gray-50 border-b">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('strengths')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'strengths'
                ? 'border-b-2 border-green-500 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Strengths ({result.strengths.length})
          </button>
          <button
            onClick={() => setActiveTab('weaknesses')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'weaknesses'
                ? 'border-b-2 border-red-500 text-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Areas for Improvement ({result.weaknesses.length})
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'tips'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Tips ({result.tips.length})
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      <div className="p-6 bg-white">
        {activeTab === 'overview' && (
          <div>
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2">Persuasion Score Breakdown</h4>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div 
                  className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" 
                  style={{ width: getProgressWidth(result.score) }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Poor (1-3)</span>
                <span>Average (4-6)</span>
                <span>Good (7-8)</span>
                <span>Excellent (9-10)</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h5 className="font-medium text-green-700 mb-2">Key Strengths</h5>
                <ul className="space-y-1">
                  {result.strengths.slice(0, 3).map((strength, index) => (
                    <li key={index} className="text-sm text-gray-700 flex">
                      <span className="text-green-500 mr-2">✓</span>
                      {strength}
                    </li>
                  ))}
                  {result.strengths.length > 3 && (
                    <li className="text-sm text-blue-600 mt-2">
                      <button 
                        onClick={() => setActiveTab('strengths')}
                        className="hover:underline"
                      >
                        View all {result.strengths.length} strengths
                      </button>
                    </li>
                  )}
                </ul>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <h5 className="font-medium text-red-700 mb-2">Areas to Improve</h5>
                <ul className="space-y-1">
                  {result.weaknesses.slice(0, 3).map((weakness, index) => (
                    <li key={index} className="text-sm text-gray-700 flex">
                      <span className="text-red-500 mr-2">!</span>
                      {weakness}
                    </li>
                  ))}
                  {result.weaknesses.length > 3 && (
                    <li className="text-sm text-blue-600 mt-2">
                      <button 
                        onClick={() => setActiveTab('weaknesses')}
                        className="hover:underline"
                      >
                        View all {result.weaknesses.length} areas
                      </button>
                    </li>
                  )}
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h5 className="font-medium text-blue-700 mb-2">Top Tips</h5>
                <ul className="space-y-1">
                  {result.tips.slice(0, 3).map((tip, index) => (
                    <li key={index} className="text-sm text-gray-700 flex">
                      <span className="text-blue-500 mr-2">→</span>
                      {tip}
                    </li>
                  ))}
                  {result.tips.length > 3 && (
                    <li className="text-sm text-blue-600 mt-2">
                      <button 
                        onClick={() => setActiveTab('tips')}
                        className="hover:underline"
                      >
                        View all {result.tips.length} tips
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'strengths' && (
          <div>
            <h4 className="font-medium text-green-700 mb-4">Strengths</h4>
            <ul className="space-y-2">
              {result.strengths.map((strength, index) => (
                <li key={index} className="p-3 bg-green-50 rounded-lg border border-green-100 text-gray-700 flex">
                  <span className="text-green-500 mr-2">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {activeTab === 'weaknesses' && (
          <div>
            <h4 className="font-medium text-red-700 mb-4">Areas for Improvement</h4>
            <ul className="space-y-2">
              {result.weaknesses.map((weakness, index) => (
                <li key={index} className="p-3 bg-red-50 rounded-lg border border-red-100 text-gray-700 flex">
                  <span className="text-red-500 mr-2">!</span>
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {activeTab === 'tips' && (
          <div>
            <h4 className="font-medium text-blue-700 mb-4">Tips for Improvement</h4>
            <ul className="space-y-2">
              {result.tips.map((tip, index) => (
                <li key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-gray-700 flex">
                  <span className="text-blue-500 mr-2">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}