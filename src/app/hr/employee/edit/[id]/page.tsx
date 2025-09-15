'use client';

import { useEffect, useState, use } from 'react';
import ButtonAction from '@/components/ButtonAction';
import ContentHeader from '@/components/ContentHeader';
import SelectField from '@/components/SelectField';
import { MJSUAPI } from '@/api'; 
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import InputFieldsLabel from '@/components/InputFieldsLabel';
import { useForm, Controller } from 'react-hook-form'; 
import { useRouter } from 'next/navigation';
import ButtonDisabled from '@/components/ButtonDisabled';
import 'react-datepicker/dist/react-datepicker.css';  
import EditEmployeeTabs from './EditEmployeeTabs';
import { Department, EmployeeAddDetailEditFormValue, Position, Role } from '@/types/EmployeeValues';
import DatePicker from 'react-datepicker';
import ErrorMessage from '@/components/ErrorMessage';

export default function UbahDataFuelRatioForm({ params }: { params: Promise<{ id: string }> }) {  
  const { id } = use(params); // ✅ unwrap params properly
  const [detail, setDetail] = useState<EmployeeAddDetailEditFormValue | null>(null);
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const router = useRouter();
  const [departmentOptions, setDepartmentOptions] = useState<{ label: string; value: string }[]>([]);
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([]);
  const [selectedJabatan, setSelectedJabatan] = useState<{ label: string; value: string }[]>([]); 

  const {
  register,
  handleSubmit,
  setError,
  watch,
  setValue, 
  reset,
  control, // ✅ include this
  formState: { errors },
} = useForm<EmployeeAddDetailEditFormValue>({
  mode: 'onSubmit',
  defaultValues: {
    nomor_karyawan: '',
    department_id: 0,
    firstname: '',
    lastname: '',
    phone_number: '',
    email: '',
    level: '', 
    status: '',
    role_id: 0,
    hire_by: '',
    position_id: 0,
    date_of_hire: '',
    Department: {
      ID: 0,
      department_name: '',
    },
    Role: {
      ID: 0,
      name: '',
    },
    KartuKeluarga: {
      ID: 0,
      nomor_kartu_keluarga: '',
      nama_ibu_kandung: '',
      kontak_darurat: '',
      nama_kontak_darurat: '',
      hubungan_kontak_darurat: '',
    },
    KTP : {  
      nama_sesuai_ktp: '',
      nomor_ktp: '',
      tempat_lahir: '',
      tanggal_lahir: '',
      gender: '',
      alamat: '',
      rt: '',
      rw: '',
      kelurahan: '',
      kecamatan: '',
      kota: '',
      provinsi: '',
      kode_pos: '',
      golongan_darah: '',
      agama: '',
      ring_ktp: '',
    },
    Pendidikan : {
      pendidikan_label: '',
      pendidikan_terakhir: '',
      jurusan: '', 
    },    
    Laporan: { 
      ring_serapan: '',
      ring_rippm: '',
      kategori_laporan_twiwulan: '',
      kategori_lokal_non_lokal: '',
      rekomendasi: '',
    },
    APD: { 
      ukuran_baju : '',
      ukuran_celana: '',
      ukuran_sepatu: '',
    },
    NPWP: {
      nomor_npwp : '',
      status_pajak: '',
    },
    Bank: {  
      nama_bank : '',
      nomor_rekening: '',
      nama_pemilik_bank: '',
    },
    BPJSKesehatan: {  
      nomor_kesehatan : '', 
    },
    BPJSKetenagakerjaan: {  
      nomor_ketenagakerjaan : '', 
    }, 
  },
});     

  const normalizeDate = (date: string | Date | null): string | null => {
    if (date instanceof Date) return date.toISOString().split('T')[0];
    return date || null;
  };

  const onSubmit = async (formData: EmployeeAddDetailEditFormValue) => {  
    let hasError = false;

    if (!formData.nomor_karyawan || formData.nomor_karyawan.trim() === '') {  
      setError("nomor_karyawan", { type: "manual", message: "Nomor Karyawan wajib diisi" });
      hasError = true;
    }

    if (isNaN(formData.department_id) || formData.department_id <= 0) {
      setError("department_id", {type: "manual", message: "Department wajib diisi"});
      hasError = true;
    }
  
    if (!formData.firstname || formData.firstname.trim() === '') {  
      setError("firstname", {type: "manual", message: "Nama Depan Karyawan wajib diisi"});
      hasError = true;
    } 

    if (!formData.level || formData.level.trim() === '') {  
      setError("level", {type: "manual", message: "Level wajib diisi"});
      hasError = true;
    } 

    if (isNaN(formData.role_id) || formData.role_id <= 0) {
      setError("role_id", {type: "manual", message: "Posisi wajib diisi"});
      hasError = true;
    }  
    
    if (!formData.date_of_hire || isNaN(new Date(formData.date_of_hire).getDate())){  
      setError("date_of_hire", {type: "manual", message: "Tanggal Date Of Hire wajib diisi"});
      hasError = true;
    }  

    if (!formData.KartuKeluarga.nomor_kartu_keluarga || formData.KartuKeluarga.nomor_kartu_keluarga.trim() === '') {  
      setError("KartuKeluarga.nomor_kartu_keluarga", {type: "manual", message: "Nomor Kartu Keluarga wajib diisi"});
      hasError = true;
    }  
    
    if (!formData.KartuKeluarga.nama_ibu_kandung || formData.KartuKeluarga.nama_ibu_kandung.trim() === '') {  
      setError("KartuKeluarga.nama_ibu_kandung", {type: "manual", message: "Nama Ibu Kandung wajib diisi"});
      hasError = true;
    } 

    if (!formData.KartuKeluarga.kontak_darurat || formData.KartuKeluarga.kontak_darurat.trim() === '') {  
      setError("KartuKeluarga.kontak_darurat", {type: "manual", message: "Kontak Darurat wajib diisi"});
      hasError = true;
    } 

    if (!formData.KartuKeluarga.nama_kontak_darurat || formData.KartuKeluarga.nama_kontak_darurat.trim() === '') {  
      setError("KartuKeluarga.nama_kontak_darurat", {type: "manual", message: "Nama Kontak Darurat wajib diisi"});
      hasError = true;
    } 

    if (!formData.KartuKeluarga.hubungan_kontak_darurat || formData.KartuKeluarga.hubungan_kontak_darurat.trim() === '') {  
      setError("KartuKeluarga.hubungan_kontak_darurat", {type: "manual", message: "Hubungan Kontak Darurat wajib diisi"});
      hasError = true;
    } 

    if (!formData.KTP.nomor_ktp || formData.KTP.nomor_ktp.trim() === '') {  
      setError("KTP.nomor_ktp", {type: "manual", message: "Nomor KTP wajib diisi"});
      hasError = true;
    } 

    if (!formData.KTP.nama_sesuai_ktp || formData.KTP.nama_sesuai_ktp.trim() === '') {  
      setError("KTP.nama_sesuai_ktp", {type: "manual", message: "Nama Sesuai KTP wajib diisi"});
      hasError = true;
    } 

    if (!formData.KTP.tempat_lahir || formData.KTP.tempat_lahir.trim() === '') {  
      setError("KTP.tempat_lahir", {type: "manual", message: "Tempat Lahir wajib diisi"});
      hasError = true;
    } 

    if (!formData.KTP.tanggal_lahir || isNaN(new Date(formData.KTP.tanggal_lahir).getDate())){  
      setError("KTP.tanggal_lahir", {type: "manual", message: "Tanggal Lahir wajib diisi"});
      hasError = true;
    }  

    if (!formData.KTP.gender || formData.KTP.gender.trim() === '') {  
      setError("KTP.gender", {type: "manual", message: "Gender wajib dipilih"});
      hasError = true;
    } 
    
    if (!formData.KTP.golongan_darah || formData.KTP.golongan_darah.trim() === '') {  
      setError("KTP.golongan_darah", {type: "manual", message: "Golongan Darah wajib dipilih"});
      hasError = true;
    } 

    if (!formData.KTP.agama || formData.KTP.agama.trim() === '') {  
      setError("KTP.agama", {type: "manual", message: "Agama wajib dipilih"});
      hasError = true;
    } 

    if (!formData.KTP.ring_ktp || formData.KTP.ring_ktp.trim() === '') {  
      setError("KTP.ring_ktp", {type: "manual", message: "Ring (KTP) wajib dipilih"});
      hasError = true;
    } 

    if (!formData.KTP.alamat || formData.KTP.alamat.trim() === '') {  
      setError("KTP.alamat", {type: "manual", message: "Alamat wajib diisi"});
      hasError = true;
    }  

    if (!formData.KTP.rt || formData.KTP.rt.trim() === '') {  
      setError("KTP.rt", {type: "manual", message: "RT wajib diisi"});
      hasError = true;
    } 

    if (!formData.KTP.rw || formData.KTP.rw.trim() === '') {  
      setError("KTP.rw", {type: "manual", message: "RW wajib diisi"});
      hasError = true;
    } 

    if (!formData.KTP.kelurahan || formData.KTP.kelurahan.trim() === '') {  
      setError("KTP.kelurahan", {type: "manual", message: "Kelurahan / Desa wajib diisi"});
      hasError = true;
    } 

    if (!formData.KTP.kecamatan || formData.KTP.kecamatan.trim() === '') {  
      setError("KTP.kecamatan", {type: "manual", message: "Kecamatan wajib diisi"});
      hasError = true;
    } 

    if (!formData.KTP.kota || formData.KTP.kota.trim() === '') {  
      setError("KTP.kota", {type: "manual", message: "Kota / Kabupaten wajib diisi"});
      hasError = true;
    } 

    if (!formData.KTP.provinsi || formData.KTP.provinsi.trim() === '') {  
      setError("KTP.provinsi", {type: "manual", message: "Provinsi wajib diisi"});
      hasError = true;
    } 

    if (!formData.Pendidikan.pendidikan_label || formData.Pendidikan.pendidikan_label.trim() === '') {  
      setError("Pendidikan.pendidikan_label", {type: "manual", message: "Jenjang Pendidikan wajib diisi"});
      hasError = true;
    } 

    if (!formData.Pendidikan.pendidikan_terakhir || formData.Pendidikan.pendidikan_terakhir.trim() === '') {  
      setError("Pendidikan.pendidikan_terakhir", {type: "manual", message: "Pendidikan Terakhir wajib diisi"});
      hasError = true;
    } 

    if (!formData.hire_by || formData.hire_by.trim() === '') {  
      setError("hire_by", {type: "manual", message: "Hire By wajib dipilih"});
      hasError = true;
    } 

    if (!formData.Laporan.ring_serapan || formData.Laporan.ring_serapan.trim() === '') {  
      setError("Laporan.ring_serapan", {type: "manual", message: "Ring Serapan wajib dipilih"});
      hasError = true;
    }

    if (!formData.Laporan.ring_rippm || formData.Laporan.ring_rippm.trim() === '') {  
      setError("Laporan.ring_rippm", {type: "manual", message: "Ring RIPPM wajib dipilih"});
      hasError = true;
    }

    if (!formData.Laporan.kategori_laporan_twiwulan || formData.Laporan.kategori_laporan_twiwulan.trim() === '') {  
      setError("Laporan.kategori_laporan_twiwulan", {type: "manual", message: "Kategori Laporan Triwulan wajib dipilih"});
      hasError = true;
    }

    if (!formData.Laporan.kategori_lokal_non_lokal || formData.Laporan.kategori_lokal_non_lokal.trim() === '') {  
      setError("Laporan.kategori_lokal_non_lokal", {type: "manual", message: "Kategori Lokal / Non Lokal wajib dipilih"});
      hasError = true;
    }  

      if (!formData.status || formData.status.trim() === '') {  
      setError("status", {type: "manual", message: "Status wajib dipilih"});
      hasError = true;
    }  
    
    formData.date_of_hire = normalizeDate(formData.date_of_hire);
    // Normalize date fields
  formData.KTP.tanggal_lahir = normalizeDate(formData.KTP.tanggal_lahir);
  console.log(formData);
  if (hasError) return; 
    try {
      await MJSUAPI({ 
        url: `/employee/update/${id}`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'content-type': 'application/json',
          Accept: "application/json",
        },
        data: formData,
      }); 
    router.push('/hr/employee');
  } catch (error) {
    console.error('Update failed:', error);
  }
};   

