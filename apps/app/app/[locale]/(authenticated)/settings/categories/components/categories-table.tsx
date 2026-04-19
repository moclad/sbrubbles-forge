'use client';

import type { SelectCategory } from '@repo/database/db/schema';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/design-system/components/ui/alert-dialog';
import { Button } from '@repo/design-system/components/ui/button';
import { toast } from '@repo/design-system/components/ui/sonner';
import { useI18n } from '@repo/localization/i18n/client';
import type { ColumnDef } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { createCategory, deleteCategory, updateCategory } from '@/lib/categories-actions';
import { CategoryFormDialog } from './category-form-dialog';
import { getIconComponent } from './icon-picker';

type CategoriesTableProps = {
  categories: SelectCategory[];
};

type CategoryFormData = {
  name: string;
  description?: string;
  icon: string;
  color: string;
};

export function CategoriesTable({ categories }: Readonly<CategoriesTableProps>) {
  const t = useI18n();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<SelectCategory | null>(null);
  const [createKey, setCreateKey] = useState(0);

  const handleCreate = async (data: CategoryFormData) => {
    try {
      await createCategory(data);
      toast.success(t('categories.createSuccess'));
    } catch {
      toast.error(t('categories.createError'));
    }
  };

  const handleUpdate = async (data: CategoryFormData) => {
    if (!editing) {
      return;
    }
    try {
      await updateCategory(editing.id, data);
      toast.success(t('categories.updateSuccess'));
      setEditing(null);
    } catch {
      toast.error(t('categories.updateError'));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }
    try {
      await deleteCategory(deleteId);
      toast.success(t('categories.deleteSuccess'));
    } catch {
      toast.error(t('categories.deleteError'));
    } finally {
      setDeleteId(null);
    }
  };

  const openEdit = useCallback((row: SelectCategory) => {
    setEditing(row);
    setFormOpen(true);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setCreateKey((k) => k + 1);
    setFormOpen(true);
  };

  const columns = useMemo<ColumnDef<SelectCategory>[]>(
    () => [
      {
        cell: ({ row }) => {
          const Icon = getIconComponent(row.original.icon);
          return (
            <span
              className='inline-flex h-7 w-7 items-center justify-center rounded-md'
              style={{
                backgroundColor: `${row.original.color}20`,
                color: row.original.color,
              }}
            >
              <Icon size={16} />
            </span>
          );
        },
        header: t('categories.columns.icon'),
        id: 'icon',
        size: 64,
      },
      {
        accessorKey: 'name',
        cell: ({ getValue }) => <span className='font-medium'>{getValue<string>()}</span>,
        header: t('categories.columns.name'),
      },
      {
        accessorKey: 'description',
        cell: ({ getValue }) => <span className='text-muted-foreground'>{getValue<string | null>() ?? '—'}</span>,
        header: t('categories.columns.description'),
      },
      {
        cell: ({ row }) => (
          <div className='flex justify-end gap-1'>
            <Button className='h-7 w-7' onClick={() => openEdit(row.original)} size='icon' variant='ghost'>
              <Pencil size={14} />
            </Button>
            <Button
              className='h-7 w-7 text-destructive hover:text-destructive'
              onClick={() => setDeleteId(row.original.id)}
              size='icon'
              variant='ghost'
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ),
        header: () => <span className='flex justify-end'>{t('categories.columns.actions')}</span>,
        id: 'actions',
        size: 96,
      },
    ],
    [t, openEdit]
  );

  const table = useReactTable({
    columns,
    data: categories,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-end'>
        <Button onClick={openCreate} size='sm'>
          <Plus size={16} />
          {t('categories.newCategory')}
        </Button>
      </div>

      {table.getRowCount() === 0 ? (
        <div className='rounded-lg border border-dashed py-12 text-center text-muted-foreground text-sm'>
          {t('categories.empty')}
        </div>
      ) : (
        <div className='overflow-hidden rounded-lg border'>
          <table className='w-full text-sm'>
            <thead className='border-b bg-muted/50'>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      className='px-4 py-3 text-left font-medium text-muted-foreground'
                      key={header.id}
                      style={{
                        width: header.getSize() === 150 ? undefined : header.getSize(),
                      }}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr className='border-b transition-colors last:border-0 hover:bg-muted/30' key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td className='px-4 py-3' key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CategoryFormDialog
        initialData={editing ?? undefined}
        key={editing ? editing.id : `create-${createKey}`}
        onOpenChange={(next) => {
          setFormOpen(next);
          if (!next) {
            setEditing(null);
          }
        }}
        onSubmit={editing ? handleUpdate : handleCreate}
        open={formOpen}
      />

      <AlertDialog onOpenChange={(open) => !open && setDeleteId(null)} open={Boolean(deleteId)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('categories.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('categories.deleteDialog.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('categories.deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={handleDelete}
              variant='destructive'
            >
              {t('categories.deleteDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
