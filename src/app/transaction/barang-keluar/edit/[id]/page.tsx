'use client';

import { useState, useEffect, useRef, use } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import { Asset, BarangKeluar } from '@/types/AssetValues';
import DatePicker from 'react-datepicker';
import ErrorMessage from '@/components/ErrorMessage';
import 'react-datepicker/dist/react-datepicker.css';

export default function EditDataBarangKeluartForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const token = useSelector((state: RootState) => state.auth.user?.token); 
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const submitFormRef = useRef<(() => void) | null>(null);
  const [assetOptions, setAssetOptions] = useState<{ label: string; value: string }[]>([]);
  const [prevJumlahKeluar, setPrevJumlahKeluar] = useState<number>(0);

  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<BarangKeluar>({
    mode: 'onSubmit',
    defaultValues: {
      tanggal: null,
      asset_type_id: '', 
      jumlah_keluar: 0, 
    },
  }); 
 

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [assetRes] = await Promise.all([
          MJSUAPI({
            url: '/asset/list/',
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          }),  
        ]);
        
        // Langsung ambil dari response
      const assetOptions = assetRes.data.map((dept: Asset) => ({
        label: dept.ukuran === "-" 
          ? dept.asset_type 
          : `${dept.asset_type} - ${dept.ukuran}`,
        value: dept.ID.toString(), // pakai string untuk value jika dropdown-nya pakai string
      }));

      // Simpan ke state
      setAssetOptions(assetOptions);
      
      } catch (err) {
        console.error('Error fetching filter data:', err);
      }
    };

    if (token) fetchInitialData();
  }, [token]);  

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data } = await MJSUAPI({
          url: `/barangkeluar/detail/${id}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (data) {
          // Destructure correctly from nested Asset
          const {
            tanggal,
            jumlah_keluar,
            Asset: { ID: assetId, asset_type, ukuran, stock },
          } = data;
          
          setPrevJumlahKeluar(jumlah_keluar);

          // ✅ Set form values safely
          setValue('tanggal', tanggal);
          setValue('asset_type_id', assetId.toString()); // must match SelectField value
          setValue('Asset.ID', assetId);
          setValue('Asset.asset_type', asset_type);
          setValue('Asset.ukuran', ukuran);
          setValue('Asset.stock', stock);
          setValue('jumlah_keluar', jumlah_keluar); 
        }
      } catch (error) {
        console.error("Failed to fetch detail:", error);
      }
    };

    if (token) {
      fetchDetail();
    }
  }, [token, id, setValue]);

  const normalizeDate = (date: string | Date | null): string | null => {
    if (date instanceof Date) return date.toISOString().split('T')[0];
    return date || null;
  }; 

  const onSubmit = async (dataAsset: BarangKeluar) => {
    try {
      // Step 1: Update Barang Keluar record
      const updatePayload = {
        asset_id: dataAsset.Asset.ID,
        tanggal: normalizeDate(dataAsset.tanggal),
        jumlah_keluar: dataAsset.jumlah_keluar,
      };

      const updateResponse = await MJSUAPI({
        url: `/barangkeluar/update/${id}`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
          Accept: "application/json",
        },
        data: updatePayload,
      });

      console.log("BarangKeluar Updated:", updateResponse.data);

      // Step 2: Update Asset stock
      // Formula: initial stock - prev jumlah_keluar + new jumlah_keluar
      const finalStock = dataAsset.Asset.stock + prevJumlahKeluar - dataAsset.jumlah_keluar;

      const updateQtyPayload = { 
        asset_type: dataAsset.Asset.asset_type,
        ukuran: dataAsset.Asset.ukuran,
        stock: finalStock,
      };

      const updateQtyResponse = await MJSUAPI({
        url: `/asset/update/${dataAsset.Asset.ID}`,
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
          Accept: "application/json",
        },
        data: updateQtyPayload,
      });

      console.log("Updated Stock:", updateQtyResponse.data);

      // Step 3: Redirect to list page
      router.push("/transaction/barang-keluar");
    } catch (error) {
      console.error("Submit Error:",{
        type: "manual",
        message: "Gagal Menyimpan Data, Silahkan Coba Lagi." + error,
      });
    }
  }; 
 
  submitFormRef.current = handleSubmit(onSubmit);

  return ( 
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="relative mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4">
        <ContentHeader className="m-0" title="Ubah Data Barang Keluar" />
        <div className="flex gap-2">
          <ButtonDisabled
            type="button"
            onClick={() => router.push(`/transaction/barang-keluar/detail/${id}`)}
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
        <div className="col-span-3 grid grid-cols-3 items-start gap-4">
          <label className="text-left font-medium pt-2">Tanggal :</label> 
          <div className="col-span-2 space-y-1">
            <Controller
              control={control}
              name="tanggal"
              rules={{ required: 'Tanggal wajib dipilih' }}
              render={({ field }) => (
                <DatePicker
                  selected={field.value as Date}
                  onChange={field.onChange}
                  dateFormat="yyyy-MM-dd"
                  className={`w-75 border rounded px-3 py-2 ${errors.tanggal ? 'border-red-500' : ''}`}
                  placeholderText="Pilih Tanggal"
                />
              )}
            />
            <ErrorMessage>{errors.tanggal?.message}</ErrorMessage>
          </div>
        </div> 
        <Controller
          control={control}
          name="asset_type_id"
          rules={{ required: 'Asset wajib dipilih' }}
          render={({ field }) => (
            <SelectField
              label="Asset"
              value={field.value?.toString() || ""}
              onChange={(e) => {
                field.onChange(e.target.value); // keep internal state in sync
              }}
              options={assetOptions}
              error={errors.asset_type_id?.message}
              disabled={true} // ✅ Move it here
            />
          )}
        /> 
        <InputFieldsLabel
          label="Jumlah Barang Keluar :"
          type="number"
          {...register('jumlah_keluar', {
            required: 'Jumlah Barang wajib diisi',
            valueAsNumber: true,
            min: { value: 0, message: 'Nilai tidak boleh negatif' },
          })}
          error={errors.jumlah_keluar?.message}
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

