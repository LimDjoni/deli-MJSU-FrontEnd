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
import { BackLog } from '@/types/BackLogValues'; 
import TextAreaLabel from '@/components/TextAreaLabel';

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

export default function DetailDataAlatBeratForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // ✅ unwrap params properly
  const [detail, setDetail] = useState<BackLog | null>(null);
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

const updateFlag = getUpdateFlag(menuItems, '/backlog');
const deleteFlag = getDeleteFlag(menuItems, '/backlog');
 
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data } = await MrpAPI({
          url: `/backlog/detail/${id}`,
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
        url: `/backlog/delete/${id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
 
      router.push("/backlog");
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };


  return (
    <>
    <div className="relative mx-auto"> 
 
        <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4"> 
          <ContentHeader className="m-0" title="Detail Data Backlog" /> 
          <div className="flex gap-2">
            <ButtonDisabled type="button" 
            onClick={() => router.push('/backlog/')}
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
              onClick={() => updateFlag && router.push(`/backlog/edit/${id}`)}
            >
              Ubah
            </ButtonAction>
          </div>
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <InputFieldsLabel
            label="Unit :"
            value={detail?.Unit?.unit_name ?? '-'}
            readOnly
          />

          <InputFieldsLabel
            label="Unit EFI :"
            value={detail?.Unit
            ? [detail.Unit.brand?.brand_name, detail.Unit.series?.series_name]
                .filter(Boolean) // buang yang kosong/null
                .join(" - ")     // gabungkan dengan tanda minus
            : "-"}
            readOnly
          />

          <InputFieldsLabel
            label="HM Breakdown:"
            value={detail?.hm_breakdown?? 0}
            readOnly
          /> 

          <TextAreaLabel
            label="Problem Description: "
            value={detail?.problem ?? '-'} 
          />

          <InputFieldsLabel
            label="Component:"
            value={detail?.component?? '-'}
            readOnly
          /> 
          <InputFieldsLabel
            label="Part Number:"
            value={detail?.part_number?? '-'}
            readOnly
          /> 
          <InputFieldsLabel
            label="Part Description:"
            value={detail?.part_description?? '-'}
            readOnly
          /> 
          <InputFieldsLabel
            label="Qty Order:"
            value={detail?.qty_order?? 0}
            readOnly
          /> 
          <InputFieldsLabel
            label="Date of Inspection:"
            value={detail?.date_of_inspection as string?? '-'}
            readOnly
          /> 
          <InputFieldsLabel
            label="Plan Replace and Repair Date:"
            value={detail?.plan_replace_repair as string?? '-'}
            readOnly
          /> 
          <InputFieldsLabel
            label="HM Ready:"
            value={detail?.hm_ready?? 0}
            readOnly
          /> 
          <InputFieldsLabel
            label="PP Number:"
            value={detail?.pp_number?? '-'}
            readOnly
          /> 
          <InputFieldsLabel
            label="PO Number:"
            value={detail?.po_number?? '-'}
            readOnly
          /> 
          <InputFieldsLabel
            label="Status:"
            value={detail?.status?? '-'}
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
