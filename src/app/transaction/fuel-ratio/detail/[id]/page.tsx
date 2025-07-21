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
 
type FuelRatioDetail = {
  ID: number; 
  unit_id: number;
  employee_id: number;
  shift: string;
  first_hm: string;
  last_hm: string | null;
  total_refill: number;
  status: boolean;
  Unit: {
    brand_id: number;
    heavy_equipment_id: number;
    series_id: number;
    unit_name: string;
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
  Employee: {
    firstname: string;
    lastname: string;
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

export default function DetailDataFuelRatioForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // ✅ unwrap params properly
  const [detail, setDetail] = useState<FuelRatioDetail | null>(null);
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

const updateFlag = getUpdateFlag(menuItems, '/transaction/fuel-ratio');
const deleteFlag = getDeleteFlag(menuItems, '/transaction/fuel-ratio');
 
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data } = await MrpAPI({
          url: `/fuelratio/detail/${id}`,
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
  
  useEffect(() => {
    const fetchConsumption = async () => {
      try {
        const { data } = await MrpAPI({
          url: `/alatberat/consumption/${detail?.Unit.brand_id}/${detail?.Unit.heavy_equipment_id}/${detail?.Unit.series_id}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setConsumption(data.consumption); // 👈 local state
      } catch (error) {
        console.error("Failed to fetch consumption:", error);
      }
    };

    if (detail && token) {
      fetchConsumption();
    }
  }, [detail, token]);

  const handleDelete = async () => { 
    try {
      await MrpAPI({
        url: `/fuelratio/delete/${id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
 
      router.push("/transaction/fuel-ratio");
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };


  return (
    <>
    <div className="relative mx-auto"> 
 
        <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4"> 
          <ContentHeader className="m-0" title="Detail Data Alat Berat" /> 
          <div className="flex gap-2">
            <ButtonDisabled type="button" 
            onClick={() => router.push('/transaction/fuel-ratio/')}
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
              onClick={() => updateFlag && router.push(`/transaction/fuel-ratio/edit/${id}`)}
            >
              Ubah
            </ButtonAction> 
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column: 4 stacked fields */}
          <div className="space-y-4">
            <div>
              <InputFieldsLabel
                  label="Nama Unit :"
                  type="text"
                  value={detail?.Unit.unit_name ?? ''}
                  readOnly
                /> 
            </div> 
            <div>
              <InputFieldsLabel
                  label="Operator :"
                  type="text"
                  value={`${detail?.Employee?.firstname ?? ''} ${detail?.Employee?.lastname ?? ''}`.trim()}
                  readOnly
                />  
            </div>
            <div>
              <InputFieldsLabel
                  label="Shift :"
                  type="text"
                  value={detail?.shift ?? ''}
                  readOnly
                />  
            </div> 
            <div>
              <InputFieldsLabel
                  label="HM Awal :"
                  type="text"
                  value={detail?.first_hm ?? ''}
                  readOnly
                />  
            </div> 
            <div>
              <InputFieldsLabel
                  label="HM Akhir :"
                  type="text"
                  value={detail?.last_hm ?? ''}
                  readOnly
                />  
            </div> 
            <div>
              <InputFieldsLabel
                  label="Jumlah Pengisian Fuel (L) :"
                  type="text"
                  value={detail?.total_refill ?? ''}
                  readOnly
                />  
            </div> 
          </div>

          {/* Right column: 4 stacked fields */}
          <div className="space-y-4">
            <div>
              <InputFieldsLabel
                  label="Brand :"
                  type="text"
                  value={detail?.Unit.brand.brand_name ?? ''}
                  readOnly
                />   
            </div>
            <div>
              <InputFieldsLabel
                  label="Jenis Alat Berat :"
                  type="text"
                  value={detail?.Unit.heavy_equipment.heavy_equipment_name ?? ''}
                  readOnly
                />    
          </div>
            <div>
              <InputFieldsLabel
                  label="Seri Alat Berat :"
                  type="text"
                  value={detail?.Unit.series.series_name ?? ''}
                  readOnly
                />    
            </div>
            <div>
              <InputFieldsLabel
                  label="Konsumsi BBM Dalam 1 Jam (L) :"
                  type="text"
                  value={consumption || 0}
                  readOnly
                />   
            </div>
          </div>
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
