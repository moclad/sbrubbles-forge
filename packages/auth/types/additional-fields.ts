import type { ReactNode } from 'react';

export type FieldType = 'string' | 'number' | 'boolean';

export type AdditionalField = {
  description?: ReactNode;
  instructions?: ReactNode;
  label: ReactNode;
  placeholder?: string;
  required?: boolean;
  type: FieldType;
  validate?: (value: string) => Promise<boolean>;
};

export type AdditionalFields = {
  [key: string]: AdditionalField;
};
