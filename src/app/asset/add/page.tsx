'use client';
 
import { MJSUAPI } from '@/api'; 
import ButtonAction from '@/components/ButtonAction';
import ContentHeader from '@/components/ContentHeader';
import SelectField from '@/components/SelectField'; 
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import InputFieldsLabel from '@/components/InputFieldsLabel';
import { useForm } from 'react-hook-form'; 
import { useRouter } from 'next/navigation';
import ButtonDisabled from '@/components/ButtonDisabled'; 
import { Asset, assetTypeOptions, ukuranOptions } from '@/types/AssetValues';

export default function TambahDataAssetForm() { 
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const router = useRouter();

  const {
  register,
  handleSubmit,
  watch,
  setError,
  setValue,
  formState: { errors },
} = useForm<Asset>({
  mode: 'onSubmit',
  defaultValues: {
    asset_type: '',
    ukuran: '',
    stock: 0, 
  },
}); 

  const onSubmit = async (dataAsset: Asset) => {   
      try { 
        const data  = await MJSUAPI({
          url: "/asset/create",
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": "application/json",
            Accept: "application/json",
          },
          data: {
            ...dataAsset,
          },
        });    
        console.log(data)

        router.push("/asset");
      } catch {
        setError("root.serverError", {
          type: "manual",
          message: "Gagal Menyimpan Data, Silahkan Coba Lagi.",
        });
      }
    }; 
 
  return (
    <>
    <div className="relative mx-auto"> 
 
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4"> 
          <ContentHeader className="m-0" title="Tambah Data Asset" /> 
          <div className="flex gap-2">
            <ButtonDisabled type="button" 
            onClick={() => router.push('/asset')}
            className="px-6">
              Kembali
            </ButtonDisabled> 
            <ButtonAction type="submit" className="px-6">
            Simpan
          </ButtonAction>
          </div>
        </div> 

        <div className="grid grid-cols-3 items-center gap-4">
          <SelectField
              label="Asset"
              {...register('asset_type', { required: 'Asset wajib dipilih' })}
              value={watch('asset_type')}
              onChange={(e) => setValue('asset_type', e.target.value)}
              options={assetTypeOptions}
              error={errors.asset_type?.message}
            />
          <SelectField
            label="Ukuran"
            {...register('ukuran', { required: 'Ukuran wajib dipilih' })}
            value={watch('ukuran')}
            onChange={(e) => setValue('ukuran', e.target.value)}
            options={ukuranOptions}
            error={errors.ukuran?.message}
          /> 
          <InputFieldsLabel
            label="Stock :"
            type="number"
            {...register('stock', {
              required: 'Stock wajib diisi',
              valueAsNumber: true,
              min: { value: 0, message: 'Nilai tidak boleh negatif' },
            })}
            error={errors.stock?.message}
          />  
        </div>
      </form>
    </div>
    </>
  );
}
