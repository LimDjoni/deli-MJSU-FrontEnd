import React, { useEffect, useState } from 'react'; 
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch, Controller, Control } from 'react-hook-form'; 
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import FilterFormSertifikat from '@/app/hr/employee/FilterFormSertifikat';
import FilterFormMCU from '@/app/hr/employee/FilterFormMCU';
import FilterFormHistory from '@/app/hr/employee/FilterFormHistory';
import InputFieldsLabel from '@/components/InputFieldsLabel';
import SelectField from '@/components/SelectField';
import ButtonAction from '@/components/ButtonAction';
import { Plus } from 'lucide-react';
import FilterModal from '@/components/Modal';
import ErrorMessage from '@/components/ErrorMessage';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';  
import { MrpAPI } from '@/api'; 
import DeleteForm from '@/components/DeleteForm'; 
import FilterFormKontrak from '../../FilterFormKontrak';
import FilterEditFormKontrak from './Edit/FilterEditFormKontrak'; 
import FilterEditFormSertifikat from './Edit/FilterEditFormSertifikat';
import FilterEditFormMCU from './Edit/FilterEditFormMCU';
import FilterEditFormHistory from './Edit/FilterEditFormHistory';
import { EmployeeAddDetailEditFormValue, SubmittedDOH, SubmittedHistory, SubmittedMCU, SubmittedSertifikat } from '@/types/EmployeeValues';
import { genderOptions, golonganDarahOptions, agamaOptions, ringOptions, hireOptions, ringSerapanOptions, kategoriLaporanTriwulanOptions, LokalNonLokalOptions, pajakOptions, bankOptions, statusOptions, levelOptions, pendidikanOptions } from '@/types/OptionsValue';

type UpdateEmployeeTabsProps = {
  register: UseFormRegister<EmployeeAddDetailEditFormValue>;
  errors: FieldErrors<EmployeeAddDetailEditFormValue>;
  setValue: UseFormSetValue<EmployeeAddDetailEditFormValue>;
  watch: UseFormWatch<EmployeeAddDetailEditFormValue>;
  control: Control<EmployeeAddDetailEditFormValue>;
  detail: EmployeeAddDetailEditFormValue | null;
  id: string;
};

