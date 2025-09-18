'use client'; // Required for state and events in App Router

import Image from 'next/image';
import { useForm } from 'react-hook-form'; 
import InputField from '@/components/InputField';
import Button from '@/components/Button';  
import { useAppDispatch } from '@/redux/hooks';
import { MJSUAPI } from '@/api'; 
import { login } from '@/redux/features/auth/authSlice';
import { useRouter } from 'next/navigation';

type LoginFormValues = {
  data: string;
  password: string;
};

export default function LoginPage() {

 const {
    register,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
  defaultValues: {
    data: '',
    password: '',
  },
});
  
  const router = useRouter();

  const dispatch = useAppDispatch();

  const onSubmit = async (loginData : LoginFormValues) => {
    try { 
      const data  = await MJSUAPI({
        url: "/user/login",
        method: "POST",
        headers: {
          "content-type": "application/json",
          Accept: "application/json",
        },
        data: {
          ...loginData,
        },
      });   
      dispatch(login(data.data)); 
      if(data.data.employee.Department.department_name == 'HRGA'){
        router.push("/dashboard/dashboard-manpower");
      }else{
        router.push("/dashboard");
      }
    } catch {
      setError("password", {
        message: "Username/email atau password Anda salah.",
      });
    }
  }; 

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#CCCCCC]">
      <div className="w-full max-w-md bg-white p-4 rounded-xl shadow-md">
        <Image
          src="/logoMJSU.png"
          alt="Login illustration"
          width={150}
          height={150}
          className="mx-auto mb-3"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left mx-8 mb-8">
          <div>
            <InputField 
              type="text"
              placeholder="Email or Username"
              {...register('data', { required: 'Email or username is required' })} 
              error={errors.data?.message}
            />
          </div>
          <div>
            <InputField 
              type="password"
              placeholder="••••••••"
            {...register('password', { required: 'Password is required' })}
              error={errors.password?.message}
            /> 
          </div>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}