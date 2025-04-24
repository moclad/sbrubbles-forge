'use client';
import { Button } from '@repo/design-system/components/ui/button';
import { toast } from '@repo/design-system/components/ui/sonner';

export const Dashboard = () => {
  return (
    <Button onClick={() => toast.error('Test')}>This is just a button</Button>
  );
};