const UpdateEmployeeTabs: React.FC<UpdateEmployeeTabsProps> = ({ register, errors, setValue, watch, control, detail, id }) => {
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const [activeTab, setActiveTab] = useState('Kartu Keluarga'); 
  const [isFilterOpen, setIsFilterOpen] = useState(false); 
  const [isEditOpen, setIsEditOpen] = useState(false);  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false); 
  const [dohList, setDohList] = useState<SubmittedDOH[]>([]);
  const [sertifikatList, setSertifikatList] = useState<SubmittedSertifikat[]>([]); 
  const [mcuList, setMCUList] = useState<SubmittedMCU[]>([]); 
  const [historyList, setHistoryList] = useState<SubmittedHistory[]>([]); 
  const [editingData, setEditingData] = useState<SubmittedDOH | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingDataSertifikat, setEditingDataSertifikat] = useState<SubmittedSertifikat | null>(null);
  const [editingDataMCU, setEditingDataMCU] = useState<SubmittedMCU | null>(null);
  const [editingDataHistory, setEditingDataHistory] = useState<SubmittedHistory | null>(null);
  
  // Autofill on detail load
  useEffect(() => {
    if (detail?.DOH && Array.isArray(detail.DOH)) {
      const filledDOH = detail.DOH.map((item) => {
        let masa_kontrak = null;

        if (item.tanggal_doh && item.tanggal_end_doh) {
          const start = new Date(item.tanggal_doh);
          const endOriginal = new Date(item.tanggal_end_doh);

          // ✅ Add 1 day to end date
          const end = new Date(endOriginal);
          end.setDate(end.getDate() + 1);

          const years = end.getFullYear() - start.getFullYear();
          const months = end.getMonth() - start.getMonth();
          const days = end.getDate() - start.getDate();

          masa_kontrak = years * 12 + months + (days >= 0 ? 0 : -1);
        }

        return {
          ...item,
          masa_kontrak,
          tanggal_doh: item.tanggal_doh || null,
          tanggal_end_doh: item.tanggal_end_doh || null,
        };
      });

      setDohList(filledDOH);
      setValue('DOH', filledDOH);
    }
  }, [detail, setValue]);
 
  useEffect(() => {
    if (detail?.Sertifikat && Array.isArray(detail.Sertifikat)) {
      const filledSertifikat = detail.Sertifikat.map((item) => ({
        ...item,
        date_effective: item.date_effective ? item.date_effective : null,
      }));
      setSertifikatList(filledSertifikat);
      setValue('Sertifikat', filledSertifikat);
    }
  }, [detail, setValue]);

  useEffect(() => {
    if (detail?.MCU && Array.isArray(detail.MCU)) {
      const filledMCU = detail.MCU.map((item) => ({
        ...item,
        date_mcu: item.date_mcu ? item.date_mcu : null,
        date_end_mcu: item.date_end_mcu ? item.date_end_mcu : null,
      }));
      setMCUList(filledMCU);
      setValue('MCU', filledMCU);
    }
  }, [detail, setValue]);

  useEffect(() => {
    if (detail?.History && Array.isArray(detail.History)) {
      const filledHistory = detail.History.map((item) => ({
        ...item,
        tanggal: item.tanggal ? item.tanggal : null,
      }));
      setHistoryList(filledHistory);
      setValue('History', filledHistory);
    }
  }, [detail, setValue]); 
  
 
  const handleAddDOH = async (data: SubmittedDOH) => {
    try {
      let savedData = data;

      // ✅ Only call API if it's meant to be saved immediately
      const response = await MrpAPI({
        url: '/master/create/doh',
        method: 'POST',
        data: {
          ...data,
          employee_id: Number(id),
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data) {
        savedData = response.data;
      }

      // ✅ Add 1 day to tanggal_end_doh & calculate masa_kontrak
      const updated = [...dohList, savedData].map((item) => {
        if (item.tanggal_doh && item.tanggal_end_doh) {
          const start = new Date(item.tanggal_doh);
          const end = new Date(item.tanggal_end_doh);
          end.setDate(end.getDate() + 1); // ➕ add 1 day

          const years = end.getFullYear() - start.getFullYear();
          const months = end.getMonth() - start.getMonth();
          const days = end.getDate() - start.getDate();

          const masa_kontrak = years * 12 + months + (days >= 0 ? 0 : -1);
          return { ...item, masa_kontrak };
        }
        return { ...item, masa_kontrak: null };
      });

      setDohList(updated);
      setValue('DOH', updated);
      setIsFilterOpen(false);
    } catch (error) {
      console.error('Gagal menambahkan DOH:', error);
    }
  };


  const handleEditDOH = async (data: SubmittedDOH, index?: number) => {
    try {
      const updatedList = [...dohList];

      if (data.ID) {
        // 🛠 Update existing record via API
        await MrpAPI({
          url: `/master/update/doh/${data.ID}`,
          method: 'PUT',
          data: {
            ...data,
            employee_id: Number(id),
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (typeof index === 'number') {
          updatedList[index] = data;
        }
      } else {
        // ➕ Just update in memory
        if (typeof index === 'number') {
          updatedList[index] = data;
        } else {
          updatedList.push(data);
        }
      }

      // ✅ Add 1 day to tanggal_end_doh and recalculate masa_kontrak
      const updatedWithMasaKontrak = updatedList.map((item) => {
        if (item.tanggal_doh && item.tanggal_end_doh) {
          const start = new Date(item.tanggal_doh);
          const end = new Date(item.tanggal_end_doh);
          end.setDate(end.getDate() + 1); // ➕ add 1 day

          const years = end.getFullYear() - start.getFullYear();
          const months = end.getMonth() - start.getMonth();
          const days = end.getDate() - start.getDate();

          const masa_kontrak = years * 12 + months + (days >= 0 ? 0 : -1);
          return {
            ...item,
            masa_kontrak,
            // Optional: update tanggal_end_doh in frontend if you want to reflect +1 day
            // tanggal_end_doh: end.toISOString().split('T')[0],
          };
        }
        return { ...item, masa_kontrak: null };
      });

      setDohList(updatedWithMasaKontrak);
      setValue('DOH', updatedWithMasaKontrak);
      setIsEditOpen(false);
    } catch (error) {
      console.error('Gagal mengupdate DOH:', error);
    }
  };


  const handleDelete = async (index: number) => {
    const itemToDelete = dohList[index];

    // 1. If no ID, just remove from UI state
    if (!itemToDelete?.ID) {
      const updated = dohList.filter((_, i) => i !== index);
      setDohList(updated);
      setValue('DOH', updated);
      return;
    }

    // 2. If has ID, call API and refresh from server, then merge with unsaved items
    try {
      await MrpAPI({
        url: `/master/delete/doh/${itemToDelete.ID}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // 3. Get remaining unsaved entries (no ID)
      const unsaved = dohList.filter((item) => !item.ID || item.ID === 0 || item.penempatan && !item.ID);

      // 4. Re-fetch saved data
      const { data } = await MrpAPI({
        url: `/employee/detail/${id}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const saved = data?.DOH || [];

      // 5. Merge both
      const merged = [...saved, ...unsaved];
      setDohList(merged);
      setValue('DOH', merged);
      setIsDeleteOpen(false);
    } catch (error) {
      console.error('Failed to delete DOH:', error);
    }
  };
    
  const handleOpenEditModal = (item: SubmittedDOH, index: number) => {
    setEditingData(item);
    setEditingIndex(index);
    setIsEditOpen(true);
  };
  
  const handleResetEdit = () => {
    setEditingData(null);
    setEditingIndex(null); 
    setIsEditOpen(false); 
  };  



  const handleAddSertifikat  = async (data: SubmittedSertifikat) => {
    try {
      let savedData = data;

      // ✅ Only call API if it's meant to be saved immediately
      const response = await MrpAPI({
        url: '/master/create/sertifikat', // 🔁 Adjust endpoint if needed
        method: 'POST',
        data: {
          ...data,
          employee_id: Number(id), // ensure correct type
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // ✅ Use returned data if your backend returns the new DOH entry with ID
      if (response.data) {
        savedData = response.data;
      }

      const updated = [...sertifikatList, savedData];
      setSertifikatList(updated);
      setValue('Sertifikat', updated);
      setIsFilterOpen(false); 
    } catch (error) {
      console.error('Gagal menambahkan Sertifikat:', error);
    }
  };
  
  const handleEditSertifikat = async (data: SubmittedSertifikat, index?: number) => {
    try {
      const updatedList = [...sertifikatList];
      if (data.ID) {
        // 🛠 Update existing record via API
        await MrpAPI({
          url: `/master/update/sertifikat/${data.ID}`, // Replace with correct endpoint
          method: 'PUT',
          data : {
            ...data,
            employee_id: Number(id), // ← inject employee ID here
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // 🔁 Replace existing item in local list
        if (typeof index === 'number') {
          updatedList[index] = data;
        }
      } else {
        // ➕ Just update in memory (no API call), assume it's a new unsaved item
        if (typeof index === 'number') {
          updatedList[index] = data;
        } else {
          updatedList.push(data);
        }
      }

      // ✅ Always update UI/form
      setSertifikatList(updatedList);
      setValue('Sertifikat', updatedList);
      setIsEditOpen(false);
    } catch (error) {
      console.error('Gagal mengupdate Sertifikat:', error);
    }
  };  

  const handleDeleteSertifikat = async (index: number) => {
    const itemToDelete = sertifikatList[index];

    // 1. If no ID, just remove from UI state
    if (!itemToDelete?.ID) {
      const updated = sertifikatList.filter((_, i) => i !== index);
      setSertifikatList(updated);
      setValue('Sertifikat', updated);
      return;
    }

    // 2. If has ID, call API and refresh from server, then merge with unsaved items
    try {
      await MrpAPI({
        url: `/master/delete/sertifikat/${itemToDelete.ID}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // 3. Get remaining unsaved entries (no ID)
      const unsaved = sertifikatList.filter((item) => !item.ID || item.ID === 0 || item.sertifikat && !item.ID);

      // 4. Re-fetch saved data
      const { data } = await MrpAPI({
        url: `/employee/detail/${id}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const saved = data?.Sertifikat || [];

      // 5. Merge both
      const merged = [...saved, ...unsaved];
      setSertifikatList(merged);
      setValue('Sertifikat', merged);
      setIsDeleteOpen(false);
    } catch (error) {
      console.error('Failed to delete sertifikat:', error);
    }
  };

  const handleOpenEdiSertifikatModal = (item: SubmittedSertifikat, index: number) => {
    setEditingDataSertifikat(item);
    setEditingIndex(index);
    setIsEditOpen(true);
  };
 

  const handleAddMCU  = async (data: SubmittedMCU) => {
    try {
      let savedData = data;

      // ✅ Only call API if it's meant to be saved immediately
      const response = await MrpAPI({
        url: '/master/create/mcu', // 🔁 Adjust endpoint if needed
        method: 'POST',
        data: {
          ...data,
          employee_id: Number(id), // ensure correct type
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // ✅ Use returned data if your backend returns the new DOH entry with ID
      if (response.data) {
        savedData = response.data;
      }

      const updated = [...mcuList, savedData];
      setMCUList(updated);
      setValue('MCU', updated);
      setIsFilterOpen(false); 
    } catch (error) {
      console.error('Gagal menambahkan MCU:', error);
    }
  };

   const handleEditMCU = async (data: SubmittedMCU, index?: number) => {
    try {
      const updatedList = [...mcuList];
      if (data.ID) {
        // 🛠 Update existing record via API
        await MrpAPI({
          url: `/master/update/mcu/${data.ID}`, // Replace with correct endpoint
          method: 'PUT',
          data : {
            ...data,
            employee_id: Number(id), // ← inject employee ID here
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // 🔁 Replace existing item in local list
        if (typeof index === 'number') {
          updatedList[index] = data;
        }
      } else {
        // ➕ Just update in memory (no API call), assume it's a new unsaved item
        if (typeof index === 'number') {
          updatedList[index] = data;
        } else {
          updatedList.push(data);
        }
      }

      // ✅ Always update UI/form
      setMCUList(updatedList);
      setValue('MCU', updatedList);
      setIsEditOpen(false);
    } catch (error) {
      console.error('Gagal mengupdate MCU:', error);
    }
  };  

  const handleDeleteMCU = async (index: number) => {
    const itemToDelete = mcuList[index];

    // 1. If no ID, just remove from UI state
    if (!itemToDelete?.ID) {
      const updated = mcuList.filter((_, i) => i !== index);
      setMCUList(updated);
      setValue('MCU', updated);
      return;
    }

    // 2. If has ID, call API and refresh from server, then merge with unsaved items
    try {
      await MrpAPI({
        url: `/master/delete/mcu/${itemToDelete.ID}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // 3. Get remaining unsaved entries (no ID)
      const unsaved = mcuList.filter((item) => !item.ID || item.ID === 0 || item.mcu && !item.ID);

      // 4. Re-fetch saved data
      const { data } = await MrpAPI({
        url: `/employee/detail/${id}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const saved = data?.MCU || [];

      // 5. Merge both
      const merged = [...saved, ...unsaved];
      setMCUList(merged);
      setValue('MCU', merged);
      setIsDeleteOpen(false);
    } catch (error) {
      console.error('Failed to delete mcu:', error);
    }
  };
 
  const handleOpenEdiMCUModal = (item: SubmittedMCU, index: number) => {
    setEditingDataMCU(item);
    setEditingIndex(index);
    setIsEditOpen(true);
  }; 

    
  const handleAddHistory = async (data: SubmittedHistory) => {
    try {
      let savedData = data;

      // ✅ Only call API if it's meant to be saved immediately
      const response = await MrpAPI({
        url: '/master/create/history', // 🔁 Adjust endpoint if needed
        method: 'POST',
        data: {
          ...data,
          employee_id: Number(id), // ensure correct type
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // ✅ Use returned data if your backend returns the new DOH entry with ID
      if (response.data) {
        savedData = response.data;
      }

      const updated = [...historyList, savedData];
      setHistoryList(updated);
      setValue('History', updated);
      setIsFilterOpen(false); 
    } catch (error) {
      console.error('Gagal menambahkan History:', error);
    }
  };

  const handleEditHistory = async (data: SubmittedHistory, index?: number) => {
    try {
      const updatedList = [...historyList];
      if (data.ID) {
        // 🛠 Update existing record via API
        await MrpAPI({
          url: `/master/update/history/${data.ID}`, // Replace with correct endpoint
          method: 'PUT',
          data : {
            ...data,
            employee_id: Number(id), // ← inject employee ID here
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // 🔁 Replace existing item in local list
        if (typeof index === 'number') {
          updatedList[index] = data;
        }
      } else {
        // ➕ Just update in memory (no API call), assume it's a new unsaved item
        if (typeof index === 'number') {
          updatedList[index] = data;
        } else {
          updatedList.push(data);
        }
      }

      // ✅ Always update UI/form
      setHistoryList(updatedList);
      setValue('History', updatedList);
      setIsEditOpen(false);
    } catch (error) {
      console.error('Gagal mengupdate History:', error);
    }
  };  

  const handleDeleteHistory = async (index: number) => {
    const itemToDelete = historyList[index];

    // 1. If no ID, just remove from UI state
    if (!itemToDelete?.ID) {
      const updated = historyList.filter((_, i) => i !== index);
      setHistoryList(updated);
      setValue('History', updated);
      return;
    }

    // 2. If has ID, call API and refresh from server, then merge with unsaved items
    try {
      await MrpAPI({
        url: `/master/delete/history/${itemToDelete.ID}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // 3. Get remaining unsaved entries (no ID)
      const unsaved = historyList.filter((item) => !item.ID || item.ID === 0 || item.status_terakhir && !item.ID);

      // 4. Re-fetch saved data
      const { data } = await MrpAPI({
        url: `/employee/detail/${id}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const saved = data?.History || [];

      // 5. Merge both
      const merged = [...saved, ...unsaved];
      setHistoryList(merged);
      setValue('History', merged);
      setIsDeleteOpen(false);
    } catch (error) {
      console.error('Failed to delete history:', error);
    }
  };
  
  const handleOpenEdiHistoryModal = (item: SubmittedHistory, index: number) => {
    setEditingDataHistory(item);
    setEditingIndex(index);
    setIsEditOpen(true);
  }; 


  const handleReset = () => {
    setIsFilterOpen(false);
  }; 

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Kartu Keluarga':
        return ( 
          <div className="mt-6">
            <h2 className="text-xl font-bold">Data Kartu Keluarga</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 '>
              <div className="space-y-4">
                <InputFieldsLabel
                  label="Nomor Kartu Keluarga :"
                  type="text"
                  {...register('KartuKeluarga.nomor_kartu_keluarga')}
                  value={watch('KartuKeluarga.nomor_kartu_keluarga')}
                  error={errors.KartuKeluarga?.nomor_kartu_keluarga?.message} 
                /> 
                <InputFieldsLabel
                  label="Nama Ibu Kandung :"
                  type="text"
                  {...register('KartuKeluarga.nama_ibu_kandung')}
                  value={watch('KartuKeluarga.nama_ibu_kandung')}
                  error={errors.KartuKeluarga?.nama_ibu_kandung?.message}
                /> 
              </div>  
              <div className="space-y-4">
                <InputFieldsLabel
                  label="Kontak Darurat :"
                  type="text"
                  {...register('KartuKeluarga.kontak_darurat')}
                  value={watch('KartuKeluarga.kontak_darurat')}
                  error={errors.KartuKeluarga?.kontak_darurat?.message} 
                /> 
                <InputFieldsLabel
                  label="Nama Kontak Darurat :"
                  type="text"
                  {...register('KartuKeluarga.nama_kontak_darurat')}
                  value={watch('KartuKeluarga.nama_kontak_darurat')}
                  error={errors.KartuKeluarga?.nama_kontak_darurat?.message}
                /> 
                <InputFieldsLabel
                  label="Hubungan Kontak Darurat :"
                  type="text"
                  {...register('KartuKeluarga.hubungan_kontak_darurat')}
                  value={watch('KartuKeluarga.hubungan_kontak_darurat')}
                  error={errors.KartuKeluarga?.hubungan_kontak_darurat?.message}
                /> 
              </div>  
          </div> 
        </div>
      ); 

      case 'KTP':
        return ( 
          <div className="mt-6">
            <h2 className="text-xl font-bold">Data KTP</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 '>
              <div className="space-y-4">
                <InputFieldsLabel
                  label="Nomor Kartu Tanda Penduduk :"
                  type="text"
                  {...register('KTP.nomor_ktp')}
                  value={watch('KTP.nomor_ktp')}
                  error={errors.KTP?.nomor_ktp?.message} 
                /> 
                <InputFieldsLabel
                  label="Nama Sesuai KTP :"
                  type="text"
                  {...register('KTP.nama_sesuai_ktp')}
                  value={watch('KTP.nama_sesuai_ktp')}
                  error={errors.KTP?.nama_sesuai_ktp?.message}
                /> 
                <InputFieldsLabel
                  label="Tempat Lahir :"
                  type="text"
                  {...register('KTP.tempat_lahir')}
                  value={watch('KTP.tempat_lahir')}
                  error={errors.KTP?.tempat_lahir?.message} 
                /> 
                <div className="col-span-3 grid grid-cols-3 items-start gap-4">
                  <label className="text-left font-medium pt-2">Tanggal Lahir :</label> 
                    <div className="col-span-2 space-y-1">
                    <Controller
                      control={control}
                      name="KTP.tanggal_lahir"
                      render={({ field }) => (
                        <DatePicker
                          selected={field.value as Date}
                          onChange={field.onChange}
                          dateFormat="yyyy-MM-dd"
                          className={`w-75 border rounded px-3 py-2 ${errors.KTP?.tanggal_lahir ? 'border-red-500' : ''}`}
                          placeholderText="Pilih Tanggal Lahir"
                        />
                      )}
                    /> 
                    <ErrorMessage>{errors.KTP?.tanggal_lahir?.message as string}</ErrorMessage>
                  </div>
                </div> 
                <SelectField
                  label="Gender"
                  {...register('KTP.gender')}
                  value={watch('KTP.gender')}
                  onChange={(e) => setValue('KTP.gender', e.target.value)}
                  options={genderOptions}
                  error={errors.KTP?.gender?.message}
                /> 
                <SelectField
                  label="Golongan Darah"
                  {...register('KTP.golongan_darah')}
                  value={watch('KTP.golongan_darah')}
                  onChange={(e) => setValue('KTP.golongan_darah', e.target.value)}
                  options={golonganDarahOptions}
                  error={errors.KTP?.golongan_darah?.message}
                /> 
                <SelectField
                  label="Agama"
                  {...register('KTP.agama')}
                  value={watch('KTP.agama')}
                  onChange={(e) => setValue('KTP.agama', e.target.value)}
                  options={agamaOptions}
                  error={errors.KTP?.agama?.message}
                />    
                <SelectField
                  label="Ring (KTP)"
                  {...register('KTP.ring_ktp')}
                  value={watch('KTP.ring_ktp')}
                  onChange={(e) => setValue('KTP.ring_ktp', e.target.value)}
                  options={ringOptions}
                  error={errors.KTP?.ring_ktp?.message}
                />  
              </div>  
              <div className="space-y-4">
                <InputFieldsLabel
                  label="Alamat :"
                  type="text"
                  {...register('KTP.alamat')}
                  value={watch('KTP.alamat')}
                  error={errors.KTP?.alamat?.message} 
                /> 
                <InputFieldsLabel
                  label="RT :"
                  type="text"
                  {...register('KTP.rt')}
                  value={watch('KTP.rt')}
                  error={errors.KTP?.rt?.message}
                /> 
                <InputFieldsLabel
                  label="RW :"
                  type="text"
                  {...register('KTP.rw')}
                  value={watch('KTP.rw')}
                  error={errors.KTP?.rw?.message} 
                /> 
                <InputFieldsLabel
                  label="Kelurahan / Desa :"
                  type="text"
                  {...register('KTP.kelurahan')}
                  value={watch('KTP.kelurahan')}
                  error={errors.KTP?.kelurahan?.message}
                /> 
                <InputFieldsLabel
                  label="Kecamatan :"
                  type="text"
                  {...register('KTP.kecamatan')}
                  value={watch('KTP.kecamatan')}
                  error={errors.KTP?.kecamatan?.message} 
                /> 
                <InputFieldsLabel
                  label="Kota / Kabupaten :"
                  type="text"
                  {...register('KTP.kota')}
                  value={watch('KTP.kota')}
                  error={errors.KTP?.kota?.message} 
                /> 
                <InputFieldsLabel
                  label="Provinsi :"
                  type="text"
                  {...register('KTP.provinsi')}
                  value={watch('KTP.provinsi')}
                  error={errors.KTP?.provinsi?.message} 
                /> 
                <InputFieldsLabel
                  label="Kode Pos :"
                  type="text"
                  {...register('KTP.kode_pos')}
                  value={watch('KTP.kode_pos')}
                  error={errors.KTP?.kode_pos?.message} 
                /> 
              </div>  
          </div> 
        </div>
      );

      case 'Pendidikan':
        return ( 
          <div className="mt-6">
            <h2 className="text-xl font-bold">Data Pendidikan</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 '>
              <div className="space-y-4"> 
                <SelectField
                  label="Jenjang Pendidikan"
                  {...register('Pendidikan.pendidikan_label')}
                  value={watch('Pendidikan.pendidikan_label')}
                  onChange={(e) => setValue('Pendidikan.pendidikan_label', e.target.value)}
                  options={pendidikanOptions}
                  error={errors.Pendidikan?.pendidikan_label?.message}
                /> 
                <InputFieldsLabel
                  label="Pendidikan :"
                  type="text"
                  {...register('Pendidikan.pendidikan_terakhir')}
                  value={watch('Pendidikan.pendidikan_terakhir')}
                  error={errors.Pendidikan?.pendidikan_terakhir?.message} 
                /> 
                <InputFieldsLabel
                  label="Jurusan :"
                  type="text"
                  {...register('Pendidikan.jurusan')}
                  value={watch('Pendidikan.jurusan')}
                  error={errors.Pendidikan?.jurusan?.message}
                /> 
              </div>   
          </div> 
        </div>
      ); 

      case 'Kontrak':
        return ( 
          <>
          <div className="mt-6">
            <h2 className="text-xl font-bold">Data Kontrak</h2>          
          <div>
            <div className="flex justify-between items-baseline mb-6">
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 '>
                <div className="space-y-4">
                  <SelectField
                    label="Hire By"
                    {...register('hire_by')}
                    value={watch('hire_by')}
                    onChange={(e) => setValue('hire_by', e.target.value)}
                    options={hireOptions}
                    error={errors.Pendidikan?.message as string}
                  /> 
                </div>   
              </div> 
               <ButtonAction
                className={`px-4 mt-0`}
                onClick={() => setIsFilterOpen(true)}
                icon={<Plus size={24} />}
              >
                Buat Baru
              </ButtonAction>
            </div>

            <div className="mt-8"> 
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-gray-100">
                  <tr className="bg-[#FF3131] text-white text-center">
                    <th className="px-4 py-2">No</th>
                    <th className="px-4 py-2">Tanggal Mulai Kontrak</th>
                    <th className="px-4 py-2">Tanggal Berakhir Kontrak</th>
                    <th className="px-4 py-2">Masa Kontrak</th>
                    <th className="px-4 py-2">PT</th>
                    <th className="px-4 py-2">Penempatan</th>
                    <th className="px-4 py-2">Status Kontrak</th>
                    <th className="px-4 py-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                {dohList.length > 0 ? (
                  dohList.map((item, index) => (
                    <tr key={index} className="border-t text-center">
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">{item.tanggal_doh as string}</td>
                      <td className="px-4 py-2">{item.tanggal_end_doh as string}</td>
                      <td className="px-4 py-2">{item.masa_kontrak} Bulan</td>
                      <td className="px-4 py-2">{item.pt}</td>
                      <td className="px-4 py-2">{item.penempatan}</td>
                      <td className="px-4 py-2">{item.status_kontrak}</td>
                      <td className="px-4 py-2 flex justify-center">
                        <button
                          type="button" 
                          onClick={() => handleOpenEditModal(item, index)}
                          className="text-blue-600 hover:underline mr-3"
                        >
                          Ubah
                        </button>
                        <button
                          type="button" 
                          onClick={() => {
                            setIsDeleteOpen(true);
                            setEditingIndex(index); 
                          }}
                          className="text-red-600 hover:underline ml-3"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-2 text-center">
                        Tidak ada data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <FilterModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}> 
              <FilterEditFormKontrak 
                onApply={(formData) => {
                  handleEditDOH({ ...formData, ID: editingData?.ID }, editingIndex ?? undefined);
                  setEditingData(null);
                  setEditingIndex(null); 
                }}
                onReset={handleResetEdit} 
                defaultValues={{
                  pt: editingData?.pt ?? '',
                  doh_date: editingData?.tanggal_doh ? new Date(editingData.tanggal_doh) : null,
                  tanggal_end_doh: editingData?.tanggal_end_doh ? new Date(editingData.tanggal_end_doh) : null,
                  penempatan: editingData?.penempatan ?? '',
                  status_kontrak: editingData?.status_kontrak ?? '',
                }}
              />
            </FilterModal> 
              <FilterModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
                <DeleteForm
                  onCancel={() => {  
                    setIsDeleteOpen(false);
                    setEditingIndex(null);
                  }}
                  onConfirm={async () => {
                    if (editingIndex !== null) {
                      await handleDelete(editingIndex); // ✅ Use saved index
                      setIsDeleteOpen(false);
                      setEditingIndex(null);
                    }
                  }}
                />
              </FilterModal>
          <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}> 
            <FilterFormKontrak onApply={handleAddDOH} onReset={handleReset} />
          </FilterModal>
        </div>
      </div>
      </>
    ); 

      case 'Sertifikat':
        return ( 
          <> 
          <div className="mt-6" >
            <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">Data Sertifikat</h2>
               <ButtonAction
                className={`px-4 !mt-0`}
                onClick={() => setIsFilterOpen(true)}
                icon={<Plus size={24} />}
              >
                Buat Baru
              </ButtonAction>
            </div>

              <div className="mt-8"> 
                <table className="min-w-full text-left border-collapse">
                  <thead className="bg-gray-100">
                    <tr className="bg-[#FF3131] text-white text-center">
                      <th className="px-4 py-2">No</th>
                      <th className="px-4 py-2">Jenis Sertifikat</th>
                      <th className="px-4 py-2">Keterangan</th>
                      <th className="px-4 py-2">Masa Berlaku</th>
                      <th className="px-4 py-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                  {sertifikatList.length > 0 ? (
                    sertifikatList.map((item, index) => (
                      <tr key={index} className="border-t text-center">
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{item.sertifikat}</td> 
                        <td className="px-4 py-2">{item.remark}</td> 
                        <td className="px-4 py-2">{item.date_effective as string}</td>
                        <td className="px-4 py-2 flex justify-center">
                          <button
                            type="button" 
                            onClick={() => handleOpenEdiSertifikatModal(item, index)}
                            className="text-blue-600 hover:underline mr-3"
                          >
                            Ubah
                          </button> 
                          <button
                            type="button" 
                            onClick={() => {
                              setIsDeleteOpen(true);
                              setEditingIndex(index); 
                            }}
                            className="text-red-600 hover:underline ml-3"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-2 text-center">
                          Tidak ada data.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <FilterModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}> 
                <FilterEditFormSertifikat
                  onApply={(formData) => {
                    handleEditSertifikat({ ...formData, ID: editingDataSertifikat?.ID }, editingIndex ?? undefined);
                    setEditingDataSertifikat(null);
                    setEditingIndex(null); 
                  }}
                  onReset={handleResetEdit} 
                  defaultValues={{
                    sertifikat: editingDataSertifikat?.sertifikat ?? editingDataSertifikat?.sertifikat ?? '',
                    date_effective: editingDataSertifikat?.date_effective ? new Date(editingDataSertifikat.date_effective) : null,
                    remark: editingDataSertifikat?.remark ?? editingDataSertifikat?.remark ?? '',
                  }}
                />
              </FilterModal> 
              <FilterModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
                <DeleteForm
                  onCancel={() => {  
                    setIsDeleteOpen(false);
                    setEditingIndex(null);
                  }}
                  onConfirm={async () => {
                    if (editingIndex !== null) {
                      await handleDeleteSertifikat(editingIndex); // ✅ Use saved index
                      setIsDeleteOpen(false);
                      setEditingIndex(null);
                    }
                  }}
                />
              </FilterModal>
            <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}> 
              <FilterFormSertifikat onApply={handleAddSertifikat} onReset={handleReset} />
            </FilterModal>
          </div> 
        </>
      );

      case 'MCU':
        return ( 
          <> 
          <div className="mt-6" >
            <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">Data MCU</h2>
               <ButtonAction
                className={`px-4 !mt-0`}
                onClick={() => setIsFilterOpen(true)}
                icon={<Plus size={24} />}
              >
                Buat Baru
              </ButtonAction>
            </div>

              <div className="mt-8"> 
                <table className="min-w-full text-left border-collapse">
                  <thead className="bg-gray-100">
                    <tr className="bg-[#FF3131] text-white text-center">
                      <th className="px-4 py-2">No</th>
                      <th className="px-4 py-2">Tanggal Pelaksanaan MCU</th>
                      <th className="px-4 py-2">Tanggal MCU Berikutnya</th>
                      <th className="px-4 py-2">Hasil MCU</th>
                      <th className="px-4 py-2">Keterangan</th>
                      <th className="px-4 py-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                  {mcuList.length > 0 ? (
                    mcuList.map((item, index) => (
                      <tr key={index} className="border-t text-center">
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{item.date_mcu as string}</td>
                        <td className="px-4 py-2">{item.date_end_mcu as string}</td>
                        <td className="px-4 py-2">{item.hasil_mcu}</td>
                        <td className="px-4 py-2">{item.mcu}</td>
                        <td className="px-4 py-2 flex justify-center">
                          <button
                            type="button" 
                            onClick={() => handleOpenEdiMCUModal(item, index)}
                            className="text-blue-600 hover:underline mr-3"
                          >
                            Ubah
                          </button> 
                          <button
                            type="button" 
                            onClick={() => {
                              setIsDeleteOpen(true);
                              setEditingIndex(index); 
                            }}
                            className="text-red-600 hover:underline ml-3"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-2 text-center">
                          Tidak ada data.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <FilterModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}> 
                <FilterEditFormMCU
                  onApply={(formData) => {
                    handleEditMCU({ ...formData, ID: editingDataMCU?.ID }, editingIndex ?? undefined);
                    setEditingDataMCU(null);
                    setEditingIndex(null); 
                  }}
                  onReset={handleResetEdit} 
                  defaultValues={{
                    mcu: editingDataMCU?.mcu ?? editingDataMCU?.mcu ?? '',
                    date_mcu: editingDataMCU?.date_mcu ? new Date(editingDataMCU.date_mcu) : null,
                    date_end_mcu: editingDataMCU?.date_end_mcu ? new Date(editingDataMCU.date_end_mcu) : null,
                    hasil_mcu: editingDataMCU?.hasil_mcu ?? editingDataMCU?.hasil_mcu ?? '',
                  }}
                />
              </FilterModal> 
              <FilterModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
                <DeleteForm
                  onCancel={() => {  
                    setIsDeleteOpen(false);
                    setEditingIndex(null);
                  }}
                  onConfirm={async () => {
                    if (editingIndex !== null) {
                      await handleDeleteMCU(editingIndex); // ✅ Use saved index
                      setIsDeleteOpen(false);
                      setEditingIndex(null);
                    }
                  }}
                />
              </FilterModal>
            <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}> 
              <FilterFormMCU onApply={handleAddMCU} onReset={handleReset} />
            </FilterModal>
          </div> 
        </>
      );

      case 'Laporan':
        return ( 
          <div className="mt-6">
            <h2 className="text-xl font-bold">Data Laporan</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 '>
              <div className="space-y-4">
                <SelectField
                  label="Ring Serapan"
                  {...register('Laporan.ring_serapan')}
                  value={watch('Laporan.ring_serapan')}
                  onChange={(e) => setValue('Laporan.ring_serapan', e.target.value)}
                  options={ringSerapanOptions}
                  error={errors.Laporan?.ring_serapan?.message}
                />   
                <SelectField
                  label="Ring RIPPM"
                  {...register('Laporan.ring_rippm')}
                  value={watch('Laporan.ring_rippm')}
                  onChange={(e) => setValue('Laporan.ring_rippm', e.target.value)}
                  options={ringOptions}
                  error={errors.Laporan?.ring_rippm?.message}
                />    
              </div>  
              <div className="space-y-4">
                <SelectField
                  label="Kategori Laporan Triwulan"
                  {...register('Laporan.kategori_laporan_twiwulan')}
                  value={watch('Laporan.kategori_laporan_twiwulan')}
                  onChange={(e) => setValue('Laporan.kategori_laporan_twiwulan', e.target.value)}
                  options={kategoriLaporanTriwulanOptions}
                  error={errors.Laporan?.kategori_laporan_twiwulan?.message}
                />   
                <SelectField
                  label="Kategori Statistik K3"
                  {...register('level')}
                  value={watch('level')}
                  onChange={(e) => setValue('level', e.target.value)}
                  options={levelOptions}
                  error={errors.level?.message}
                /> 
                <SelectField
                  label="Kategori Lokal / Non Lokal"
                  {...register('Laporan.kategori_lokal_non_lokal')}
                  value={watch('Laporan.kategori_lokal_non_lokal')}
                  onChange={(e) => setValue('Laporan.kategori_lokal_non_lokal', e.target.value)}
                  options={LokalNonLokalOptions}
                  error={errors.Laporan?.kategori_lokal_non_lokal?.message}
                />     
                <InputFieldsLabel
                  label="Rekomendasi :"
                  type="text"
                  {...register('Laporan.rekomendasi')}
                  value={watch('Laporan.rekomendasi')}
                  error={errors.Laporan?.rekomendasi?.message}
                /> 
              </div>  
          </div> 
        </div>
      ); 

      case 'APD':
        return ( 
          <div className="mt-6">
            <h2 className="text-xl font-bold">Data APD</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 '> 
              <div className="space-y-4"> 
                <InputFieldsLabel
                  label="Ukuran Baju :"
                  type="text"
                  {...register('APD.ukuran_baju')}
                  value={watch('APD.ukuran_baju')}
                  error={errors.APD?.ukuran_baju?.message}
                />  
                <InputFieldsLabel
                  label="Ukuran Celana :"
                  type="text"
                  {...register('APD.ukuran_celana')}
                  value={watch('APD.ukuran_celana')}
                  error={errors.APD?.ukuran_celana?.message}
                />  
                <InputFieldsLabel
                  label="Ukuran Sepatu :"
                  type="text"
                  {...register('APD.ukuran_sepatu')}
                  value={watch('APD.ukuran_sepatu')}
                  error={errors.APD?.ukuran_sepatu?.message}
                />  
              </div>  
          </div> 
        </div>
      ); 

      case 'Pajak':
        return ( 
          <div className="mt-6">
            <h2 className="text-xl font-bold">Data Pajak</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 '> 
              <div className="space-y-4"> 
                <InputFieldsLabel
                  label="NPWP :"
                  type="text"
                  {...register('NPWP.nomor_npwp')}
                  value={watch('NPWP.nomor_npwp') ?? ''} // ✅ null becomes ''
                  error={errors.NPWP?.nomor_npwp?.message}
                />    
                <SelectField
                  label="Status Pajak"
                  {...register('NPWP.status_pajak')}
                  value={watch('NPWP.status_pajak') ?? ''} // ✅ Fallback to empty string
                  onChange={(e) => setValue('NPWP.status_pajak', e.target.value)}
                  options={pajakOptions}
                  error={errors.NPWP?.status_pajak?.message}
                />   
              </div>  
          </div> 
        </div>
      ); 
 
      case 'Bank':
        return ( 
          <div className="mt-6">
            <h2 className="text-xl font-bold">Data Bank</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 '> 
              <div className="space-y-4"> 
                <SelectField
                  label="Nama Bank"
                  {...register('Bank.nama_bank')}
                  value={watch('Bank.nama_bank')}
                  onChange={(e) => setValue('Bank.nama_bank', e.target.value)}
                  options={bankOptions}
                  error={errors.Bank?.nama_bank?.message}
                />   
                <InputFieldsLabel
                  label="Nomor Rekening :"
                  type="text"
                  {...register('Bank.nomor_rekening')}
                  value={watch('Bank.nomor_rekening')}
                  error={errors.Bank?.nomor_rekening?.message}
                />   
                <InputFieldsLabel
                  label="Nama Pemilik Bank :"
                  type="text"
                  {...register('Bank.nama_pemilik_bank')}
                  value={watch('Bank.nama_pemilik_bank')}
                  error={errors.Bank?.nama_pemilik_bank?.message}
                />     
              </div>  
          </div> 
        </div>
      ); 

      case 'BPJS Kesehatan':
        return ( 
          <div className="mt-6">
            <h2 className="text-xl font-bold">Data BPJS Kesehatan</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 '> 
              <div className="space-y-4">  
                <InputFieldsLabel
                  label="Nomor BPJS Kesehatan :"
                  type="text"
                  {...register('BPJSKesehatan.nomor_kesehatan')}
                  value={watch('BPJSKesehatan.nomor_kesehatan') ?? ''}
                  error={errors.BPJSKesehatan?.nomor_kesehatan?.message}
                />    
              </div>  
          </div> 
        </div>
      ); 

      case 'BPJS Ketenagakerjaan':
        return ( 
          <div className="mt-6">
            <h2 className="text-xl font-bold">Data BPJS Ketenagakerjaan</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 '> 
              <div className="space-y-4">  
                <InputFieldsLabel
                  label="Nomor BPJS Ketenagakerjaan :"
                  type="text"
                  {...register('BPJSKetenagakerjaan.nomor_ketenagakerjaan')}
                  value={watch('BPJSKetenagakerjaan.nomor_ketenagakerjaan') ?? ''}
                  error={errors.BPJSKetenagakerjaan?.nomor_ketenagakerjaan?.message}
                />    
              </div>  
          </div> 
        </div>
      ); 

      case 'History':
         return ( 
          <>
          <div className="mt-6">
            <h2 className="text-xl font-bold">Data History</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 '>
              <div className="space-y-4">
                <SelectField
                  label="Status Karyawan"
                  {...register('status')}
                  value={watch('status')}
                  onChange={(e) => setValue('status', e.target.value)}
                  options={statusOptions}
                  error={errors.status?.message as string}
                />  
              </div>   
          </div> 
          <div className="mt-8">
            <div className="flex justify-between items-baseline mb-4">
              <h3 className="text-lg font-semibold mt-0">Daftar History</h3>
               <ButtonAction
                className={`px-4 mt-0`}
                onClick={() => setIsFilterOpen(true)}
                icon={<Plus size={24} />}
              >
                Buat Baru
              </ButtonAction>
            </div>

              <div className="mt-8"> 
                <table className="min-w-full text-left border-collapse">
                  <thead className="bg-gray-100">
                    <tr className="bg-[#FF3131] text-white text-center">
                      <th className="px-4 py-2">No</th>
                      <th className="px-4 py-2">Tanggal</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Keterangan</th>
                      <th className="px-4 py-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                  {historyList.length > 0 ? (
                    historyList.map((item, index) => (
                      <tr key={index} className="border-t text-center">
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{item.tanggal as string}</td>
                        <td className="px-4 py-2">{item.status_terakhir}</td>
                        <td className="px-4 py-2">{item.keterangan}</td>
                        <td className="px-4 py-2 flex justify-center">
                          <button
                            type="button" 
                            onClick={() => handleOpenEdiHistoryModal(item, index)}
                            className="text-blue-600 hover:underline mr-3"
                          >
                            Ubah
                          </button> 
                          <button
                            type="button" 
                            onClick={() => {
                              setIsDeleteOpen(true);
                              setEditingIndex(index); 
                            }}
                            className="text-red-600 hover:underline ml-3"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-2 text-center">
                          Tidak ada data.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <FilterModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}> 
                <FilterEditFormHistory
                  onApply={(formData) => {
                    handleEditHistory({ ...formData, ID: editingDataHistory?.ID }, editingIndex ?? undefined);
                    setEditingDataHistory(null);
                    setEditingIndex(null); 
                  }}
                  onReset={handleResetEdit} 
                  defaultValues={{
                    status_terakhir: editingDataHistory?.status_terakhir ?? editingDataHistory?.status_terakhir ?? '',
                    tanggal: editingDataHistory?.tanggal ? new Date(editingDataHistory.tanggal) : null,
                    keterangan: editingDataHistory?.keterangan ?? editingDataHistory?.keterangan ?? '',
                  }}
                />
              </FilterModal> 
              <FilterModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
                <DeleteForm
                  onCancel={() => {  
                    setIsDeleteOpen(false);
                    setEditingIndex(null);
                  }}
                  onConfirm={async () => {
                    if (editingIndex !== null) {
                      await handleDeleteHistory(editingIndex); // ✅ Use saved index
                      setIsDeleteOpen(false);
                      setEditingIndex(null);
                    }
                  }}
                />
              </FilterModal>
            <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}> 
              <FilterFormHistory onApply={handleAddHistory} onReset={handleReset} />
            </FilterModal>
          </div>
        </div>
        </>
      ); 

      default:
        return null;
    }
  };

  const tabs = ['Kartu Keluarga', 'KTP', 'Pendidikan', 'Kontrak', 'Sertifikat', 'MCU', 'Laporan', 'APD', 'Pajak', 'Bank', 'BPJS Kesehatan', 'BPJS Ketenagakerjaan', 'History'];

  return (
    <div>
      <div className="border-b flex gap-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-semibold ${
              activeTab === tab
                ? 'border-b-2 border-red-600 text-red-600'
                : 'text-gray-600 hover:text-red-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-4">{renderTabContent()}</div>
    </div>
  );
};

export default UpdateEmployeeTabs;
