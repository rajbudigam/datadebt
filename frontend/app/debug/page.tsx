"use client";
import { useState } from "react";

export default function Debug() {
  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_BASE_URL || 'undefined');
  const [result, setResult] = useState('');
  
  const testApi = async () => {
    try {
      console.log('Testing API at:', apiUrl);
      setResult('Testing...');
      
      const response = await fetch(`${apiUrl}/health`);
      console.log('Response:', response);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Data:', data);
      setResult('API Response: ' + JSON.stringify(data));
    } catch (error) {
      console.error('API Error:', error);
      setResult('API Error: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const testScan = async () => {
    try {
      console.log('Testing scan at:', apiUrl);
      setResult('Testing scan...');
      
      const response = await fetch(`${apiUrl}/scan/ckan?portal=https://catalog.data.gov&query=water&rows=1`, {
        method: 'POST'
      });
      console.log('Scan response:', response);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Scan data:', data);
      setResult('Scan Response: ' + JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Scan Error:', error);
      setResult('Scan Error: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold text-white">Debug Page</h1>
      <div>
        <p className="text-white">API URL: {apiUrl}</p>
        <p className="text-white">NODE_ENV: {process.env.NODE_ENV}</p>
      </div>
      <div className="space-x-4">
        <button 
          onClick={testApi}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Health API
        </button>
        <button 
          onClick={testScan}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Scan API
        </button>
      </div>
      <div className="bg-gray-800 p-4 rounded text-white whitespace-pre-wrap">
        {result}
      </div>
    </div>
  );
}
