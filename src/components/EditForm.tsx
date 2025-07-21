'use client'; // Required for state and events in App Router

import Image from 'next/image';
import React from 'react'; 
import ButtonAction from '@/components/ButtonAction';
import ButtonDisabled from '@/components/ButtonDisabled';

interface EditFormProps {
  onCancel: () => void;
  onConfirm: () => void;
}
 
const EditForm: React.FC<EditFormProps> = ({ onCancel, onConfirm }) => { 
  
  return (
    <>
      <Image
        src="/edit.png"
        alt="Login illustration"
        width={80}
        height={80}
        className="mx-auto"
      />
      <h2 className="text-xl font-bold my-6 text-center">Apakah anda yakin akan mengubah data ini?</h2>
 
      <div className="flex justify-center gap-2">       
        <ButtonAction
          className="px-2"
          onClick={onConfirm} 
        >
          Ya, Ubah
        </ButtonAction> 
        <ButtonDisabled 
          onClick={onCancel}
          className="px-6">
          Batal
        </ButtonDisabled>  
      </div>
    </>
  );
};

export default EditForm;
