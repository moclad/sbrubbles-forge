'use client';

import type { SelectFailedMessage } from '@repo/database/db/schema';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import { toast } from '@repo/design-system/components/ui/sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/design-system/components/ui/table';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useState, useTransition } from 'react';
import { retryFailedMessage } from '@/lib/failed-messages-actions';

type FailedMessagesTableProps = {
  initialMessages: SelectFailedMessage[];
};

export function FailedMessagesTable({ initialMessages }: FailedMessagesTableProps) {
  const [messages, setMessages] = useState<SelectFailedMessage[]>(initialMessages);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleRetry = (messageId: string) => {
    setRetrying(messageId);
    startTransition(async () => {
      try {
        const summary = await retryFailedMessage(messageId);
        toast.success(summary);
        // Remove from list
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to retry message');
      } finally {
        setRetrying(null);
      }
    });
  };

  if (messages.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center p-12 text-center'>
        <CheckCircle className='mb-4 h-12 w-12 text-green-500' />
        <h3 className='mb-2 font-medium text-lg'>No failed messages</h3>
        <p className='text-muted-foreground'>All messages have been processed successfully.</p>
      </div>
    );
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Message</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Error</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className='text-right'>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((message) => (
            <TableRow key={message.id}>
              <TableCell className='max-w-md font-medium'>
                <div className='truncate'>{message.messageText}</div>
              </TableCell>
              <TableCell>
                <Badge variant='outline'>{message.source.replace('_', ' ')}</Badge>
              </TableCell>
              <TableCell className='max-w-xs'>
                <div className='flex items-start gap-2'>
                  <AlertCircle className='mt-0.5 h-4 w-4 shrink-0 text-destructive' />
                  <span className='line-clamp-2 text-muted-foreground text-sm'>{message.errorMessage}</span>
                </div>
              </TableCell>
              <TableCell className='text-muted-foreground text-sm'>
                {new Date(message.createdAt).toLocaleString()}
              </TableCell>
              <TableCell className='text-right'>
                <Button
                  disabled={retrying === message.id}
                  onClick={() => handleRetry(message.id)}
                  size='sm'
                  variant='outline'
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${retrying === message.id ? 'animate-spin' : ''}`} />
                  Retry
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
