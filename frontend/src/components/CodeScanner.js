import React, { useState } from 'react';
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useZxing } from 'react-zxing';

const CodeScanner = ({ onDetected }) => {
  const [scannerType, setScannerType] = useState('qr'); // 'qr' or 'barcode'
  const [error, setError] = useState(null);

  const { ref } = useZxing({
    onDecodeResult(result) {
      onDetected(result.getText());
    },
    onError(error) {
      console.error(error);
      setError('Error accessing camera');
    },
  });

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Code Scanner
      </Typography>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Scanner Type</InputLabel>
        <Select
          value={scannerType}
          label="Scanner Type"
          onChange={(e) => setScannerType(e.target.value)}
        >
          <MenuItem value="qr">QR Code</MenuItem>
          <MenuItem value="barcode">Barcode</MenuItem>
        </Select>
      </FormControl>

      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          height: 300,
          mx: 'auto',
          position: 'relative',
          overflow: 'hidden',
          '& > video': {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          },
        }}
      >
        <video ref={ref} />
      </Box>

      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Point your camera at a {scannerType === 'qr' ? 'QR code' : 'barcode'} to scan
      </Typography>
    </Paper>
  );
};

export default CodeScanner;
