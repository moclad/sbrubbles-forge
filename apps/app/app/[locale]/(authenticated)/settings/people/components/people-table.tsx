'use client';

import type { SelectPerson } from '@repo/database/db/schema';
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
import { Input } from '@repo/design-system/components/ui/input';
import { toast } from '@repo/design-system/components/ui/sonner';
import { useI18n } from '@repo/localization/i18n/client';
import type { ColumnDef } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  createPerson,
  deletePerson,
  updatePerson,
  uploadPersonAvatar,
} from '@/lib/people-actions';

type PeopleTableMeta = {
  draft: Draft;
  editingId: string | 'new' | null;
  handleCancel: () => void;
  handleSave: () => Promise<void>;
  setDeleteId: (id: string) => void;
  setDraft: Dispatch<SetStateAction<Draft>>;
  startEdit: (person: SelectPerson) => void;
};

type Draft = {
  avatarUrl: string | null;
  name: string;
  pendingFile: File | null;
  previewUrl: string | null;
};

const INITIAL_DRAFT: Draft = {
  avatarUrl: null,
  name: '',
  pendingFile: null,
  previewUrl: null,
};

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 55%, 50%)`;
}

type AvatarDisplayProps = {
  avatarUrl: string | null;
  name: string;
  size?: number;
};

function AvatarDisplay({ avatarUrl, name, size = 32 }: AvatarDisplayProps) {
  const initials = getInitials(name || '?');
  const bg = stringToColor(name || '?');
  if (avatarUrl) {
    return (
      <Image
        alt={name}
        className='rounded-full object-cover'
        height={size}
        src={avatarUrl}
        width={size}
      />
    );
  }
  return (
    <div
      className='flex items-center justify-center rounded-full font-semibold text-white text-xs'
      style={{ backgroundColor: bg, height: size, width: size }}
    >
      {initials}
    </div>
  );
}

type AvatarEditProps = {
  draft: Draft;
  setDraft: Dispatch<SetStateAction<Draft>>;
};

function AvatarEdit({ draft, setDraft }: AvatarEditProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    if (draft.previewUrl) {
      URL.revokeObjectURL(draft.previewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    setDraft((d) => ({ ...d, pendingFile: file, previewUrl }));
  };

  const displayUrl = draft.previewUrl ?? draft.avatarUrl;

  return (
    <button
      className='group relative cursor-pointer rounded-full'
      onClick={() => fileRef.current?.click()}
      title='Change avatar'
      type='button'
    >
      <AvatarDisplay avatarUrl={displayUrl} name={draft.name} size={32} />
      <div className='absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
        <span className='text-white text-xs'>✎</span>
      </div>
      <input
        accept='image/*'
        className='hidden'
        onChange={handleFileChange}
        ref={fileRef}
        type='file'
      />
    </button>
  );
}

type PeopleTableProps = {
  people: SelectPerson[];
};

export function PeopleTable({ people }: Readonly<PeopleTableProps>) {
  const t = useI18n();
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [draft, setDraft] = useState<Draft>(INITIAL_DRAFT);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const resetEdit = useCallback(() => {
    if (draft.previewUrl) {
      URL.revokeObjectURL(draft.previewUrl);
    }
    setEditingId(null);
    setDraft(INITIAL_DRAFT);
  }, [draft.previewUrl]);

  const handleCancel = useCallback(() => {
    resetEdit();
  }, [resetEdit]);

  const handleSave = useCallback(async () => {
    if (!draft.name.trim()) {
      toast.error(t('people.nameRequired'));
      return;
    }
    setSaving(true);
    try {
      if (editingId === 'new') {
        const newPerson = await createPerson({ name: draft.name.trim() });
        if (!newPerson) {
          throw new Error('Create failed');
        }
        let avatarUrl: string | null = null;
        if (draft.pendingFile) {
          const fd = new FormData();
          fd.append('file', draft.pendingFile);
          avatarUrl = await uploadPersonAvatar(newPerson.id, fd);
          await updatePerson(newPerson.id, {
            avatarUrl,
            name: draft.name.trim(),
          });
        }
        toast.success(t('people.createSuccess'));
      } else if (editingId) {
        let avatarUrl = draft.avatarUrl;
        if (draft.pendingFile) {
          const fd = new FormData();
          fd.append('file', draft.pendingFile);
          avatarUrl = await uploadPersonAvatar(editingId, fd);
        }
        await updatePerson(editingId, { avatarUrl, name: draft.name.trim() });
        toast.success(t('people.updateSuccess'));
      }
      resetEdit();
    } catch {
      toast.error(
        editingId === 'new' ? t('people.createError') : t('people.updateError')
      );
    } finally {
      setSaving(false);
    }
  }, [draft, editingId, resetEdit, t]);

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }
    try {
      await deletePerson(deleteId);
      toast.success(t('people.deleteSuccess'));
    } catch {
      toast.error(t('people.deleteError'));
    } finally {
      setDeleteId(null);
    }
  };

  const startEdit = useCallback((p: SelectPerson) => {
    setEditingId(p.id);
    setDraft({
      avatarUrl: p.avatarUrl,
      name: p.name,
      pendingFile: null,
      previewUrl: null,
    });
  }, []);

  const openCreate = () => {
    setEditingId('new');
    setDraft(INITIAL_DRAFT);
  };

  const columns = useMemo<ColumnDef<SelectPerson>[]>(
    () => [
      {
        cell: ({ row, table }) => {
          const meta = table.options.meta as PeopleTableMeta | undefined;
          const isEditing = meta?.editingId === row.original.id;
          if (isEditing && meta) {
            return <AvatarEdit draft={meta.draft} setDraft={meta.setDraft} />;
          }
          return (
            <AvatarDisplay
              avatarUrl={row.original.avatarUrl}
              name={row.original.name}
              size={32}
            />
          );
        },
        header: t('people.columns.avatar'),
        id: 'avatar',
        size: 56,
      },
      {
        accessorKey: 'name',
        cell: ({ row, table }) => {
          const meta = table.options.meta as PeopleTableMeta | undefined;
          const isEditing = meta?.editingId === row.original.id;
          if (isEditing && meta) {
            return (
              <Input
                autoFocus
                className='h-8'
                onChange={(e) =>
                  meta.setDraft((d) => ({ ...d, name: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    meta.handleSave();
                  } else if (e.key === 'Escape') {
                    meta.handleCancel();
                  }
                }}
                value={meta.draft.name}
              />
            );
          }
          return <span className='font-medium'>{row.original.name}</span>;
        },
        header: t('people.columns.name'),
      },
      {
        cell: ({ row, table }) => {
          const meta = table.options.meta as PeopleTableMeta | undefined;
          const isEditing = meta?.editingId === row.original.id;
          if (isEditing && meta) {
            return (
              <div className='flex justify-end gap-1'>
                <Button
                  className='h-7 w-7'
                  disabled={saving}
                  onClick={meta.handleSave}
                  size='icon'
                  variant='ghost'
                >
                  <Check size={14} />
                </Button>
                <Button
                  className='h-7 w-7'
                  disabled={saving}
                  onClick={meta.handleCancel}
                  size='icon'
                  variant='ghost'
                >
                  <X size={14} />
                </Button>
              </div>
            );
          }
          return (
            <div className='flex justify-end gap-1'>
              <Button
                className='h-7 w-7'
                onClick={() => meta?.startEdit(row.original)}
                size='icon'
                variant='ghost'
              >
                <Pencil size={14} />
              </Button>
              <Button
                className='h-7 w-7 text-destructive hover:text-destructive'
                onClick={() => meta?.setDeleteId(row.original.id)}
                size='icon'
                variant='ghost'
              >
                <Trash2 size={14} />
              </Button>
            </div>
          );
        },
        header: () => (
          <span className='flex justify-end'>
            {t('people.columns.actions')}
          </span>
        ),
        id: 'actions',
        size: 96,
      },
    ],
    [t, saving]
  );

  const table = useReactTable({
    columns,
    data: people,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      draft,
      editingId,
      handleCancel,
      handleSave,
      setDeleteId,
      setDraft,
      startEdit,
    },
  });

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-end'>
        <Button disabled={editingId !== null} onClick={openCreate} size='sm'>
          <Plus size={16} />
          {t('people.newPerson')}
        </Button>
      </div>

      {people.length === 0 && editingId !== 'new' ? (
        <div className='rounded-lg border border-dashed py-12 text-center text-muted-foreground text-sm'>
          {t('people.empty')}
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
                        width:
                          header.getSize() === 150
                            ? undefined
                            : header.getSize(),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {editingId === 'new' && (
                <tr className='border-b bg-muted/10'>
                  <td className='px-4 py-3'>
                    <AvatarEdit draft={draft} setDraft={setDraft} />
                  </td>
                  <td className='px-4 py-3'>
                    <Input
                      autoFocus
                      className='h-8'
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, name: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSave();
                        } else if (e.key === 'Escape') {
                          handleCancel();
                        }
                      }}
                      placeholder={t('people.columns.name')}
                      value={draft.name}
                    />
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex justify-end gap-1'>
                      <Button
                        className='h-7 w-7'
                        disabled={saving}
                        onClick={handleSave}
                        size='icon'
                        variant='ghost'
                      >
                        <Check size={14} />
                      </Button>
                      <Button
                        className='h-7 w-7'
                        disabled={saving}
                        onClick={handleCancel}
                        size='icon'
                        variant='ghost'
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
              {table.getRowModel().rows.map((row) => (
                <tr
                  className='border-b transition-colors last:border-0 hover:bg-muted/30'
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td className='px-4 py-3' key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog
        onOpenChange={(open) => !open && setDeleteId(null)}
        open={Boolean(deleteId)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('people.deleteDialog.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('people.deleteDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('people.deleteDialog.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={handleDelete}
              variant='destructive'
            >
              {t('people.deleteDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
