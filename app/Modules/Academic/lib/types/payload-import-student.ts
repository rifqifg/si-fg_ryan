export interface PayloadImportStudent {
  name: string | any;
  nis: string;
  gender: string;
  nisn: string;
  birth_city: string;
  birth_day: string;
  nik: string;
  religion: string | boolean;
  address: string;
  rt: string;
  rw: string;
  zip: string;
  residence: string | null;
  transportation: string;
  phone: string;
  mobile_phone: string;
  email: string;
  junior_hs_cert_no: string;
  has_kps: boolean;
  kps_number: string;
  nat_exam_no: string;
  has_kip: boolean;
  kip_number: string;
  name_on_kip: boolean;
  kks_number: string;
  birth_cert_no: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_owner: string;
  pip_eligible: boolean;
  pip_desc: string;
  special_needs: string;
  junior_hs_name: string;
  child_no: string;
  address_lat: string;
  address_long: string;
  family_card_no: string;
  weight: string;
  height: string;
  head_circumference: string;
  siblings: string;
  distance_to_school_in_km: string;
  unit: string | null;
  program: string | null;
}

export interface PayloadImportStudentParent {
  studentId: string;
  relationship_w_student: string;
  name: string;
  birth_date: string;
  education: string | null;
  occupation: string;
  min_salary: string;
  max_salary: string;
  nik: string;
}
