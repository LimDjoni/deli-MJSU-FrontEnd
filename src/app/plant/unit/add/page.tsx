'use client';

import { useEffect, useState, useRef  } from 'react';
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

type UnitValues = {
  unit_name: string;
  brand_id: number;
  heavy_equipment_id: number;
  series_id: number; 
  consumption: number; 
};

export default function TambahDataUnitForm() {
  const [brandOptions, setBrandOptions] = useState<{ label: string; value: string }[]>([]);
  const [equipmentTypeOptions, setEquipmentTypeOptions] = useState<{ label: string; value: string }[]>([]);
  const [seriesOptions, setSeriesOptions] = useState<{ label: string; value: string }[]>([]);
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canFetchConsumptionRef = useRef(true);
  const [prevSeries, setPrevSeries] = useState<number>(0);

  const {
  register,
  handleSubmit,
  watch,
  setError,
  setValue,
  formState: { errors },
} = useForm<UnitValues>({
  mode: 'onSubmit',
  defaultValues: { 
    unit_name: '',
    brand_id: 0,
    heavy_equipment_id: 0,
    series_id: 0, 
    consumption: 0, 
  },
});

  const brand = watch('brand_id');
  const equipmentType = watch('heavy_equipment_id'); 
  const series = watch('series_id');

  const onSubmit = async (dataUnit: UnitValues) => {  
    setIsSubmitting(true);
    let hasError = false;

    if (!dataUnit.unit_name || dataUnit.unit_name.trim() === '') { 
      setError("unit_name", {type: "manual", message: "Nama Unit tidak boleh kosong"});
      hasError = true;
    } 

    if (isNaN(dataUnit.brand_id) || dataUnit.brand_id <= 0) {
      setError("brand_id", { type: "manual", message: "Brand wajib diisi" });
      hasError = true;
    }

   if (isNaN(dataUnit.heavy_equipment_id) || dataUnit.heavy_equipment_id <= 0) {
      setError("heavy_equipment_id", {type: "manual", message: "Jenis alat berat wajib diisi"});
      hasError = true;
    }

    if (isNaN(dataUnit.series_id) || dataUnit.series_id <= 0) {
      setError("series_id", { type: "manual", message: "Seri alat berat wajib diisi"});
      hasError = true;
    }
 
    if (hasError) return;

      try { 
        const data  = await MrpAPI({
          url: "/unit/create",
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "content-type": "application/json",
            Accept: "application/json",
          },
          data: {
            ...dataUnit,
          },
        });    
        console.log(data);
        router.push("/plant/unit");
      } catch {
        setError("root.serverError", {
          type: "manual",
          message: "Gagal Menyimpan Data, Silahkan Coba Lagi.",
        });
      } finally {
        setIsSubmitting(false);
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
        value: brand.ID,
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
      setValue('consumption', 0);
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
          value: item.ID, // ✅ keep it as number
        }));

        setEquipmentTypeOptions(mappedTypes);
      } catch (error) {
        console.error("Failed to fetch equipment types:", error);
      }
    };

    fetchEquipmentTypes();
  }, [brand, setValue, token]);
 
  useEffect(() => {
    setSeriesOptions([]);
    setValue('series_id', 0); 
    setValue('consumption', 0);

    // ⛔️ Prevent fetchConsumption on this change
    canFetchConsumptionRef.current = false;

    if (!brand || !equipmentType) return;

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
          label: item.series_name,
          value: item.ID,
        }));

        setSeriesOptions(mappedSeries);
      } catch (error) {
        console.error("Failed to fetch series:", error);
      }
    };

    fetchSeries();
  }, [brand, equipmentType, setValue, token]);
 
  // Fetch consumption when all are valid AND allowed
  useEffect(() => {
    const seriesId = Number(series);

    const isValidIds =
      !isNaN(brand) && brand > 0 &&
      !isNaN(equipmentType) && equipmentType > 0 &&
      !isNaN(seriesId) && seriesId > 0;

    if (!isValidIds) return;

    // Only call fetchConsumption if it's a newly selected series
    if (seriesId === prevSeries) return;

    const fetchConsumption = async () => {
      try {
        const { data } = await MrpAPI({
          url: `/alatberat/consumption/${brand}/${equipmentType}/${seriesId}`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'content-type': 'application/json',
            Accept: 'application/json',
          },
        });

        if (data?.consumption) {
          setValue('consumption', data.consumption);
        }
      } catch (error) {
        console.error("Failed to fetch consumption:", error);
      }
    };

    fetchConsumption();
    setPrevSeries(seriesId); // update last fetched series
  }, [brand, equipmentType, series, prevSeries, setValue, token]);
 

  return (
    <>
    <div className="relative mx-auto"> 
 
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4"> 
          <ContentHeader className="m-0" title="Tambah Data Unit" /> 
          <div className="flex gap-2">
            <ButtonDisabled type="button" 
            onClick={() => router.push('/plant/unit/')}
            className="px-6">
              Kembali
            </ButtonDisabled> 
            <ButtonAction type="submit" className="px-6" disabled={isSubmitting}>
            Simpan
          </ButtonAction>
          </div>
        </div> 

        <div className="grid grid-cols-3 items-center gap-4">
          <InputFieldsLabel
            label="Nama Unit :"
            type="text"
            {...register('unit_name', {
              required: 'Nama Unit wajib diisi',
              minLength: { value: 2, message: 'Nama unit terlalu pendek' },
            })}
            error={errors.unit_name?.message}
          />
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
            {...register('consumption', { valueAsNumber: true })}
            disabled={true}
            error={errors.consumption?.message}
          />
        </div>
      </form>
    </div>
    </>
  );
}
