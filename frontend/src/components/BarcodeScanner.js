import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Quagga from 'quagga';

const BarcodeScanner = ({ onDetected }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    if (scannerRef.current) {
      Quagga.init(
        {
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: scannerRef.current,
            constraints: {
              facingMode: 'environment',
            },
          },
          decoder: {
            readers: [
              'ean_reader',
              'ean_8_reader',
              'code_128_reader',
              'code_39_reader',
              'upc_reader',
              'upc_e_reader',
            ],
          },
        },
        (err) => {
          if (err) {
            console.error('Error initializing Quagga:', err);
            return;
          }
          Quagga.start();
        }
      );

      Quagga.onDetected((result) => {
        if (result.codeResult.code) {
          onDetected(result.codeResult.code);
        }
      });

      return () => {
        Quagga.stop();
      };
    }
  }, [onDetected]);

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Barcode Scanner
      </Typography>
      <Box
        ref={scannerRef}
        sx={{
          width: '100%',
          height: 300,
          position: 'relative',
          overflow: 'hidden',
          '& > video': {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          },
        }}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Point your camera at a barcode to scan
      </Typography>
    </Paper>
  );
};

export default BarcodeScanner;
