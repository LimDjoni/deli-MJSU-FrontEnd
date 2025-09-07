'use client';

import { useEffect, useState, use } from 'react';
import ButtonAction from '@/components/ButtonAction';
import ContentHeader from '@/components/ContentHeader';
import { MrpAPI } from '@/api';
import { RootState } from '@/redux/store';
import { useSelector, useDispatch } from 'react-redux';
import InputFieldsLabel from '@/components/InputFieldsLabel';
import { useRouter } from 'next/navigation';
import ButtonDisabled from '@/components/ButtonDisabled';
import FilterModal from '@/components/Modal';
import DeleteForm from '@/components/DeleteForm';
import { BackLog } from '@/types/BackLogValues';
import TextAreaLabel from '@/components/TextAreaLabel';
import { Tab } from '@headlessui/react';
import clsx from 'clsx';
import { clearBacklogOrigin, setBacklogOrigin } from '@/redux/features/backlogSlice';

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

export default function DetailDataBackLogForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const origin = useSelector((state: RootState) => state.backlog.origin);
  const dispatch = useDispatch();
  const router = useRouter();
  const [detail, setDetail] = useState<BackLog | null>(null);
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const menuItems = useSelector((state: RootState) => state.sidebar.menuItems);

  // Check permission flags
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

  const updateFlag = getUpdateFlag(menuItems, `/backlog/${origin}`);
  const deleteFlag = getDeleteFlag(menuItems, `/backlog/${origin}`);

	const handleBack = () => {
    if (origin === 'approval') {
      router.push('/backlog/approval');
    } else if (origin === 'review-backlog') {
      router.push('/backlog/review-backlog');
    } else {
      router.push('/backlog/in-progress'); // default fallback
    }

    // Clear origin after navigating back
    dispatch(clearBacklogOrigin());
  }; 

  const handleGoToEdit = (id: string) => {
    if (origin === 'approval') {
      dispatch(setBacklogOrigin('approval'));
    } else if (origin === 'review-backlog') {
      dispatch(setBacklogOrigin('review-backlog'));
    } else {
      dispatch(setBacklogOrigin('in-progress'));
    }
    router.push(`/backlog/edit/${id}`);
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data } = await MrpAPI({
          url: `/backlog/detail/${id}`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        setDetail(data);
      } catch (error) {
        console.error('Failed to fetch detail:', error);
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

      router.push('/backlog');
    } catch (error) {
      console.error('Gagal menghapus data:', error);
      alert('Terjadi kesalahan saat menghapus data.');
    }
  };

  return (
    <>
      <div className="relative mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full mb-4 gap-4">
          <ContentHeader className="m-0" title="Detail Data Backlog" />
          <div className="flex gap-2">
            <ButtonDisabled
              type="button"
              onClick={handleBack}
              className="px-6"
            >
              Kembali
            </ButtonDisabled>
            <ButtonAction
              type="button"
              disabled={!deleteFlag}
              className={`px-6 ${!deleteFlag ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => deleteFlag && setIsFilterOpen(true)}
            >
              Hapus
            </ButtonAction>
            <ButtonAction
              type="submit"
              disabled={!updateFlag}
              className={`px-6 ${!updateFlag ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => updateFlag && handleGoToEdit(`${id}`)}
            >
              Ubah
            </ButtonAction>
          </div>
        </div>

        {/* Backlog General Info */} 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-4">
						<InputFieldsLabel label="Unit :" value={detail?.Unit?.unit_name ?? '-'} readOnly /> 
						<InputFieldsLabel
							label="Unit EFI :"
							value={
								detail?.Unit
									? [detail.Unit.brand?.brand_name, detail.Unit.series?.series_name]
											.filter(Boolean)
											.join(' - ')
									: '-'
							}
							readOnly
						/> 
						<InputFieldsLabel
							label="HM Breakdown:"
							value={detail?.hm_breakdown ?? 0}
							readOnly
						/> 
						<TextAreaLabel label="Problem Description:" value={detail?.problem ?? '-'} />
						<InputFieldsLabel label="Component:" value={detail?.component ?? '-'} readOnly /> 
      		</div>
          <div className="space-y-4">
						<InputFieldsLabel
							label="Date of Inspection:"
							value={detail?.date_of_inspection as string ?? '-'}
							readOnly
						/> 
						<InputFieldsLabel
							label="Plan Replace/Repair Date:"
							value={detail?.plan_replace_repair as string ?? '-'}
							readOnly
						/> 
						<InputFieldsLabel label="HM Ready:" value={detail?.hm_ready ?? 0} readOnly /> 
						<InputFieldsLabel label="PP Number:" value={detail?.pp_number ?? '-'} readOnly /> 
						<InputFieldsLabel label="PO Number:" value={detail?.po_number ?? '-'} readOnly /> 
						<InputFieldsLabel label="Status:" value={detail?.status ?? '-'} readOnly />
					</div>
				</div>

        {/* Parts Section */}
        <div className="mt-6">
					<h3 className="text-lg font-bold mb-4">Parts</h3>

					{detail?.parts && detail.parts.length > 0 ? (
						<Tab.Group>
							{/* --- Tab List --- */}
							<Tab.List className="flex border-b border-gray-300">
								{detail.parts.map((part, idx) => (
									<Tab
										key={idx}
										className={({ selected }) =>
											clsx(
												"px-4 py-2 text-sm font-medium focus:outline-none transition-colors",
												selected
													? "border-b-2 border-blue-500 text-blue-600"
													: "text-gray-500 hover:text-gray-700"
											)
										}
									>
										Part {idx + 1}
									</Tab>
								))}
							</Tab.List>

							{/* --- Tab Panels --- */}
							<Tab.Panels className="mt-4">
								{detail.parts.map((part, idx) => (
									<Tab.Panel key={idx} className="rounded-lg p-4 border border-gray-300 bg-white">
										<div className="grid grid-cols-3 gap-4">
											<InputFieldsLabel label="Part Number:" value={part?.part_number?? 0} readOnly /> 
											<InputFieldsLabel label="Part Description:" value={part?.part_description?? 0} readOnly /> 
											<InputFieldsLabel label="Qty Order:" value={part?.qty_order?? 0} readOnly />  
										</div>
									</Tab.Panel>
								))}
							</Tab.Panels>
						</Tab.Group>
					) : (
						<p className="text-gray-500">No parts data available.</p>
					)}
				</div>
      </div>

      {/* Delete Confirmation Modal */}
      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <DeleteForm
          onCancel={() => {
            setIsFilterOpen(false);
          }}
          onConfirm={async () => {
            await handleDelete();
            setIsFilterOpen(false);
          }}
        />
      </FilterModal>
    </>
  );
}
