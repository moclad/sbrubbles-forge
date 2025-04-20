import { Loader2 } from 'lucide-react';
import { useActionState, useContext } from 'react';

import { Button } from '@repo/design-system/components/uibutton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@repo/design-system/components/uidialog';
import { Input } from '@repo/design-system/components/uiinput';
import { Label } from '@repo/design-system/components/uilabel';
import { cn } from '@repo/design-system/lib/utils';

import { AuthUIContext } from '../../lib/auth-ui-provider';
import { getErrorMessage } from '../../lib/get-error-message';

import type { AuthLocalization } from '../../lib/auth-localization';
import type { SettingsCardClassNames } from './shared/settings-card';

export interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts?: { provider: string }[] | null;
  localization?: AuthLocalization;
  classNames?: SettingsCardClassNames;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  accounts,
  localization,
  classNames,
}: DeleteAccountDialogProps) {
  const {
    authClient,
    basePath,
    deleteAccountVerification,
    freshAge,
    hooks: { useSession },
    localization: authLocalization,
    navigate,
    toast,
    viewPaths,
  } = useContext(AuthUIContext);

  localization = { ...authLocalization, ...localization };

  const { data: sessionData } = useSession();
  const session = sessionData?.session;

  const isFresh = session
    ? Date.now() / 1000 - session?.createdAt.getTime() / 1000 < freshAge
    : false;
  const credentialsLinked = accounts?.some(
    (acc) => acc.provider === 'credential'
  );

  const formAction = async (_: unknown, formData: FormData) => {
    const params = {} as Record<string, string>;

    if (credentialsLinked) {
      const password = formData.get('password') as string;
      params.password = password;
    } else if (!isFresh) {
      navigate(`${basePath}/${viewPaths.signOut}`);
      return;
    }

    if (deleteAccountVerification) {
      params.callbackURL = `${basePath}/${viewPaths.signOut}`;
    }

    const { error } = await authClient.deleteUser(params);

    if (error) {
      toast({
        variant: 'error',
        message: getErrorMessage(error) || localization.requestFailed,
      });
    } else if (deleteAccountVerification) {
      toast({ message: localization.deleteAccountEmail! });
    } else {
      toast({
        variant: 'success',
        message: localization.deleteAccountSuccess!,
      });
      navigate(`${basePath}/${viewPaths.signOut}`);
    }

    onOpenChange(false);
  };

  const [_, action, isSubmitting] = useActionState(formAction, null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form action={action}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle
              className={cn('text-lg md:text-xl', classNames?.title)}
            >
              {localization?.deleteAccount}
            </DialogTitle>

            <DialogDescription
              className={cn('text-xs md:text-sm', classNames?.description)}
            >
              {isFresh
                ? localization?.deleteAccountInstructions
                : localization?.deleteAccountNotFresh}
            </DialogDescription>
          </DialogHeader>

          {credentialsLinked && (
            <div className='grid gap-2'>
              <Label htmlFor='password'>{localization?.password}</Label>

              <Input
                autoComplete='current-password'
                id='password'
                name='password'
                placeholder={localization?.passwordPlaceholder}
                required
                type='password'
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type='button'
              variant='secondary'
              onClick={() => onOpenChange(false)}
            >
              {localization.cancel}
            </Button>

            <Button
              className={classNames?.button}
              disabled={isSubmitting}
              variant='destructive'
            >
              <span className={cn(isSubmitting && 'opacity-0')}>
                {isFresh ? localization?.deleteAccount : localization?.signOut}
              </span>

              {isSubmitting && (
                <span className='absolute'>
                  <Loader2 className='animate-spin' />
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
