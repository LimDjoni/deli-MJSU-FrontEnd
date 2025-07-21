'use client'; // Required for state and events in App Router

import Image from 'next/image';
import React from 'react'; 
import ButtonAction from '@/components/ButtonAction';
import ButtonDisabled from '@/components/ButtonDisabled';

interface DeleteFormProps {
  onCancel: () => void;
  onConfirm: () => void;
}
 
const DeleteForm: React.FC<DeleteFormProps> = ({ onCancel, onConfirm }) => { 
  
  return (
    <>
      <Image
        src="/bin.png"
        alt="Login illustration"
        width={80}
        height={80}
        className="mx-auto"
      />
      <h2 className="text-xl font-bold my-6 text-center">Apakah anda yakin akan menghapus data ini?</h2>
 
      <div className="flex justify-center gap-2">
        <ButtonAction
          type="button" 
          className="px-6"
          onClick={onConfirm} 
        >
          Hapus
        </ButtonAction>  
        <ButtonDisabled 
          type="button" 
          onClick={onCancel}
          className="px-6">
          Kembali
        </ButtonDisabled>   
      </div>
    </>
  );
};

export default DeleteForm;
