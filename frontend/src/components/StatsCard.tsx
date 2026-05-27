import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';

interface StatsCardProps {
  title: string;
  count: number | string;
  icon: React.ReactNode;
  isAlarm?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  count,
  icon,
  isAlarm = false
}) => {
  return (
    <Card 
      sx={{ 
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        animation: isAlarm ? 'pulse 2s infinite' : 'none',
        '@keyframes pulse': {
          '0%': { boxShadow: '0 0 0 0px rgba(244, 63, 94, 0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(244, 63, 94, 0)' },
          '100%': { boxShadow: '0 0 0 0px rgba(244, 63, 94, 0)' }
        },
        ...(isAlarm && {
          borderColor: 'error.main',
          bgcolor: 'rgba(244, 63, 94, 0.03)'
        })
      }}
    >
      <CardContent 
        sx={{ 
          p: 3, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          height: '100%', 
          width: '100%',
          '&:last-child': { pb: 3 } // Overriding MUI extra padding on last-child
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="h1" sx={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}>
            {count}
          </Typography>
        </Box>
        <Box 
          sx={{ 
            p: 1.25, 
            borderRadius: 3, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: isAlarm ? 'rgba(244, 63, 94, 0.12)' : 'action.hover'
          }}
        >
          {icon}
        </Box>
      </CardContent>
    </Card>
  );
};
