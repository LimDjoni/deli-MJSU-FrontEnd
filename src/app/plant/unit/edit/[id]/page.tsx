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
import { useCallback } from 'react';

type FormValues = {
  unit_name: string;
  brand_id: number;
  heavy_equipment_id: number;
  series_id: number;
  consumption: number;
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

export default function EditDataUnitForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { register, handleSubmit, setValue, setError, watch, formState: { errors } } = useForm<FormValues>();
  
  const submitFormRef = useRef<(() => void) | null>(null);

  const [brandOptions, setBrandOptions] = useState<Option[]>([]);
  const [equipmentTypeOptions, setEquipmentTypeOptions] = useState<Option[]>([]);
  const [seriesOptions, setSeriesOptions] = useState<Option[]>([]);

  const selectedBrand = watch('brand_id');
  const selectedEquipment = watch('heavy_equipment_id');
  const seriesId = watch('series_id');

  const brandTouchedRef = useRef(false);
  const equipmentTouchedRef = useRef(false); 
  const seriesTouchedRef = useRef(false); 
  const previousBrandRef = useRef<number | null>(null);
  const previousEquipmentRef = useRef<number | null>(null);
  const previousSeriesRef = useRef<number | null>(null);
  const didPrefill = useRef(false); // Add this above useEffect

  const didMountRef = useRef(false);

  // Fetch equipment when brand changes
  useEffect(() => {
    if (didPrefill.current) {
      didPrefill.current = false;
      previousBrandRef.current = selectedBrand;
      return;
    }

    if (!brandTouchedRef.current) return;

    const prevBrand = previousBrandRef.current;

    const brandChanged = selectedBrand !== prevBrand;
    const invalidBrand = !selectedBrand || selectedBrand <= 0;


    if (brandChanged || invalidBrand) {
      setValue('heavy_equipment_id', 0);
      setValue('series_id', 0);
      setValue('consumption', 0);
      setEquipmentTypeOptions([]);
      setSeriesOptions([]); 

      
      if (invalidBrand) {
        previousBrandRef.current = null; // ✅ allow re-selection of same series
        return;
      } 

      if (!invalidBrand) {
        const fetchEquipment = async () => {
          try {
            const { data } = await MrpAPI({
              url: `/master/detail/heavyequipment/brand/${selectedBrand}`,
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                'content-type': 'application/json',
                Accept: 'application/json',
              },
            });

            setEquipmentTypeOptions(
              data.map((item: HeavyEquipmentValues) => ({
                label: item.heavy_equipment_name,
                value: String(item.ID),
              }))
            );
             previousBrandRef.current = selectedBrand;
          } catch (error) {
            console.error('Failed to fetch equipment:', error);
          }
        };

        fetchEquipment();
      }
    } 
  }, [selectedBrand, setValue, token]);


  // Fetch series when equipment changes
  useEffect(() => {
    if (didPrefill.current) {
      didPrefill.current = false;
      previousEquipmentRef.current = selectedEquipment;
      return;
    }

    if (!equipmentTouchedRef.current) return;

    const prevEquipment = previousEquipmentRef.current;
    const equipmentChanged = selectedEquipment !== prevEquipment;
    const invalidEquipment = !selectedEquipment || selectedEquipment <= 0;

    if (equipmentChanged || invalidEquipment) {
      setValue('series_id', 0);
      setValue('consumption', 0);
      setSeriesOptions([]);
    }

    if (invalidEquipment) {
      previousEquipmentRef.current = null; // ✅ allow re-selection of same series
      return;
    } 

    if (!invalidEquipment && equipmentChanged) {
      const fetchSeries = async () => {
        try {
          const { data } = await MrpAPI({
            url: `/master/detail/series/heavyequipment/${selectedBrand}/${selectedEquipment}`,
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'content-type': 'application/json',
              Accept: 'application/json',
            },
          });

          const options = data.map((item: SeriesValues) => ({
            label: item.series_name,
            value: String(item.ID),
          }));

          setSeriesOptions(options);
          previousEquipmentRef.current = selectedEquipment; // ✅ Only after checks
        } catch (error) {
          console.error('Failed to fetch series:', error);
        }
      };
      fetchSeries();
    } 
  }, [selectedBrand, selectedEquipment, token, setValue]);

  useEffect(() => {
    if (didPrefill.current) {
      didPrefill.current = false;
      previousSeriesRef.current = seriesId;
      return;
    }

    if (!seriesTouchedRef.current) return;

    const prevSeries = previousSeriesRef.current;
    const seriesChanged = seriesId !== prevSeries;
    const invalidSeries = !seriesId || seriesId <= 0;

    if (seriesChanged || invalidSeries) {
      setValue('consumption', 0); 
    }

    if (invalidSeries) {
      previousSeriesRef.current = null; // ✅ allow re-selection of same series
      return;
    } 

    if (!invalidSeries && seriesChanged) { 
      const fetchConsumption = async () => {
        try {
          const { data } = await MrpAPI({
            url: `/alatberat/consumption/${selectedBrand}/${selectedEquipment}/${seriesId}`,
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'content-type': 'application/json',
            },
          });

          if (typeof data?.consumption === 'number') {
            setValue('consumption', data.consumption);
            previousSeriesRef.current = seriesId; // ✅ only after fetch success
          }
        } catch (error) {
          console.error('Failed to fetch consumption:', error);
        }
      }; 
      fetchConsumption();
    }
  }, [selectedBrand, selectedEquipment, seriesId, setValue, token]);

 

  // Initial brand, equipment, series for prefill
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [brandsRes, detailRes] = await Promise.all([
          MrpAPI({ url: '/master/list/brand', method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
          MrpAPI({ url: `/unit/detail/${id}`, method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const brands = brandsRes.data;
        const detail = detailRes.data;

        setBrandOptions(brands.map((b: BrandValues) => ({ label: b.brand_name, value: String(b.ID) })));

        if (detail) {
          const { unit_name, brand_id, heavy_equipment_id, series_id } = detail;

          // ✅ Set form values
          setValue('unit_name', unit_name);
          setValue('brand_id', brand_id);
          setValue('heavy_equipment_id', heavy_equipment_id);
          setValue('series_id', series_id);

          // ✅ Fetch equipment options based on brand
          const [consumptionRes, equipmentsRes, seriesRes] = await Promise.all([ 
            MrpAPI({ url: `/alatberat/consumption/${brand_id}/${heavy_equipment_id}/${series_id}`, method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
            MrpAPI({ url: `/master/detail/heavyequipment/brand/${brand_id}`, method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
            MrpAPI({ url: `/master/detail/series/heavyequipment/${brand_id}/${heavy_equipment_id}`, method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
          ]); 

          setValue('consumption', consumptionRes.data.consumption);

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

  // Fetch consumption when all are valid AND allowed 
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return; // 🛑 skip first run
    } 
  }, [selectedEquipment]);


  const onSubmit = useCallback(async (values: FormValues) => {
    let hasError = false;

    if (!values.unit_name || values.unit_name.trim() === '') { 
      setError("unit_name", {type: "manual", message: "Nama Unit tidak boleh kosong"});
      hasError = true;
    } 
    
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

    if (hasError) return;
    try {
      await MrpAPI({
        url: `/unit/update/${id}`,
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        data: values,
      });

      router.push('/plant/unit');
    } catch (error) {
      console.error('Update failed:', error);
    }
 }, [setError, id, token, router]);

  useEffect(() => {
    submitFormRef.current = handleSubmit(onSubmit);
  }, [handleSubmit, onSubmit]);

  return ( 
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="relative mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4">
        <ContentHeader className="m-0" title="Ubah Data Unit" />
        <div className="flex gap-2">
          <ButtonDisabled
            type="button"
            onClick={() => router.push(`/plant/unit/detail/${id}`)}
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
           onChange={(e) => {
            seriesTouchedRef.current = true;
            setValue('series_id', Number(e.target.value));
          }} 
          options={seriesOptions}
          error={errors.series_id?.message}
        />

        <InputFieldsLabel
          label="Konsumsi BBM Dalam 1 Jam (L) :"
          type="number"
          disabled={true}
          {...register('consumption', { required: 'Konsumsi wajib diisi', valueAsNumber: true })}
          error={errors.consumption?.message}
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
