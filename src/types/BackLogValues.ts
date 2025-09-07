import { UnitValues } from "./FuelRatioValues";

export interface BackLog {   
    ID: number;
	Unit: UnitValues;
	unit_id: number;
	hm_breakdown: number;
	problem: string;
	component: string; 
	date_of_inspection: Date | string | null;
	plan_replace_repair: Date | string | null;
	hm_ready: number | null;
	pp_number: string | null;
	po_number: string | null;
	status: string; 
	AgingBacklogByDate: number; 
	parts: PartItem[];
}  

type PartItem = {
  part_number: string;
  part_description: string;
  qty_order: number;
};