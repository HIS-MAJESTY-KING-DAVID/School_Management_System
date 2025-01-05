import React, { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { QrReader } from 'react-qr-reader';

const QRCodeScanner = ({ onDetected }) => {
  const [error, setError] = useState(null);

  const handleScan = (result) => {
    if (result) {
      onDetected(result?.text);
    }
  };

  const handleError = (err) => {
    console.error(err);
    setError('Error accessing camera');
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        QR Code Scanner
      </Typography>
      <Box sx={{ 
        width: '100%', 
        maxWidth: 400, 
        mx: 'auto',
        '& > div': {
          width: '100% !important',
          height: '300px !important',
        }
      }}>
        <QrReader
          constraints={{ facingMode: 'environment' }}
          onResult={handleScan}
          onError={handleError}
          videoStyle={{ width: '100%', height: '100%' }}
        />
      </Box>
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Point your camera at a QR code to scan
      </Typography>
    </Paper>
  );
};

export default QRCodeScanner;
