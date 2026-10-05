export interface SchoolBase {
  name: string;
}

export interface SchoolCreate extends SchoolBase {}

export interface SchoolUpdate {
  name?: string;
}

export interface SchoolResponse extends SchoolBase {
  id: number;
  operator_passcode?: string;
}

export interface JoinSchoolPayload {
  passcode: string;
}