import { schemeCategory10, schemePastel2, schemeSet3 } from 'd3-scale-chromatic';

export const generateUniqueColors = (count, alpha = 0.8) => {
  const colors = [];
  const schemes = [schemeCategory10, schemePastel2, schemeSet3];
  const schemeIndex = Math.floor(Math.random() * schemes.length);
  
  for (let i = 0; i < count; i++) {
    const hue = (i * 360 / count) % 360;
    const saturation = 70 + Math.random() * 20;
    const lightness = 50 + Math.random() * 10;
    colors.push(`hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`);
  }
  return colors;
};

export const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('');
};

export const getRandomColorFromScheme = (index) => {
  const schemes = [schemeCategory10, schemePastel2, schemeSet3];
  const schemeIndex = index % schemes.length;
  const colorIndex = Math.floor(index / schemes.length) % schemes[schemeIndex].length;
  return schemes[schemeIndex][colorIndex];
};

export const getColorForValue = (value, maxValue) => {
  const ratio = value / maxValue;
  const hue = (1 - ratio) * 120;
  return `hsl(${hue}, 70%, 50%)`;
};