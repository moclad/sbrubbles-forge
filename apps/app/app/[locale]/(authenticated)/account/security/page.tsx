import { UpdateEmail } from './update-email';
import { UpdatePassword } from './update-password';

export default async function SecuritySettings() {
  return (
    <div className='container mx-auto p-4'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <UpdateEmail />
        <UpdatePassword />
      </div>
    </div>
  );
}
