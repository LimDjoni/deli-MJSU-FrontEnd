'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { MJSUAPI } from '@/api';
import { RootState } from '@/redux/store';
import ButtonAction from '@/components/ButtonAction';
import ContentHeader from '@/components/ContentHeader';
import InputFieldsLabel from '@/components/InputFieldsLabel';
import SelectField from '@/components/SelectField';
import ButtonDisabled from '@/components/ButtonDisabled'; 
import FilterModal from '@/components/Modal';
import EditForm from '@/components/EditForm'; 
import { Asset, assetTypeOptions, ukuranOptions } from '@/types/AssetValues';

export default function EditDataAssetForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const token = useSelector((state: RootState) => state.auth.user?.token); 
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const submitFormRef = useRef<(() => void) | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Asset>({
    mode: 'onSubmit',
    defaultValues: {
      asset_type: '',
      ukuran: '',
      stock: 0, 
    },
  }); 

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data } = await MJSUAPI({
          url: `/asset/detail/${id}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }); 

        const detail = data;  

        if (detail) {
          const { asset_type, ukuran, stock } = detail;

          // ✅ Set form values
          setValue('asset_type', asset_type);
          setValue('ukuran', ukuran);
          setValue('stock', stock); 
        }
      } catch (error) {
        console.error("Failed to fetch detail:", error);
      }
    };
  
    if (token) {
      fetchDetail();
    }
  }, [token, id, setValue]);

  const onSubmit = async (values: Asset) => { 
    try {
      await MJSUAPI({
        url: `/asset/update/${id}`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: values,
      });

      router.push('/asset');
    } catch (error) {
      console.error('Update failed:', error);
    }
  }; 
 
  submitFormRef.current = handleSubmit(onSubmit);

  return ( 
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="relative mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4">
        <ContentHeader className="m-0" title="Ubah Data Asset" />
        <div className="flex gap-2">
          <ButtonDisabled
            type="button"
            onClick={() => router.push(`/asset/detail/${id}`)}
            className="px-6"
          >
            Kembali
          </ButtonDisabled>
          <ButtonAction
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="px-6"
            >
              Simpan
              </ButtonAction>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField
          label="Jenis Asset"
          {...register('asset_type', { required: 'Jenis Asset wajib diisi' })}
          value={watch('asset_type')}
          onChange={(e) => { 
            setValue('asset_type', e.target.value);
          }}
          options={assetTypeOptions}
          error={errors.asset_type?.message}
        />

        <SelectField
          label="Ukuran"
          {...register('ukuran', { required: 'Ukuran wajib diisi' })}
          value={watch('ukuran')}
          onChange={(e) => { 
            setValue('ukuran', e.target.value);
          }}
          options={ukuranOptions}
          error={errors.ukuran?.message}
        /> 

        <InputFieldsLabel
          label="Stock :"
          type="number"
          {...register('stock', { required: 'Stock wajib diisi', valueAsNumber: true })}
          error={errors.stock?.message} 
        />
      </div>
    </form> 

     <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <EditForm
          onCancel={() => {  
            setIsFilterOpen(false);
          }}
          onConfirm={() => {  
            submitFormRef.current?.(); // submit form from outside
            setIsFilterOpen(false);
          }} 
        />
      </FilterModal>
    </>
  );
}
