'use client';

import { useEffect, useState, use } from 'react';
import ButtonAction from '@/components/ButtonAction';
import ContentHeader from '@/components/ContentHeader';
import { MJSUAPI } from '@/api'; 
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import InputFieldsLabel from '@/components/InputFieldsLabel';
import { useRouter } from 'next/navigation';
import ButtonDisabled from '@/components/ButtonDisabled';
import FilterModal from '@/components/Modal'; 
import DeleteForm from '@/components/DeleteForm'; 
import { BarangMasuk } from '@/types/AssetValues';

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

export default function DetailDataBarangMasuktForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // ✅ unwrap params properly
  const [detail, setDetail] = useState<BarangMasuk | null>(null);
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

const updateFlag = getUpdateFlag(menuItems, '/transaction/barang-masuk');
const deleteFlag = getDeleteFlag(menuItems, '/transaction/barang-masuk');
 
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data } = await MJSUAPI({
          url: `/barangmasuk/detail/${id}`,
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
  

  const handleDelete = async (dataAsset: BarangMasuk) => {
    try {
      await MJSUAPI({
        url: `/barangmasuk/delete/${id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Step 2: Update Asset stock
      const updatePayload = { 
        asset_type: dataAsset.Asset.asset_type,
        ukuran: dataAsset.Asset.ukuran,
        stock: dataAsset.Asset.stock - dataAsset.jumlah_masuk,
      };

      const updateResponse = await MJSUAPI({
        url: `/asset/update/${dataAsset.Asset.ID}`,
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
          Accept: "application/json",
        },
        data: updatePayload,
      });

      console.log("Updated Data:", updateResponse.data);

 
      router.push("/transaction/barang-masuk");
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };  

  return (
    <>
    <div className="relative mx-auto"> 
 
        <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4"> 
          <ContentHeader className="m-0" title="Detail Data Barang Masuk" /> 
          <div className="flex gap-2">
            <ButtonDisabled type="button" 
            onClick={() => router.push('/transaction/barang-masuk/')}
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
              onClick={() => updateFlag && router.push(`/transaction/barang-masuk/edit/${id}`)}
            >
              Ubah
            </ButtonAction>
          </div>
        </div> 
        <div className="grid grid-cols-3 items-center gap-4">
          <InputFieldsLabel
            label="Tanggal :"
            value={detail?.tanggal as string?? '-'}
            readOnly
          /> 
          <InputFieldsLabel
            label="Jenis Asset :"
              value={
                detail?.Asset?.ukuran === "-"
                  ? detail?.Asset?.asset_type ?? "-"
                  : `${detail?.Asset?.asset_type ?? ''} - ${detail?.Asset?.ukuran ?? ''}`
              }
            readOnly
          /> 
          <InputFieldsLabel
            label="Jumlah Masuk :"
            value={detail?.jumlah_masuk ?? '-'}
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
            await handleDelete(detail!); // ← perform deletion
            setIsFilterOpen(false);
          }}
        />
      </FilterModal>
    </>
  );
}
