export interface Unit {
  ID: number;
  unit_name: string;
}

export type Option = {
  label: string;
  value: string;
};

export type Employee = {
  ID: string;
  firstname: string;
  lastname: string;
};
 
export interface FuelRatio { 
  ID: number;
  unit_name: string;
  brand_id: number;
  heavy_equipment_id: number;
  series_id: number;
  consumption?: number;
  brand: {
    brand_name: string;
  };
  heavy_equipment: {
    heavy_equipment_name: string;
  };
  series: {
    series_name: string;
  }; 
}

export type FuelRatioValues = {
  unit_id: number;
  employee_id: number;
  shift: string;
  brand_id: number;
  heavy_equipment_id: number; 
  series_id: number; 
  consumption: number;
  tolerance: number;
  tanggal: Date | null;
  first_hm: number | null;
  last_hm: number | null;
  tanggal_awal: Date | null;
  tanggal_akhir: Date | null;
  total_refill: number;
  operator_name: string;
};  
 
export type FuelRatioDetail = {
  ID: number; 
  unit_id: number;
  operator_name: string;
  shift: string;
  first_hm: string;
  tanggal: string | null;
  last_hm: string | null;
  tanggal_awal: string | null;
  tanggal_akhir: string | null;
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