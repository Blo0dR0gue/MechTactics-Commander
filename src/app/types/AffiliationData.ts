import { Concrete } from './UtilityTypes';

type AffiliationResponse = {
  id?: number;
  name: string;
  color: string;
};

type AffiliationRequest = Concrete<AffiliationResponse>;

export { AffiliationResponse, AffiliationRequest };
