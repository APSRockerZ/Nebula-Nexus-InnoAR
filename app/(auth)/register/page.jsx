import React from 'react';
import { RegisterForm } from '@/components/auth/register-form';
import { Instructions } from '@/components/auth/Instructions';

const RegisterPage = () => (
  <>
    <Instructions />
    <RegisterForm />
  </>
);

export default RegisterPage;
