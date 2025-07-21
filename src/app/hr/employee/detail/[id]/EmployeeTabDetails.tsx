import React, { useState } from 'react';  
import InputFieldsLabel from '@/components/InputFieldsLabel';
import { EmployeeAddDetailEditFormValue } from '@/types/EmployeeValues';

interface EmployeeTabDetailsProps {
  data: EmployeeAddDetailEditFormValue; // Preferably define a better type
}

const EmployeeTabDetails: React.FC<EmployeeTabDetailsProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState('Kartu Keluarga'); 
 
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
                  value={data?.KartuKeluarga?.nomor_kartu_keluarga ?? ''}
                  readOnly
                />     
                <InputFieldsLabel
                  label="Nama Ibu Kandung :"
                  value={data?.KartuKeluarga?.nama_ibu_kandung ?? ''}
                  readOnly
                />      
              </div>  
              <div className="space-y-4">
                <InputFieldsLabel
                  label="Kontak Darurat :"
                  value={data?.KartuKeluarga?.kontak_darurat ?? ''}
                  readOnly
                />      
                <InputFieldsLabel
                  label="Nama Kontak Darurat :"
                  value={data?.KartuKeluarga?.nama_kontak_darurat ?? ''}
                  readOnly
                />       
                <InputFieldsLabel
                  label="Hubungan Kontak Darurat  :"
                  value={data?.KartuKeluarga?.hubungan_kontak_darurat ?? ''}
                  readOnly
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
                  value={data?.KTP?.nomor_ktp ?? ''}
                  readOnly
                />     
                <InputFieldsLabel
                  label="Nama Sesuai KTP :"
                  value={data?.KTP?.nama_sesuai_ktp ?? ''}
                  readOnly
                />     
                <InputFieldsLabel
                  label="Tempat Lahir :"
                  value={data?.KTP?.tempat_lahir ?? ''}
                  readOnly
                />  
                <InputFieldsLabel
                  label="Tanggal Lahir :"
                  value={data?.KTP?.tanggal_lahir as string ?? ''}
                  readOnly
                />   
                <InputFieldsLabel
                  label="Gender :"
                  value={data?.KTP?.gender ?? ''}
                  readOnly
                />   
                <InputFieldsLabel
                  label="Golongan Darah :"
                  value={data?.KTP?.golongan_darah ?? ''}
                  readOnly
                />  
                <InputFieldsLabel
                  label="Agama :"
                  value={data?.KTP?.agama ?? ''}
                  readOnly
                />  
                <InputFieldsLabel
                  label="Ring (KTP) :"
                  value={data?.KTP?.ring_ktp ?? ''}
                  readOnly
                />     
              </div>  
              <div className="space-y-4">
                <InputFieldsLabel
                  label="Alamat :"
                  value={data?.KTP?.alamat ?? ''}
                  readOnly
                />     
                <InputFieldsLabel
                  label="RT :"
                  value={data?.KTP?.rt ?? ''}
                  readOnly
                />     
                <InputFieldsLabel
                  label="RW :"
                  value={data?.KTP?.rw ?? ''}
                  readOnly
                />     
                <InputFieldsLabel
                  label="Kelurahan / Desa :"
                  value={data?.KTP?.kelurahan ?? ''}
                  readOnly
                />     
                <InputFieldsLabel
                  label="Kecamatan :"
                  value={data?.KTP?.kecamatan ?? ''}
                  readOnly
                />     
                <InputFieldsLabel
                  label="Kota / Kabupaten :"
                  value={data?.KTP?.kota ?? ''}
                  readOnly
                />       
                <InputFieldsLabel
                  label="Provinsi :"
                  value={data?.KTP?.provinsi ?? ''}
                  readOnly
                />         
                <InputFieldsLabel
                  label="Kode Pos :"
                  value={data?.KTP?.kode_pos ?? ''}
                  readOnly
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
                <InputFieldsLabel
                  label="Jenjang Pendidikan :"
                  value={data?.Pendidikan?.pendidikan_label ?? ''}
                  readOnly
                />     
                <InputFieldsLabel
                  label="Pendidikan :"
                  value={data?.Pendidikan?.pendidikan_terakhir ?? ''}
                  readOnly
                />     
                <InputFieldsLabel
                  label="Jurusan :"
                  value={data?.Pendidikan?.jurusan ?? ''}
                  readOnly
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
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 '>
              <div className="space-y-4">
                <InputFieldsLabel
                  label="Hire By :"
                  value={data?.hire_by ?? ''}
                  readOnly
                />      
              </div>   
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
                  </tr>
                </thead>
                <tbody>
                {(data?.DOH?.length ?? 0) > 0 ? ( 
                  data?.DOH.map((item, index) => (
                    <tr key={index} className="border-t text-center">
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">{item?.tanggal_doh as string}</td>
                      <td className="px-4 py-2">{item?.tanggal_end_doh as string}</td>
                      <td className="px-4 py-2">{item?.masa_kontrak} Bulan</td>
                      <td className="px-4 py-2">{item?.pt}</td>
                      <td className="px-4 py-2">{item?.penempatan}</td>
                      <td className="px-4 py-2">{item?.status_kontrak}</td> 
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
        </div>
        </>
      ); 

      case 'Sertifikat':
        return ( 
          <> 
          <div className="mt-6" >
            <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">Data Sertifikat</h2> 
            </div>

              <div className="mt-8"> 
                <table className="min-w-full text-left border-collapse">
                  <thead className="bg-gray-100">
                    <tr className="bg-[#FF3131] text-white text-center">
                      <th className="px-4 py-2">No</th>
                      <th className="px-4 py-2">Jenis Sertifikat</th>
                      <th className="px-4 py-2">Keterangan</th>
                      <th className="px-4 py-2">Masa Berlaku</th> 
                    </tr>
                  </thead>
                  <tbody>
                  {(data?.Sertifikat?.length ?? 0) > 0 ? ( 
                    data?.Sertifikat.map((item, index) => (
                      <tr key={index} className="border-t text-center">
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{item?.sertifikat}</td> 
                        <td className="px-4 py-2">{item?.remark}</td> 
                        <td className="px-4 py-2">{item?.date_effective as string}</td>
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
          </div> 
        </>
      );

      case 'MCU':
        return ( 
          <> 
          <div className="mt-6" >
            <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">Data MCU</h2> 
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
                    </tr>
                  </thead>
                  <tbody>
                  {(data?.MCU?.length ?? 0) > 0 ? (  
                    data?.MCU.map((item, index) => (
                      <tr key={index} className="border-t text-center">
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{item?.date_mcu as string}</td>
                        <td className="px-4 py-2">{item?.date_end_mcu as string}</td>
                        <td className="px-4 py-2">{item?.hasil_mcu}</td>
                        <td className="px-4 py-2">{item?.mcu}</td> 
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
          </div> 
        </>
      );

      case 'Laporan':
        return ( 
          <div className="mt-6">
            <h2 className="text-xl font-bold">Data Laporan</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 '>
              <div className="space-y-4">
                <InputFieldsLabel
                  label="Ring Serapan :"
                  value={data?.Laporan?.ring_serapan ?? ''}
                  readOnly
                />     
                <InputFieldsLabel
                  label="Ring RIPPM :"
                  value={data?.Laporan?.ring_rippm ?? ''}
                  readOnly
                />        
              </div>  
              <div className="space-y-4">
                <InputFieldsLabel
                  label="Kategori Laporan Triwulan :"
                  value={data?.Laporan?.kategori_laporan_twiwulan ?? ''}
                  readOnly
                />    
                <InputFieldsLabel
                  label="Kategori Statistik K3 :"
                  value={data?.level ?? ''}
                  readOnly
                />      
                <InputFieldsLabel
                  label="Kategori Lokal / Non Lokal :"
                  value={data?.Laporan?.kategori_lokal_non_lokal ?? ''}
                  readOnly
                />        
                <InputFieldsLabel
                  label="Rekomendasi :"
                  value={data?.Laporan?.rekomendasi ?? ''}
                  readOnly
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
                  value={data?.APD?.ukuran_baju ?? ''}
                  readOnly
                />      
                <InputFieldsLabel
                  label="Ukuran Celana :"
                  value={data?.APD?.ukuran_celana ?? ''}
                  readOnly
                />      
                <InputFieldsLabel
                  label="Ukuran Sepatu :"
                  value={data?.APD?.ukuran_sepatu ?? ''}
                  readOnly
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
                  value={data?.NPWP?.nomor_npwp ?? ''}
                  readOnly
                />      
                <InputFieldsLabel
                  label="Status Pajak :"
                  value={data?.NPWP?.status_pajak ?? ''}
                  readOnly
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
                <InputFieldsLabel
                  label="Nama Bank :"
                  value={data?.Bank?.nama_bank ?? ''}
                  readOnly
                />     
                <InputFieldsLabel
                  label="Nomor Rekening :"
                  value={data?.Bank?.nomor_rekening ?? ''}
                  readOnly
                />     
                <InputFieldsLabel
                  label="Nama Pemilik Bank :"
                  value={data?.Bank?.nama_pemilik_bank ?? ''}
                  readOnly
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
                value={data?.BPJSKesehatan?.nomor_kesehatan ?? ''}
                readOnly
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
                value={data?.BPJSKetenagakerjaan?.nomor_ketenagakerjaan ?? ''}
                readOnly
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
                <InputFieldsLabel
                  label="Status Karyawan :"
                  value={data?.status ?? ''}
                  readOnly
                />        
              </div>   
          </div> 
          <div className="mt-8">
            <div className="flex justify-between items-baseline mb-4">
              <h3 className="text-lg font-semibold mt-0">Daftar History</h3> 
            </div>

              <div className="mt-8"> 
                <table className="min-w-full text-left border-collapse">
                  <thead className="bg-gray-100">
                    <tr className="bg-[#FF3131] text-white text-center">
                      <th className="px-4 py-2">No</th>
                      <th className="px-4 py-2">Tanggal</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Keterangan</th> 
                    </tr>
                  </thead>
                  <tbody>
                  {(data?.History?.length ?? 0) > 0 ? (  
                    data?.History.map((item, index) => (
                      <tr key={index} className="border-t text-center">
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{item?.tanggal as string}</td>
                        <td className="px-4 py-2">{item?.status_terakhir}</td>
                        <td className="px-4 py-2">{item?.keterangan}</td> 
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

export default EmployeeTabDetails;
