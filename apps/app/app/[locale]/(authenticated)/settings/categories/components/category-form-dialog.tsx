'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { useI18n } from '@repo/localization/i18n/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { CategoryColorPicker, randomHex } from './color-swatch-picker';
import { CATEGORY_ICONS, IconPicker } from './icon-picker';

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

type CategoryFormValues = {
  color: string;
  description?: string;
  icon: string;
  name: string;
};

type CategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    id: string;
    name: string;
    description?: string | null;
    icon: string;
    color: string;
  };
  onSubmit: (data: CategoryFormValues) => Promise<void>;
};

export function CategoryFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: Readonly<CategoryFormDialogProps>) {
  const t = useI18n();
  const isEdit = Boolean(initialData);

  const categorySchema = z.object({
    color: z
      .string()
      .regex(HEX_COLOR_REGEX, t('categories.form.errors.invalidColor')),
    description: z.string().max(500).optional(),
    icon: z.string().min(1, t('categories.form.errors.iconRequired')),
    name: z.string().min(1, t('categories.form.errors.nameRequired')).max(255),
  });

  const form = useForm<CategoryFormValues>({
    defaultValues: {
      color: initialData?.color ?? randomHex(),
      description: initialData?.description ?? '',
      icon: initialData?.icon ?? CATEGORY_ICONS[0].name,
      name: initialData?.name ?? '',
    },
    resolver: zodResolver(categorySchema),
  });

  const handleSubmit = async (values: CategoryFormValues) => {
    await onSubmit(values);
    form.reset();
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      form.reset();
    }
    onOpenChange(next);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? t('categories.form.editTitle')
              : t('categories.form.createTitle')}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className='flex flex-col gap-4'
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('categories.form.nameLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('categories.form.namePlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('categories.form.descriptionLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      className='resize-none'
                      placeholder={t('categories.form.descriptionPlaceholder')}
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='icon'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('categories.form.iconLabel')}</FormLabel>
                  <FormControl>
                    <IconPicker onChange={field.onChange} value={field.value} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='color'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('categories.form.colorLabel')}</FormLabel>
                  <FormControl>
                    <CategoryColorPicker
                      onChange={field.onChange}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                onClick={() => handleOpenChange(false)}
                type='button'
                variant='outline'
              >
                {t('categories.form.cancel')}
              </Button>
              <Button loading={form.formState.isSubmitting} type='submit'>
                {isEdit
                  ? t('categories.form.saveChanges')
                  : t('categories.form.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
