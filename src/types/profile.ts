export interface Profile {
  id?: string;
  roll_no: string;
  name: string;
  blood_group: string;
  allergies?: string;
  medical_conditions?: string;
  habits?: string;
  emergency_contacts: { name: string; number: string }[];
  created_at?: string;
}
