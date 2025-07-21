'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { MrpAPI } from '@/api';
import { RootState } from '@/redux/store';
import ButtonAction from '@/components/ButtonAction';
import ContentHeader from '@/components/ContentHeader';
import InputFieldsLabel from '@/components/InputFieldsLabel';
import SelectField from '@/components/SelectField';
import ButtonDisabled from '@/components/ButtonDisabled'; 
import FilterModal from '@/components/Modal';
import EditForm from '@/components/EditForm';

type FormValues = {
  brand_id: number;
  heavy_equipment_id: number;
  series_id: number;
  consumption: number;
  tolerance: number;
};

type HeavyEquipmentValues = { 
  ID: string;
  heavy_equipment_name: string;
};

type SeriesValues = { 
  ID: string;
  series_name: string;
};

type BrandValues = { 
  ID: string;
  brand_name: string;
};

type Option = { label: string; value: string };

export default function EditDataAlatBeratForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { register, handleSubmit, setValue, setError, watch, formState: { errors } } = useForm<FormValues>({
    mode: 'onSubmit',
    defaultValues: {
      brand_id: 0,
      heavy_equipment_id: 0,
      series_id: 0,
      consumption: 0,
      tolerance: 1,
    },
  });

  
  const submitFormRef = useRef<(() => void) | null>(null);

  const [brandOptions, setBrandOptions] = useState<Option[]>([]);
  const [equipmentTypeOptions, setEquipmentTypeOptions] = useState<Option[]>([]);
  const [seriesOptions, setSeriesOptions] = useState<Option[]>([]);

  const selectedBrand = watch('brand_id');
  const selectedEquipment = watch('heavy_equipment_id');

  const brandTouchedRef = useRef(false);
  const equipmentTouchedRef = useRef(false); 

  const previousBrandRef = useRef<number | null>(null);
  const didPrefill = useRef(false); // Add this above useEffect

  useEffect(() => {
    // ⛔ Skip reset if it's the initial prefill
    if (didPrefill.current) {
      didPrefill.current = false; // use once
      previousBrandRef.current = selectedBrand;
      return;
    }

    if (!brandTouchedRef.current) return;

    const prevBrand = previousBrandRef.current;

    if (selectedBrand && selectedBrand !== prevBrand || selectedBrand <= 0) {
      setValue('heavy_equipment_id', 0);
      setValue('series_id', 0);
      setEquipmentTypeOptions([]);
      setSeriesOptions([]);

      const fetchEquipment = async () => {
        try {
          const { data } = await MrpAPI({
            url: `/master/detail/heavyequipment/brand/${selectedBrand}`,
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "content-type": "application/json",
              Accept: "application/json",
            },
          });

          setEquipmentTypeOptions(
            data.map((item: HeavyEquipmentValues) => ({
              label: item.heavy_equipment_name,
              value: String(item.ID),
            }))
          );
        } catch (error) {
          console.error('Failed to fetch equipment:', error);
        }
      };

      fetchEquipment();
    }

    previousBrandRef.current = selectedBrand;
  }, [selectedBrand, setValue, token]);


  // Fetch series when equipment changes
  useEffect(() => {
    if (!selectedEquipment || !equipmentTouchedRef.current) return;

    setValue('series_id', 0);
    setSeriesOptions([]);

    const fetchSeries = async () => {
      try { 
        const { data } = await MrpAPI({
        url: `/master/detail/series/heavyequipment/${selectedBrand}/${selectedEquipment}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
          Accept: "application/json",
        },
      });
        setSeriesOptions(
          data.map((item: SeriesValues) => ({
            label: item.series_name,
            value: String(item.ID),
          }))
        );
      } catch (error) {
        console.error('Failed to fetch series:', error);
      }
    };

    fetchSeries();
  }, [selectedBrand, selectedEquipment, setValue, token]);

  // Initial brand, equipment, series for prefill
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [brandsRes, detailRes] = await Promise.all([
          MrpAPI({ url: '/master/list/brand', method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
          MrpAPI({ url: `/alatberat/detail/alatBerat/${id}`, method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const brands = brandsRes.data;
        const detail = detailRes.data;

        setBrandOptions(brands.map((b: BrandValues) => ({ label: b.brand_name, value: String(b.ID) })));

        if (detail) {
          const { brand_id, heavy_equipment_id, series_id, consumption, tolerance } = detail;

          // ✅ Set form values
          setValue('brand_id', brand_id);
          setValue('heavy_equipment_id', heavy_equipment_id);
          setValue('series_id', series_id);
          setValue('consumption', consumption);
          setValue('tolerance', tolerance);
          
          // ✅ Avoid clearing on first render
          didPrefill.current = true;

          // ✅ Fetch equipment options based on brand
          const [equipmentsRes, seriesRes] = await Promise.all([
            MrpAPI({ url: `/master/detail/heavyequipment/brand/${brand_id}`, method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
            MrpAPI({ url: `/master/detail/series/heavyequipment/${brand_id}/${heavy_equipment_id}`, method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
          ]);

          setEquipmentTypeOptions(
            equipmentsRes.data.map((e: HeavyEquipmentValues) => ({ label: e.heavy_equipment_name, value: String(e.ID) }))
          );

          setSeriesOptions(
            seriesRes.data.map((s: SeriesValues) => ({ label: s.series_name, value: String(s.ID) }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };

    if (token) {
      fetchInitialData();
    }
  }, [token, id, setValue]);


  const onSubmit = async (values: FormValues) => {
    let hasError = false;

    if (isNaN(values.brand_id) || values.brand_id <= 0) {
      setError("brand_id", { type: "manual", message: "Brand wajib diisi" });
      hasError = true;
    }

   if (isNaN(values.heavy_equipment_id) || values.heavy_equipment_id <= 0) {
      setError("heavy_equipment_id", {type: "manual", message: "Jenis alat berat wajib diisi"});
      hasError = true;
    }

    if (isNaN(values.series_id) || values.series_id <= 0) {
      setError("series_id", { type: "manual", message: "Seri alat berat wajib diisi"});
      hasError = true;
    }

    if (isNaN(values.consumption) || values.consumption <= 0) {
      setError("consumption", {type: "manual", message: "Konsumsi tidak boleh kosong atau negatif"});
      hasError = true;
    }

    if (isNaN(values.tolerance) || values.tolerance <= 0) { 
      setError("tolerance", {type: "manual", message: "Toleransi tidak boleh kosong atau negatif"});
      hasError = true;
    } 

    if (hasError) return;
    try {
      await MrpAPI({
        url: `/alatberat/update/alatBerat/${id}`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: values,
      });

      router.push('/plant/alat-berat');
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  
  submitFormRef.current = handleSubmit(onSubmit);

  return ( 
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="relative mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4">
        <ContentHeader className="m-0" title="Ubah Data Alat Berat" />
        <div className="flex gap-2">
          <ButtonDisabled
            type="button"
            onClick={() => router.push(`/plant/alat-berat/detail/${id}`)}
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
          label="Brand"
          {...register('brand_id', { required: 'Brand wajib diisi', valueAsNumber: true })}
          value={watch('brand_id')}
          onChange={(e) => {
            brandTouchedRef.current = true;
            setValue('brand_id', Number(e.target.value));
          }}
          options={brandOptions}
          error={errors.brand_id?.message}
        />

        <SelectField
          label="Jenis Alat Berat"
          {...register('heavy_equipment_id', { required: 'Jenis wajib diisi', valueAsNumber: true })}
          value={watch('heavy_equipment_id')}
          onChange={(e) => {
            equipmentTouchedRef.current = true;
            setValue('heavy_equipment_id', Number(e.target.value));
          }}
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
          {...register('consumption', { required: 'Konsumsi wajib diisi', valueAsNumber: true })}
          error={errors.consumption?.message}
        />

        <InputFieldsLabel
          label="Persentase Toleransi (%) :"
          type="number"
          {...register('tolerance', { required: 'Toleransi wajib diisi', valueAsNumber: true })}
          error={errors.tolerance?.message}
          disabled={true}
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
