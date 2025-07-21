'use client';

import { useEffect, useState } from 'react';
import ButtonAction from '@/components/ButtonAction';
import ContentHeader from '@/components/ContentHeader';
import SelectField from '@/components/SelectField';
import { MrpAPI } from '@/api'; 
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import InputFieldsLabel from '@/components/InputFieldsLabel';
import { useForm } from 'react-hook-form'; 
import { useRouter } from 'next/navigation';
import ButtonDisabled from '@/components/ButtonDisabled';

interface Brand {
  ID: number;
  brand_name: string;
}

interface HeavyEquipment {
  ID: number;
  brand_id: number;
  heavy_equipment_name: string;
}

interface Series {
  ID: number;
  brand_id: number;
  heavy_equipment_id: number;
  series_name: string;
}

type AlatBeratValues = {
  brand_id: number;
  heavy_equipment_id: number;
  series_id: number;
  consumption: number;
  tolerance: number;
};

export default function TambahDataAlatBeratForm() {
  const [brandOptions, setBrandOptions] = useState<{ label: string; value: string }[]>([]);
  const [equipmentTypeOptions, setEquipmentTypeOptions] = useState<{ label: string; value: string }[]>([]);
  const [seriesOptions, setSeriesOptions] = useState<{ label: string; value: string }[]>([]);
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const router = useRouter();

  const {
  register,
  handleSubmit,
  watch,
  setError,
  setValue,
  formState: { errors },
} = useForm<AlatBeratValues>({
  mode: 'onSubmit',
  defaultValues: {
    brand_id: 0,
    heavy_equipment_id: 0,
    series_id: 0,
    consumption: 0,
    tolerance: 1,
  },
});

  const brand = watch('brand_id');
  const equipmentType = watch('heavy_equipment_id'); 

  const onSubmit = async (dataAlatBerat: AlatBeratValues) => {  
    let hasError = false;

    if (isNaN(dataAlatBerat.brand_id) || dataAlatBerat.brand_id <= 0) {
      setError("brand_id", { type: "manual", message: "Brand wajib diisi" });
      hasError = true;
    }

   if (isNaN(dataAlatBerat.heavy_equipment_id) || dataAlatBerat.heavy_equipment_id <= 0) {
      setError("heavy_equipment_id", {type: "manual", message: "Jenis alat berat wajib diisi"});
      hasError = true;
    }

    if (isNaN(dataAlatBerat.series_id) || dataAlatBerat.series_id <= 0) {
      setError("series_id", { type: "manual", message: "Seri alat berat wajib diisi"});
      hasError = true;
    }

    if (isNaN(dataAlatBerat.consumption) || dataAlatBerat.consumption <= 0) {
      setError("consumption", {type: "manual", message: "Konsumsi tidak boleh kosong atau negatif"});
      hasError = true;
    }

    if (isNaN(dataAlatBerat.tolerance) || dataAlatBerat.tolerance <= 0) { 
      setError("tolerance", {type: "manual", message: "Toleransi tidak boleh kosong atau negatif"});
      hasError = true;
    } 

    if (hasError) return;

      try { 
        const data  = await MrpAPI({
          url: "/alatberat/create/alatBerat",
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": "application/json",
            Accept: "application/json",
          },
          data: {
            ...dataAlatBerat,
          },
        });    
        console.log(data)

        router.push("/plant/alat-berat");
      } catch {
        setError("root.serverError", {
          type: "manual",
          message: "Gagal Menyimpan Data, Silahkan Coba Lagi.",
        });
      }
    }; 

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data } = await MrpAPI({
          url: "/master/list/brand/",
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": "application/json",
            Accept: "application/json",
          },
        }); 

      const mappedOptions = data.map((brand: Brand) => ({
        label: brand.brand_name,
        value: String(brand.ID),
      }));

        setBrandOptions(mappedOptions);
      } catch (error) {
        console.error("Failed to fetch brands:", error);
      }
    };

    fetchBrands();
  }, [token]);

  // Watch for brand changes
  useEffect(() => {
    if (!brand || brand <= 0) {
      setValue('heavy_equipment_id', 0);
      setValue('series_id', 0); 
      setEquipmentTypeOptions([]); // clear old equipment options
      setSeriesOptions([]);        // clear old series options
      return;
    }

    const fetchEquipmentTypes = async () => {
      try {
        const { data } = await MrpAPI({
          url: `/master/detail/heavyequipment/brand/${brand}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": "application/json",
            Accept: "application/json",
          },
        });

        const mappedTypes = data.map((item: HeavyEquipment) => ({
          label: item.heavy_equipment_name,
          value: String(item.ID),
        }));

        setEquipmentTypeOptions(mappedTypes);
      } catch (error) {
        console.error("Failed to fetch equipment types:", error);
      }
    };

    fetchEquipmentTypes();
  }, [brand, setValue, token]);
 
  useEffect(() => {
  // Only fetch if both are selected
  if (!brand || !equipmentType) {
    setSeriesOptions([]); // clear when incomplete
    return;
  }

  const fetchSeries = async () => {
    try {
      const { data } = await MrpAPI({
        url: `/master/detail/series/heavyequipment/${brand}/${equipmentType}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
          Accept: "application/json",
        },
      });

      const mappedSeries = data.map((item: Series) => ({
        label: item.series_name,  // adjust based on your API
        value: String(item.ID),
      }));

      setSeriesOptions(mappedSeries);
    } catch (error) {
      console.error("Failed to fetch series:", error);
    }
  };

  fetchSeries();
}, [brand, equipmentType, token]);
 
  return (
    <>
    <div className="relative mx-auto"> 
 
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4"> 
          <ContentHeader className="m-0" title="Tambah Data Alat Berat" /> 
          <div className="flex gap-2">
            <ButtonDisabled type="button" 
            onClick={() => router.push('/plant/alat-berat/')}
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
              label="Brand"
              {...register('brand_id', { required: 'Brand wajib diisi', valueAsNumber: true })}
              value={watch('brand_id')}
              onChange={(e) => setValue('brand_id', Number(e.target.value))}
              options={brandOptions}
              error={errors.brand_id?.message}
            />
          <SelectField
            label="Jenis Alat Berat"
            {...register('heavy_equipment_id', { required: 'Jenis alat berat wajib diisi', valueAsNumber: true })}
            value={watch('heavy_equipment_id')}
            onChange={(e) => setValue('heavy_equipment_id', Number(e.target.value))}
            options={equipmentTypeOptions}
            error={errors.heavy_equipment_id?.message}
          />
          <SelectField
            label="Seri Alat Berat"
            {...register('series_id', { required: 'Seri wajib diisi', valueAsNumber: true })}
            value={watch('series_id')}
            onChange={(e) => setValue('series_id', Number(e.target.value))}
            options={seriesOptions}
            error={errors.series_id?.message}
          />
          <InputFieldsLabel
            label="Konsumsi BBM Dalam 1 Jam (L) :"
            type="number"
            {...register('consumption', {
              required: 'Konsumsi wajib diisi',
              valueAsNumber: true,
              min: { value: 0, message: 'Nilai tidak boleh negatif' },
            })}
            error={errors.consumption?.message}
          />

          <InputFieldsLabel
            label="Persentase Toleransi (%) :"
            type="number"
            {...register('tolerance', {
              required: 'Toleransi wajib diisi',
              valueAsNumber: true,
              min: { value: 0, message: 'Nilai tidak boleh negatif' },
            })}
            error={errors.tolerance?.message}
            disabled={true}
          />
        </div>
      </form>
    </div>
    </>
  );
}
