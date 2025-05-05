import { scaleOrdinal } from 'd3-scale';
import { schemeTableau10, schemePastel1, schemeSet2 } from 'd3-scale-chromatic';

export const chartColors = {
  primary: '#4e79a7',
  secondary: '#f28e2b',
  tertiary: '#e15759',
  quaternary: '#76b7b2',
  quinary: '#59a14f',
  senary: '#edc948',
  septenary: '#b07aa1',
  octonary: '#ff9da7',
  nonary: '#9c755f',
  denary: '#bab0ac'
};

export const getColorScale = (count, scheme = schemeTableau10) => {
  return scaleOrdinal(scheme).domain(Array(count).fill().map((_, i) => i));
};

export const chartTheme = {
  background: '#ffffff',
  textColor: '#333333',
  fontSize: 12,
  axis: {
    domain: {
      line: {
        stroke: '#777777',
        strokeWidth: 1
      }
    },
    ticks: {
      line: {
        stroke: '#777777',
        strokeWidth: 1
      },
      text: {
        fill: '#333333',
        fontSize: 11
      }
    }
  },
  grid: {
    line: {
      stroke: '#dddddd',
      strokeWidth: 1
    }
  },
  legends: {
    text: {
      fontSize: 12
    }
  },
  tooltip: {
    container: {
      background: '#ffffff',
      color: '#333333',
      fontSize: '14px',
      borderRadius: '4px',
      boxShadow: '0 3px 9px rgba(0, 0, 0, 0.15)'
    }
  }
};

export const barChartStyles = {
  borderRadius: 4,
  borderWidth: 0,
  borderColor: { from: 'color', modifiers: [['darker', 1.6]] },
  enableLabel: false,
  labelSkipWidth: 12,
  labelSkipHeight: 12,
  labelTextColor: { from: 'color', modifiers: [['darker', 1.6]] }
};

export const tableStyles = {
  header: {
    backgroundColor: '#f8f9fa',
    color: '#495057',
    fontWeight: 600,
    borderBottom: '1px solid #dee2e6'
  },
  row: {
    '&:nth-of-type(even)': {
      backgroundColor: '#f8f9fa'
    },
    '&:hover': {
      backgroundColor: '#e9ecef'
    }
  },
  cell: {
    borderBottom: '1px solid #dee2e6',
    padding: '12px 16px'
  }
};