import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import QRGenerator from './QRGenerator';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<QRGenerator />);
