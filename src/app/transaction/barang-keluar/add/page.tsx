'use client';

import { MJSUAPI } from '@/api'; 
import ButtonAction from '@/components/ButtonAction';
import ContentHeader from '@/components/ContentHeader';
import SelectField from '@/components/SelectField'; 
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import InputFieldsLabel from '@/components/InputFieldsLabel';
import { Controller, useForm } from 'react-hook-form'; 
import { useRouter } from 'next/navigation';
import ButtonDisabled from '@/components/ButtonDisabled'; 
import { Asset, BarangKeluar } from '@/types/AssetValues';
import DatePicker from 'react-datepicker';
import ErrorMessage from '@/components/ErrorMessage';
import 'react-datepicker/dist/react-datepicker.css';
import { useEffect, useState } from 'react';
import { EmployeeHomeFormValues } from '@/types/EmployeeValues';

export default function TambahDataBarangKeluarForm() { 
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const [assetOptions, setAssetOptions] = useState<{ label: string; value: string }[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<{ label: string; value: string }[]>([]);
  const router = useRouter();

  const {
    control,
    register,
    handleSubmit,
    watch,
    setError,
    setValue,
    formState: { errors },
  } = useForm<BarangKeluar>({
    mode: 'onSubmit',
    defaultValues: {
      Asset: {
        ID: 0,
        asset_type: '',
        ukuran: '',
        stock: 0,
      },
      asset_type_id: '',
      tanggal: null, 
      jumlah_keluar: 0, 
    },
  }); 

  const asset_type_id = watch('asset_type_id');
  const stock = watch('Asset.stock');
  const employee_id = watch('employee_id');
 
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
    const fetchInitialData = async () => {
      try {
        const [empRes] = await Promise.all([
          MJSUAPI({
            url: '/employee/list/export/2',
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          }),  
        ]);
        
        // Langsung ambil dari response
      const employeeOptions = empRes.data.map((emp: EmployeeHomeFormValues) => ({
        label: emp.lastname === "-" 
          ? emp.firstname 
          : `${emp.firstname} ${emp.lastname}`,
        value: emp.ID.toString(), // pakai string untuk value jika dropdown-nya pakai string
      }));

      // Simpan ke state
      setEmployeeOptions(employeeOptions);
      
      } catch (err) {
        console.error('Error fetching filter data:', err);
      }
    };

    if (token) fetchInitialData();
  }, [token]); 

  useEffect(() => {
    if (!asset_type_id || asset_type_id == '') {
      setValue('Asset.ID', 0);
      setValue('Asset.asset_type', '');
      setValue('Asset.ukuran', '');
      setValue('Asset.stock', 0);
      return;
    }

    const fetchAsset = async () => {
      try {
        const { data } = await MJSUAPI({
          url: `/asset/detail/${asset_type_id}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": "application/json",
            Accept: "application/json",
          },
        });

        const detail = data;
        console.log('Fetched Asset Detail:', detail);

        if (detail) {
          setValue('Asset.ID', detail.ID); // ✅ now we set the ID
          setValue('Asset.asset_type', detail.asset_type ?? '');
          setValue('Asset.ukuran', detail.ukuran ?? '');
          setValue('Asset.stock', detail.stock ?? 0);
        }
      } catch (error) {
        console.error("Failed to fetch asset details:", error);
      }
    };

    fetchAsset();
  }, [asset_type_id, setValue, token]);

  useEffect(() => {
    if (!employee_id || employee_id == 0) {
      setValue('employee.Department.department_name', ''); 
      return;
    }

    const fetchAsset = async () => {
      try {
        const { data } = await MJSUAPI({
          url: `/employee/detail/${employee_id}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": "application/json",
            Accept: "application/json",
          },
        });

        const detail = data;
        console.log('Fetched Asset Detail:', detail);

        if (detail) {
          setValue('employee.Department.department_name', detail.Department.department_name ?? ''); // ✅ now we set the ID 
        }
      } catch (error) {
        console.error("Failed to fetch asset details:", error);
      }
    };

    fetchAsset();
  }, [employee_id, setValue, token]);


  const normalizeDate = (date: string | Date | null): string | null => {
    if (date instanceof Date) return date.toISOString().split('T')[0];
    return date || null;
  }; 

  const onSubmit = async (dataAsset: BarangKeluar) => {
    if (dataAsset.jumlah_keluar > stock) {
      setError("jumlah_keluar", {
        type: "manual",
        message: `Jumlah keluar tidak boleh melebihi stok (${stock})`,
      });
      return; // Stop submission
    }
    try {
      // Step 1: Create Barang Keluar record
      const createPayload = {
        employee_id: Number(dataAsset.employee_id),
        asset_id: dataAsset.Asset.ID,
        tanggal: normalizeDate(dataAsset.tanggal),
        jumlah_keluar: dataAsset.jumlah_keluar,
      };

      const createResponse = await MJSUAPI({
        url: "/barangkeluar/create",
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
          Accept: "application/json",
        },
        data: createPayload,
      });

      console.log("Submitted Data:", createResponse.data);

      // Step 2: Update Asset stock
      const updatePayload = { 
        asset_type: dataAsset.Asset.asset_type,
        ukuran: dataAsset.Asset.ukuran,
        stock: stock - dataAsset.jumlah_keluar,
      };

      const updateResponse = await MJSUAPI({
        url: `/asset/update/${dataAsset.Asset.ID}`,
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
          Accept: "application/json",
        },
        data: updatePayload,
      });

      console.log("Updated Data:", updateResponse.data);

      // Step 3: Redirect to barang keluar list
      router.push("/transaction/barang-keluar");
    } catch (error) {
      console.error("Submit Error:", error);
      setError("root.serverError", {
        type: "manual",
        message: "Gagal Menyimpan Data, Silahkan Coba Lagi.",
      });
    }
  }; 

  return (
    <div className="relative mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4"> 
          <ContentHeader className="m-0" title="Tambah Data Barang Keluar" /> 
          <div className="flex gap-2">
            <ButtonDisabled type="button" onClick={() => router.push('/transaction/barang-keluar/')} className="px-6">
              Kembali
            </ButtonDisabled> 
            <ButtonAction type="submit" className="px-6">
              Simpan
            </ButtonAction>
          </div>
        </div> 

        <div className="grid grid-cols-3 items-center gap-4"> 
          <div className="col-span-3 grid grid-cols-3 items-start gap-4">
            <Controller
              control={control}
              name="employee_id"
              rules={{ required: 'Employee wajib dipilih' }}
              render={({ field }) => (
                <SelectField
                  label="Karyawan"
                  value={field.value?.toString() || ""}
                  onChange={(e) => { 
                    field.onChange(e.target.value); // internal form state stores number
                  }}
                  options={employeeOptions}
                  error={errors.employee_id?.message}
                />
              )}
            /> 
            <InputFieldsLabel
              label="Department"
              type="text"
              {...register('employee.Department.department_name', {
                required: 'Department wajib diisi', 
              })}
              error={errors.employee?.Department?.department_name?.message}
              disabled
            /> 
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
                  field.onChange(e.target.value); // internal form state stores number
                }}
                options={assetOptions}
                error={errors.asset_type_id?.message}
              />
            )}
          /> 
          <InputFieldsLabel
            label="Stock"
            type="number"
            {...register('Asset.stock', {
              required: 'Stock wajib diisi',
              valueAsNumber: true,
              min: { value: 0, message: 'Nilai tidak boleh negatif' },
            })}
            error={errors.Asset?.stock?.message}
            disabled
          /> 
          <InputFieldsLabel
            label="Jumlah Barang Keluar :"
            type="number"
            {...register("jumlah_keluar", {
              required: "Jumlah Barang wajib diisi",
              valueAsNumber: true,
              min: { value: 1, message: "Minimal 1 barang harus dikeluarkan" },
              validate: (value) =>
                value <= stock || `Jumlah keluar tidak boleh melebihi stok (${stock})`,
            })}
            error={errors.jumlah_keluar?.message}
          />
        </div>
      </form>
    </div>
  );
}
