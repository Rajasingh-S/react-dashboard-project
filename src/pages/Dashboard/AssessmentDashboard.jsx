// src/pages/Dashboard/AssessmentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, PieChart, Pie, LabelList 
} from 'recharts';
import { FiFilter } from 'react-icons/fi';
import './AssessmentDashboard.css';
import DataTable from '../../components/Table/DataTable';

const AssessmentDashboard = () => {
  const location = useLocation();
  const [data, setData] = useState([]);
  const [selectedManager, setSelectedManager] = useState('All');
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    if (location.state?.data) {
      setData(location.state.data);
      const uniqueManagers = [...new Set(location.state.data.map(item => item.Manager))];
      setManagers(['All', ...uniqueManagers]);
    }
  }, [location.state]);

  const filteredData = selectedManager === 'All' ? data : data.filter(item => item.Manager === selectedManager);

  // Process data for charts
  const scoreData = [...filteredData]
    .sort((a, b) => b['Overall Percentage'] - a['Overall Percentage'])
    .map(item => ({
      name: item.Name,
      score: item['Overall Percentage'],
      type: item['Employee or Intern']
    }));

  const managerAbsenteeData = managers.filter(m => m !== 'All').map(manager => {
    const managerData = data.filter(item => item.Manager === manager);
    return {
      manager,
      present: managerData.filter(item => item['Attendance Status (Present?)'] === 'Yes').length,
      absent: managerData.filter(item => item['Attendance Status (Present?)'] === 'No').length
    };
  });

  const managerEmployeeData = managers.filter(m => m !== 'All').map(manager => {
    const managerData = data.filter(item => item.Manager === manager);
    return {
      manager,
      employees: managerData.filter(item => item['Employee or Intern'] === 'Employee').length,
      interns: managerData.filter(item => item['Employee or Intern'] === 'Intern').length
    };
  });

  const selfInterestData = filteredData
    .filter(item => item['Self-Interested Candidate'] === 'Yes')
    .map(item => ({
      name: item.Name,
      score: item['Overall Percentage'],
      status: item.Status
    }));

  const integrityData = [...filteredData]
    .sort((a, b) => b['Integrity Score (out of 10)'] - a['Integrity Score (out of 10)'])
    .map(item => ({
      name: item.Name,
      integrity: item['Integrity Score (out of 10)'],
      offtab: item['Time Spent Offtab (in secs)']
    }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Assessment Dashboard</h1>
        <div className="filter-container">
          <FiFilter className="filter-icon" />
          <select 
            value={selectedManager} 
            onChange={(e) => setSelectedManager(e.target.value)}
            className="manager-select"
          >
            {managers.map(manager => (
              <option key={manager} value={manager}>{manager}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="charts-grid">
        {/* Overall Scores Chart */}
        <div className="chart-card">
          <h2>Overall Scores</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={scoreData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" name="Score (%)" radius={[0, 4, 4, 0]}>
                {scoreData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.type === 'Employee' ? COLORS[0] : COLORS[1]} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Absentees by Manager */}
        <div className="chart-card">
          <h2>Absentees by Manager</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={managerAbsenteeData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="manager" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" name="Present" stackId="a" fill="#82ca9d" />
              <Bar dataKey="absent" name="Absent" stackId="a" fill="#ff6b6b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Employees by Manager */}
        <div className="chart-card">
          <h2>Employees by Manager</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={managerEmployeeData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="manager" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="employees" name="Employees" stackId="a" fill="#8884d8" />
              <Bar dataKey="interns" name="Interns" stackId="a" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Self Interested Candidates */}
        <div className="chart-card">
          <h2>Self Interested Candidates</h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={selfInterestData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="score"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {selfInterestData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.status.includes('Qualif') ? COLORS[2] : COLORS[3]} 
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Integrity Scores Table */}
        <div className="chart-card full-width">
          <h2>Integrity Scores</h2>
          <div className="table-container">
            <DataTable 
              headers={['Name', 'Integrity Score (out of 10)', 'Time Spent Offtab (in secs)']} 
              data={integrityData.map(item => ({
                'Name': item.name,
                'Integrity Score (out of 10)': item.integrity,
                'Time Spent Offtab (in secs)': item.offtab
              }))} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentDashboard;