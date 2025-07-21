import React, { useState } from 'react';
import InputFieldsLabel from './InputFieldsLabel';
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch, Controller, Control } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import ErrorMessage from './ErrorMessage';
import SelectField from './SelectField';
import ButtonAction from './ButtonAction';
import { Plus } from 'lucide-react';
import FilterModal from './Modal';
import FilterFormKontrak from '@/app/hr/employee/FilterFormKontrak';
import FilterFormSertifikat from '@/app/hr/employee/FilterFormSertifikat';
import FilterFormMCU from '@/app/hr/employee/FilterFormMCU';
import FilterFormHistory from '@/app/hr/employee/FilterFormHistory';
import { EmployeeAddDetailEditFormValue, SubmittedDOH, SubmittedHistory, SubmittedMCU, SubmittedSertifikat } from '@/types/EmployeeValues';
import { genderOptions, golonganDarahOptions, agamaOptions, ringOptions, hireOptions, ringSerapanOptions, kategoriLaporanTriwulanOptions, LokalNonLokalOptions, pajakOptions, bankOptions, statusOptions, levelOptions, pendidikanOptions } from '@/types/OptionsValue';

type EmployeeTabsProps = {
  register: UseFormRegister<EmployeeAddDetailEditFormValue>;
  errors: FieldErrors<EmployeeAddDetailEditFormValue>;
  setValue: UseFormSetValue<EmployeeAddDetailEditFormValue>;
  watch: UseFormWatch<EmployeeAddDetailEditFormValue>;
  control: Control<EmployeeAddDetailEditFormValue>;
}; 

