'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store'; // adjust import based on your structure 
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import { useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/features/auth/authSlice';
import Image from 'next/image'; 
import SidebarHeader from './SidebarHeader';
import { MrpAPI } from '@/api';
import { setSidebarMenu } from '@/redux/features/setSidebarMenu';

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
 
const getOpenDropdownTitles = (
  items: MenuItem[],
  path: string,
  parents: string[] = []
): string[] => {
  for (const item of items) {
    if (item.path === path) {
      return parents;
    }
    if (item.children) {
      const found = getOpenDropdownTitles(item.children, path, [...parents, item.form_name]);
      if (found.length) return found;
    }
  }
  return [];
};

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const token = useSelector((state: RootState) => state.auth.user?.token);
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());
  const router = useRouter();
  const dispatch = useAppDispatch();   

  const handleLogout = () => {
      dispatch(logout()); // clear token and user data
      router.push('/login'); // redirect to login page
  }; 

  const fetchData = async () => {
    try {   
      const response = await MrpAPI({
        url: `/master/sidebar/${userId}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const res = response.data ?? [];
      setMenuItems(res); // 👈 set menu items from backend
      dispatch(setSidebarMenu(res)); // <-- store globally
    } catch (error) {
      console.error('Failed to fetch sidebar:', error);
    }
  };

  useEffect(() => {
    if (token && userId) fetchData();
  }, [token, userId]);

  const toggleDropdown = (form_name: string) => {
    setOpenDropdowns(prev => {
      const next = new Set(prev);
      if (next.has(form_name)) {
        next.delete(form_name);
      } else {
        next.add(form_name);
      }
      return next;
    });
  }; 

  useEffect(() => {
    if (menuItems.length > 0) {
      const parents = getOpenDropdownTitles(menuItems, pathname);
      setOpenDropdowns(new Set(parents));
    }
  }, [menuItems, pathname]);
 
  const filterMenuByReadFlag = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter((item) => item.read_flag) // filter out items with false or undefined
      .map((item) => ({
        ...item,
        children: item.children ? filterMenuByReadFlag(item.children) : undefined,
      }))
      .filter((item) => item.children ? item.children.length > 0 || item.path : true); // keep parents if they still have children or have a path
  };


  const renderMenu = (
    items: MenuItem[],
    level = 0 // track indent level
  ) => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isActive = pathname === item.path;
      const isOpenDropdown = openDropdowns.has(item.form_name);

      const paddingStyle = {
        paddingLeft: `${(4 + level * 2) * 4}px`, // 1 unit = 0.25rem = 4px
      };

      return (
        <div key={item.form_name}>
          {/* Toggleable Dropdown */}
          {hasChildren ? (
            <>
              <button
                onClick={() => toggleDropdown(item.form_name)}
                className={`flex items-center w-full px-4 py-2 text-left text-black hover:text-white hover:bg-[#FF3131] cursor-pointer ${paddingStyle}`}
              >
                <span className={`${!isOpen && 'hidden'} flex-1`}>
                  {item.form_name}
                </span>
                {isOpen && (
                  isOpenDropdown ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                )}
              </button>

              {/* Render children recursively */}
              {isOpen && isOpenDropdown && (
                <div className="ml-2">{renderMenu(item.children!, level + 1)}</div>
              )}
            </>
          ) : (
            // Regular navigation link
            <button
              onClick={() => router.push(item.path!)}
              className={`block w-full text-left px-4 py-2 text-left text-black hover:text-white hover:bg-[#FF3131] cursor-pointer ${paddingStyle} ${
                isActive ? 'bg-[#FF3131] text-white' : ''
              }`}
            >
              <span className={`${!isOpen && 'hidden'}`}>{item.form_name}</span>
            </button>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div
        className={`min-h-screen bg-white shadow-2xl border-r border-[#0f5f52] text-white transition-all duration-300 ${
          isOpen ? 'w-72' : 'w-14'
        }`}
      > 
        <div className="flex items-center justify-between p-4">
        {isOpen && (
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={120} height={40} priority />
            <SidebarHeader isOpen={isOpen} />
          </div>
        )}
 
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="text-black hover:opacity-80 transition mb-auto"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="border-t border-black mx-4 my-2" />

         <nav className="mt-6">
          {renderMenu(filterMenuByReadFlag(menuItems))}
          <button
            onClick={handleLogout}
            className={`block w-full text-left px-4 py-2 text-left text-black hover:text-white hover:bg-[#FF3131] cursor-pointer ${
              pathname === '/logout' ? 'bg-[#FF3131] text-white' : ''
            }`}
          >
            <span className={`${!isOpen && 'hidden'}`}>Logout</span>
          </button>
        </nav>
      </div>

      {/* Dynamic Content Area */}
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}