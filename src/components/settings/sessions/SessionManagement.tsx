
import React from 'react';
import { SessionsList } from './SessionsList';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const SessionManagement = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Session Management</CardTitle>
        <CardDescription>Manage your active sessions across devices</CardDescription>
      </CardHeader>
      <CardContent>
        <SessionsList />
      </CardContent>
    </Card>
  );
};