const EmployeeTabs: React.FC<EmployeeTabsProps> = ({ register, errors, setValue, watch, control }) => {
  const [activeTab, setActiveTab] = useState('Kartu Keluarga'); 
  const [isFilterOpen, setIsFilterOpen] = useState(false); 
  const [dohList, setDohList] = useState<SubmittedDOH[]>([]);
  const [sertifikatList, setSertifikatList] = useState<SubmittedSertifikat[]>([]); 
  const [mcuList, setMCUList] = useState<SubmittedMCU[]>([]); 
  const [historyList, setHistoryList] = useState<SubmittedHistory[]>([]); 

  const handleAddDOH = (data: SubmittedDOH) => {
    const updatedList = [...dohList, data];

    const updatedWithMasaKontrak = updatedList.map((item) => {
      if (item.tanggal_doh && item.tanggal_end_doh) {
        const start = new Date(item.tanggal_doh);
        const endOriginal = new Date(item.tanggal_end_doh);

        // ✅ Add 1 day
        const end = new Date(endOriginal);
        end.setDate(end.getDate() + 1);

        const years = end.getFullYear() - start.getFullYear();
        const months = end.getMonth() - start.getMonth();
        const days = end.getDate() - start.getDate();

        const masa_kontrak = years * 12 + months + (days >= 0 ? 0 : -1);
        return { ...item, masa_kontrak };
      }

      return { ...item, masa_kontrak: null }; // fallback
    });

    setDohList(updatedWithMasaKontrak); // ✅ update UI
    setValue('DOH', updatedWithMasaKontrak); // ✅ update form
    setIsFilterOpen(false);
  };
  
  const handleApplyFilterDOH = (filters: {
    pt: string;
    tanggal_doh: string;
    tanggal_end_doh: string;
    penempatan: string;
    status_kontrak: string;
  }) => {
    const newDOH: SubmittedDOH = {
      ID: 0, // or any logic to generate a unique ID
      pt: filters.pt,
      tanggal_doh: filters.tanggal_doh,
      tanggal_end_doh: filters.tanggal_end_doh,
      masa_kontrak: null,
      penempatan: filters.penempatan,
      status_kontrak: filters.status_kontrak,
    };

    handleAddDOH(newDOH);
  };

  const handleDelete = (index: number) => {
    const updated = dohList.filter((_, i) => i !== index);
    setDohList(updated); // ✅ update UI
    setValue('DOH', updated); // ✅ update form state
  };
 

  const handleAddSertifikat = (data: SubmittedSertifikat) => {
    const updated = [...sertifikatList, data];
    setSertifikatList(updated);
    setValue('Sertifikat', updated);
    setIsFilterOpen(false);
  };

  const handleApplyFilterSertifikat = (filters: {
    sertifikat: string;
    date_effective: string;
    remark: string;
    }) => {
      const newSertifikat: SubmittedSertifikat = {
        ID: 0, // generate a temporary unique ID
        sertifikat: filters.sertifikat,
        date_effective: filters.date_effective, 
        remark: filters.remark,
      };

    handleAddSertifikat(newSertifikat);
  }; 

  const handleDeleteSertifikat = (index: number) => {
    const updated = sertifikatList.filter((_, i) => i !== index);
    setSertifikatList(updated); // ✅ update UI
    setValue('Sertifikat', updated); // ✅ update form state
  };  

  const handleAddMCU = (data: SubmittedMCU) => {
    const updated = [...mcuList, data];
    setMCUList(updated);
    setValue('MCU', updated);
    setIsFilterOpen(false);
  };

  const handleApplyFilterMCU = (filters: { 
    mcu: string;
    date_mcu: string;
    date_end_mcu: string;
    hasil_mcu: string;
    }) => {
      const newMCU: SubmittedMCU = {
        ID: 0, // generate a temporary unique ID
        mcu: filters.mcu,
        date_mcu: filters.date_mcu, 
        date_end_mcu: filters.date_end_mcu, 
        hasil_mcu: filters.hasil_mcu, 
      };

    handleAddMCU(newMCU);
  }; 
  
  const handleDeleteMCU = (index: number) => {
    const updated = mcuList.filter((_, i) => i !== index);
    setMCUList(updated); // ✅ update UI
    setValue('MCU', updated); // ✅ update form state
  };  
    
  const handleAddHistory = (data: SubmittedHistory) => {
    const updated = [...historyList, data];
    setHistoryList(updated);
    setValue('History', updated);
    setIsFilterOpen(false);
  };

  const handleApplyFilterHistory = (filters: { 
  status_terakhir: string;
  tanggal: string;
  keterangan: string;
    }) => {
      const newHistory: SubmittedHistory = {
        ID: 0, // generate a temporary unique ID
        status_terakhir: filters.status_terakhir,
        tanggal: filters.tanggal, 
        keterangan: filters.keterangan, 
      };

    handleAddHistory(newHistory);
  }; 

  const handleDeleteHistory = (index: number) => {
    const updated = historyList.filter((_, i) => i !== index);
    setHistoryList(updated); // ✅ update UI
    setValue('History', updated); // ✅ update form state
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
                  error={errors.hire_by?.message as string}
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
                        <td className="px-4 py-2">
                          <button
                            type="button" 
                            onClick={() => handleDelete(index)}
                            className="text-red-600 hover:underline"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-4 py-2 text-center">
                          Tidak ada data.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}> 
              <FilterFormKontrak onApply={handleApplyFilterDOH} onReset={handleReset} />
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
                        <td className="px-4 py-2">
                          <button
                            type="button" 
                            onClick={() => handleDeleteSertifikat(index)}
                            className="text-red-600 hover:underline"
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
            <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}> 
              <FilterFormSertifikat onApply={handleApplyFilterSertifikat} onReset={handleReset} />
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
                        <td className="px-4 py-2">
                          <button
                            type="button" 
                            onClick={() => handleDeleteMCU(index)}
                            className="text-red-600 hover:underline"
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
            <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}> 
              <FilterFormMCU onApply={handleApplyFilterMCU} onReset={handleReset} />
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
                  value={watch('NPWP.nomor_npwp')}
                  error={errors.NPWP?.nomor_npwp?.message}
                />    
                <SelectField
                  label="Status Pajak"
                  {...register('NPWP.status_pajak')}
                  value={watch('NPWP.status_pajak')}
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
                value={watch('BPJSKesehatan.nomor_kesehatan')} 
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
                  value={watch('BPJSKetenagakerjaan.nomor_ketenagakerjaan')}
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
                        <td className="px-4 py-2">
                          <button
                            type="button" 
                            onClick={() => handleDeleteHistory(index)}
                            className="text-red-600 hover:underline"
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
            <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}> 
              <FilterFormHistory onApply={handleApplyFilterHistory} onReset={handleReset} />
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

export default EmployeeTabs;
