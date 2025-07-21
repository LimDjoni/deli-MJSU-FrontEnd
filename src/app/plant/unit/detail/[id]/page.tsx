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
 
type UnitDetail = {
  ID: number;
  unit_name: string;
  consumption: number;
  brand_id: number;
  heavy_equipment_id: number;
  series_id: number;
  brand: {
    brand_name: string;
  };
  heavy_equipment: {
    heavy_equipment_name: string;
  };
  series: {
    series_name: string;
  };
};

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

export default function DetailDataUnitForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // ✅ unwrap params properly
  const [detail, setDetail] = useState<UnitDetail | null>(null);
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [consumption, setConsumption] = useState<number>(0);
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

  const updateFlag = getUpdateFlag(menuItems, '/plant/alat-berat');
  const deleteFlag = getDeleteFlag(menuItems, '/plant/alat-berat');
 
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data } = await MrpAPI({
          url: `/unit/detail/${id}`,
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
        url: `/unit/delete/${id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
 
      router.push("/plant/unit");
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };

  // Fetch consumption when all are valid AND allowed
  useEffect(() => {
    if (!detail?.brand_id || !detail?.heavy_equipment_id || !detail?.series_id) return;

    const fetchConsumption = async () => {
      try {
        const { data } = await MrpAPI({
          url: `/alatberat/consumption/${detail.brand_id}/${detail.heavy_equipment_id}/${detail.series_id}`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'content-type': 'application/json',
            Accept: 'application/json',
          },
        });

        if (typeof data?.consumption === 'number') {
          setConsumption(data.consumption);
        }
      } catch (error) {
        console.error("Failed to fetch consumption:", error);
      }
    };

    fetchConsumption();
  }, [detail, token]);


  return (
    <>
    <div className="relative mx-auto"> 
 
        <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4"> 
          <ContentHeader className="m-0" title="Detail Data Unit" /> 
          <div className="flex gap-2">
            <ButtonDisabled type="button" 
            onClick={() => router.push('/plant/unit/')}
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
              onClick={() => updateFlag && router.push(`/plant/unit/edit/${id}`)}
            >
              Ubah
            </ButtonAction>
          </div>
        </div> 
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        <InputFieldsLabel
            label="Nama Unit :"
            type="text"
            value={detail?.unit_name ?? ''}
            readOnly
          />
          <InputFieldsLabel
            label="Brand :"
            value={detail?.brand?.brand_name ?? '-'}
            readOnly
          />

          <InputFieldsLabel
            label="Jenis Alat Berat :"
            value={detail?.heavy_equipment?.heavy_equipment_name ?? '-'}
            readOnly
          />

          <InputFieldsLabel
            label="Seri Alat Berat :"
            value={detail?.series?.series_name ?? '-'}
            readOnly
          />
          <InputFieldsLabel
            label="Konsumsi BBM Dalam 1 Jam (L) :"
            type="number"
            value={consumption || 0}
            readOnly
          />

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
