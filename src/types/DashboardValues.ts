export type DohExpired = {
  id?: number;
  employee_id: number;
  tanggal_doh : string;
  tanggal_end_doh : string;
  firstname : string;
  lastname? : string;
  department_name : string;
  position_name : string;
}

export type MCUBerkala = {
  id?: number;
  employee_id: number;
  date_mcu : string;
  date_end_mcu : string; 
  firstname : string;
  lastname? : string;
  department_name : string;
  position_name : string;
} 

export interface DashboardEmployee {
	total_employee: number;
	total_male: number;
	total_female: number;
	hired_ho: number;
  	hired_site: number;
	based_on_age: BasedOnAge;
	based_on_year: BasedOnYear;
	based_on_education: BasedOnEducation;
	based_on_department: BasedOnDepartment;
	based_on_ring: BasedOnRing;
	based_on_lokal: BasedOnLokal;
}

export type BasedOnRing = {
	ring_1 :number;
	ring_2 :number;
	ring_3 :number;
	luar_ring :number;
} 

export type BasedOnLokal = {
	lokal :number;
	non_lokal :number; 
}

export type BasedOnDepartment = {
	engineering :number;
	finance :number;
	hrga :number;
	operation :number;
	plant :number;
	she :number;
	coal_loading :number;
	stockpile :number;
	shipping :number;
	plant_logistic :number;
	keamanan_eksternal : number;
	oshe : number;
	management : number;
}

export type BasedOnEducation = {
	education_1 :number;
	education_2 :number;
	education_3 :number;
	education_4 :number;
	education_5 :number;
}

export type BasedOnYear = {
	year_1 :number;
	year_2 :number;
	year_3 :number;
	year_4 :number;
}

export type BasedOnAge = {
	stage_1 :number;
	stage_2 :number;
	stage_3 :number;
	stage_4 :number;
	stage_5 :number;
}

export type DataStatus = {
	new_hire :number;
	berakhir_pkwt :number;
	resign :number;
	phk :number; 
}

export interface DashboardEmployeeTurnover {
	total_hire: number;
	total_resign: number;
	total_berakhir_pkwt: number;
	total_phk: number; 
	januari : DataStatus;
	februari : DataStatus;
	maret : DataStatus;
	april : DataStatus;
	mei : DataStatus;
	juni : DataStatus;
	juli : DataStatus;
	agustus : DataStatus;
	september : DataStatus;
	oktober : DataStatus;
	november : DataStatus;
	desember : DataStatus; 
} 

export interface DepartmentName  {
	operation : number;
	plant : number;
	hrga : number;
	she : number;
	finance : number;
	engineering : number;
	coal_loading : number;
	stockpile : number;
	shipping : number;
	plant_logistic : number;
	keamanan_eksternal : number;
	oshe : number;
	management : number;
}

export interface DashboardEmployeeKontrak { 
	januari : DepartmentName;
	februari : DepartmentName;
	maret : DepartmentName;
	april : DepartmentName;
	mei : DepartmentName;
	juni : DepartmentName;
	juli : DepartmentName;
	agustus : DepartmentName;
	september : DepartmentName;
	oktober : DepartmentName;
	november : DepartmentName;
	desember : DepartmentName; 
} 

export interface BacklogSummary { 
	pending: number;
	open: number;
	closed: number;
	cancelled: number;
	rejected: number;
}

export interface AgingSummary {
	aging_total_1 : BacklogSummary;
	aging_total_2 : BacklogSummary;
	aging_total_3 : BacklogSummary;
	aging_total_4 : BacklogSummary; 
} 

export interface DashboardBackLog { 
	total_backlog: number;
	total_1: number;
	total_2: number;
	total_3: number;
	total_4: number;
	backlog_summary: BacklogSummary | null;
	aging_summary: AgingSummary | null;
} 