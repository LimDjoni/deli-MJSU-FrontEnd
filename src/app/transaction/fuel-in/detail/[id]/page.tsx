'use client';

import { useEffect, useState, use } from 'react';
import ButtonAction from '@/components/ButtonAction';
import ContentHeader from '@/components/ContentHeader';
import { MrpAPI } from '@/api'; 
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import InputFieldsLabel from '@/components/InputFieldsLabel';
import { useRouter } from 'next/navigation';
import ButtonDisabled from '@/components/ButtonDisabled';
import FilterModal from '@/components/Modal'; 
import DeleteForm from '@/components/DeleteForm';
import { FuelIn } from '@/types/FuelInValues';

type MenuItem = {
  id: number;
  form_name: string;
  path?: string;
  children?: MenuItem[];
  create_flag?: boolean;
  update_flag?: boolean;
  read_flag?: boolean;
  delete_flag?: boolean;
};

export default function DetailDataFuelInForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // ✅ unwrap params properly
  const [detail, setDetail] = useState<FuelIn | null>(null);
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const menuItems = useSelector((state: RootState) => state.sidebar.menuItems);

  const getUpdateFlag = (items: MenuItem[], targetPath: string): boolean => {
    for (const item of items) {
      if (item.path === targetPath) return item.update_flag ?? false;
      if (item.children) {
        const found = getUpdateFlag(item.children, targetPath);
        if (found) return true;
      }
    }
    return false;
  };

  const getDeleteFlag = (items: MenuItem[], targetPath: string): boolean => {
    for (const item of items) {
      if (item.path === targetPath) return item.delete_flag ?? false;
      if (item.children) {
        const found = getDeleteFlag(item.children, targetPath);
        if (found) return true;
      }
    }
    return false;
  };

const updateFlag = getUpdateFlag(menuItems, '/transaction/fuel-in');
const deleteFlag = getDeleteFlag(menuItems, '/transaction/fuel-in');
 
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data } = await MrpAPI({
          url: `/fuelin/detail/${id}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setDetail(data);
      } catch (error) {
        console.error("Failed to fetch detail:", error);
      }
    };

    if (token) {
      fetchDetail();
    }
  }, [token, id]); 

  const handleDelete = async () => { 
    try {
      await MrpAPI({
        url: `/fuelin/delete/${id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
 
      router.push("/transaction/fuel-in");
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  }; 

  return (
    <>
    <div className="relative mx-auto"> 
 
        <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4"> 
          <ContentHeader className="m-0" title="Detail Data Fuel Out" /> 
          <div className="flex gap-2">
            <ButtonDisabled type="button" 
            onClick={() => router.push('/transaction/fuel-in/')}
            className="px-6">
              Kembali
            </ButtonDisabled>
            <ButtonAction type="button" 
              disabled={!deleteFlag}
              className={`px-6 ${!deleteFlag ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => deleteFlag && setIsFilterOpen(true)}
            >
              Hapus
            </ButtonAction> 
            <ButtonAction type="submit" 
              disabled={!updateFlag}
              className={`px-6 ${!updateFlag ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => updateFlag && router.push(`/transaction/fuel-in/edit/${id}`)}
            >
              Ubah
            </ButtonAction> 
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column: 4 stacked fields */}
            <InputFieldsLabel
              label="Tanggal :"
              type="text"
              value={detail?.date as string ?? ''}
              readOnly
            />   
            <InputFieldsLabel
              label="Vendor :"
              type="text"
              value={detail?.vendor ?? ''}
              readOnly
            />   
            <InputFieldsLabel
              label="B35/40 :"
              type="text"
              value={detail?.code ?? ''}
              readOnly
            />     
            <InputFieldsLabel
              label="Nomor Surat Jalan :"
              type="text"
              value={detail?.nomor_surat_jalan ?? ''}
              readOnly
            />   
            <InputFieldsLabel
              label="Nomor Plat Mobil :"
              type="text"
              value={detail?.nomor_plat_mobil ?? ''}
              readOnly
            /> 
            <InputFieldsLabel
              label="Qty :"
              type="text"
              value={detail?.qty ?? ''}
              readOnly
            /> 
            <InputFieldsLabel
              label="Qty Aktual :"
              type="text"
              value={detail?.qty_now ?? ''}
              readOnly
            /> 
            <InputFieldsLabel
              label="Driver :"
              type="text"
              value={detail?.driver ?? ''}
              readOnly
            /> 
            <InputFieldsLabel
              label="Tujuan Awal :"
              type="text"
              value={detail?.tujuan_awal ?? ''}
              readOnly
            /> 
        </div>   
    </div> 

     <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <DeleteForm
          onCancel={() => {  
            setIsFilterOpen(false);
          }}
          onConfirm={async () => {
            await handleDelete(); // ← perform deletion
            setIsFilterOpen(false);
          }}
        />
      </FilterModal>
    </>
  );
}
