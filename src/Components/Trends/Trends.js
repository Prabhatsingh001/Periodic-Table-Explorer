import React, { useState, useMemo } from 'react';
import ChartComponent from './ChartComponent';
import { getTrendData, propertyKeys, propertyLabels } from './utils';
import { exportJson, exportCsv } from '../../utils/exportData';
import './Trends.css';

const Trends = () => {
  const [property, setProperty] = useState('electronegativity');
  const [viewMode, setViewMode] = useState('period');
  const [selectedValue, setSelectedValue] = useState('2');

  const chartDataArray = useMemo(() => {
    return getTrendData(propertyKeys[property], viewMode, selectedValue);
  }, [property, viewMode, selectedValue]);

  const handleModeChange = (e) => {
    const newMode = e.target.value;
    setViewMode(newMode);
    // Reset selected value to a valid default for the new mode
    if (newMode === 'period') setSelectedValue('2');
    if (newMode === 'group') setSelectedValue('1');
  };

  const exportRows = chartDataArray.map((item) => ({
    atomicNumber: item.element.number,
    symbol: item.element.symbol,
    name: item.element.name,
    category: item.element.category,
    period: item.element.period,
    group: item.element.group,
    value: item.value,
    valueLabel: propertyLabels[property],
  }));

  const trendMeta = {
    generatedAt: new Date().toISOString(),
    property: propertyLabels[property],
    propertyKey: propertyKeys[property],
    viewMode,
    selectedValue,
  };

  const handleExportTrendJson = () => {
    exportJson(
      `trends-${property}-${viewMode}-${selectedValue}-${Date.now()}`,
      { metadata: trendMeta, data: exportRows }
    );
  };

  const handleExportTrendCsv = () => {
    exportCsv(
      `trends-${property}-${viewMode}-${selectedValue}-${Date.now()}`,
      exportRows,
      [
        { key: 'atomicNumber', label: 'Atomic Number' },
        { key: 'symbol', label: 'Symbol' },
        { key: 'name', label: 'Name' },
        { key: 'category', label: 'Category' },
        { key: 'period', label: 'Period' },
        { key: 'group', label: 'Group' },
        { key: 'value', label: propertyLabels[property] },
      ]
    );
  };

  return (
    <div className="trends-container">
      <div className="trends-header">
        <h2 className="trends-title">Interactive Trends Visualization</h2>
        <p className="trends-subtitle">
          Explore how elemental properties change across periods and groups
        </p>
      </div>

      <div className="trends-controls">
        <div className="control-group">
          <label htmlFor="property-select">Property</label>
          <select 
            id="property-select"
            value={property} 
            onChange={(e) => setProperty(e.target.value)}
            className="trends-select"
          >
            <option value="electronegativity">Electronegativity</option>
            <option value="ionization">1st Ionization Energy</option>
            <option value="mass">Atomic Mass</option>
            <option value="density">Density</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="mode-select">View By</label>
          <select 
            id="mode-select"
            value={viewMode} 
            onChange={handleModeChange}
            className="trends-select"
          >
            <option value="period">Period</option>
            <option value="group">Group</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="value-select">
            {viewMode === 'period' ? 'Select Period' : 'Select Group'}
          </label>
          <select 
            id="value-select"
            value={selectedValue} 
            onChange={(e) => setSelectedValue(e.target.value)}
            className="trends-select"
          >
            {viewMode === 'period' 
              ? [1, 2, 3, 4, 5, 6, 7].map(num => (
                  <option key={num} value={num}>Period {num}</option>
                ))
              : Array.from({length: 18}, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>Group {num}</option>
                ))
            }
          </select>
        </div>
      </div>

      <div className="trends-actions">
        <span className="trends-action-label">Export current trend data</span>
        <button className="trends-export-btn" onClick={handleExportTrendJson} type="button">
          Export JSON
        </button>
        <button className="trends-export-btn" onClick={handleExportTrendCsv} type="button">
          Export CSV
        </button>
      </div>

      <div className="chart-wrapper">
        <ChartComponent 
          dataItemArray={chartDataArray} 
          propertyLabel={propertyLabels[property]} 
        />
      </div>
    </div>
  );
};

export default Trends;