useEffect(() => {
  const fetchDetail = async () => {
    try {
      const { data } = await MJSUAPI({
        url: `/employee/detail/${id}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setDetail(data);
      reset(data); // ✅ this will prefill the form fields
    } catch (error) {
      console.error("Failed to fetch detail:", error);
    }
  };

  if (token) {
    fetchDetail();
  }
}, [token, id, reset]);
 
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [departmentRes, roleRes, positionRes] = await Promise.all([
          MJSUAPI({
            url: '/master/list/department',
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          }), 
          MJSUAPI({
            url: '/master/list/role',
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          }), 
          MJSUAPI({
            url: '/master/list/position',
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          }), 
        ]);
        
        // Langsung ambil dari response
      const departmentOptions = departmentRes.data.map((dept: Department) => ({
        label: dept.department_name,
        value: dept.ID.toString(), // pakai string untuk value jika dropdown-nya pakai string
      }));

      // Simpan ke state
      setDepartmentOptions(departmentOptions);

      const roleOptions = roleRes.data.map((dept: Role) => ({
        label: dept.name,
        value: dept.ID.toString(), // pakai string untuk value jika dropdown-nya pakai string
      }));

      // Simpan ke state
      setRoleOptions(roleOptions); 

      // Langsung ambil dari response
      const positionOptions = positionRes.data.map((pos: Position) => ({
        label: pos.position_name,
        value: pos.ID?.toString(), // pakai string untuk value jika dropdown-nya pakai string
      }));

      // Simpan ke state
      setSelectedJabatan(positionOptions);
      } catch (err) {
        console.error('Error fetching filter data:', err);
      }
    };

    if (token) fetchInitialData();
  }, [token]);

  return (
    <>
    <div className="relative mx-auto"> 

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4"> 
          <ContentHeader className="m-0" title="Ubah Data Employee" /> 
          <div className="flex gap-2">
            <ButtonDisabled type="button" 
            onClick={() => router.push(`/hr/employee/detail/${id}`)}
            className="px-6">
              Kembali
            </ButtonDisabled> 
            <ButtonAction type="submit" className="px-6">
            Simpan
          </ButtonAction>
          </div>
        </div> 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column: 4 stacked fields */}
          <div className="space-y-4">
            <InputFieldsLabel
              label="Nomor Karyawan :"
              type="text"
              {...register('nomor_karyawan', {
              })}
              error={errors.nomor_karyawan?.message}
            />  
            <InputFieldsLabel
              label="Nama Depan Karyawan :"
              type="text"
              {...register('firstname', {
              })}
              error={errors.firstname?.message}
            /> 
            <InputFieldsLabel
              label="Nama Belakang Karyawan :"
              type="text"
              {...register('lastname', {
              })}
              error={errors.lastname?.message}
            />   
            <SelectField
              label="Department"
              {...register('department_id')}
              value={watch('department_id')}
              onChange={(e) => setValue('department_id', Number(e.target.value))}
              options={departmentOptions}
              error={errors.department_id?.message}
            /> 
            <div className="col-span-3 grid grid-cols-3 items-start gap-4">
              <label className="text-left font-medium pt-2">Date Of Hire :</label> 
                <div className="col-span-2 space-y-1">
                <Controller
                  control={control}
                  name="date_of_hire"
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value as Date}
                      onChange={field.onChange}
                      dateFormat="yyyy-MM-dd"
                      className={`w-75 border rounded px-3 py-2 ${errors.date_of_hire ? 'border-red-500' : ''}`}
                      placeholderText="Pilih Date Of Hire"
                    />
                  )}
                /> 
                <ErrorMessage>{errors.date_of_hire?.message}</ErrorMessage>
              </div>
            </div>
          </div>

          {/* Right column: 4 stacked fields */}
          <div className="space-y-4"> 
              <SelectField
                label="Jabatan"
                {...register('position_id')}
                value={watch('position_id')}
                onChange={(e) => setValue('position_id', Number(e.target.value))}
                options={selectedJabatan}
                error={errors.position_id?.message}
              /> 
              <InputFieldsLabel
                label="Nomor Telpon :"
                type="text"
                {...register('phone_number', {
                })}
                error={errors.phone_number?.message}
              /> 
              <InputFieldsLabel
                label="Email Karyawan :"
                type="text"
                {...register('email', {
                })}
                error={errors.email?.message}
              /> 
              <SelectField
                label="Level"
                {...register('role_id')}
                value={watch('role_id')}
                onChange={(e) => setValue('role_id', Number(e.target.value))}
                options={roleOptions}
                error={errors.role_id?.message}
              /> 
          </div>
        </div> 
      </form>
    </div> 
    <div className="mt-6">
      <EditEmployeeTabs
          register={register}
          errors={errors}
          setValue={setValue}
          watch={watch}
          control={control}
          detail={detail as EmployeeAddDetailEditFormValue} // <-- pass it here
          id={id}
        /> 
    </div>
    </>
  );
}
