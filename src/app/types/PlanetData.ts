type PlanetData = {
  id: number;
  name: string;
  x: number;
  y: number;
  link: string;
  tagObject: PlanetTags;
  fuelingStation: boolean;
  detail: string;
  type: string;
  civilization: string;
  population: string;
  size: string;
  jumpDistance: number;
};

type PlanetCoordData = Omit<PlanetData, 'x' | 'y'> & {
  coord: {
    x: number;
    y: number;
  };
};

export type PlanetTag = {
  planetID: number;
  tagKey: string;
  tagValue: string;
};

export type PlanetTagKey = string;
export type PlanetTagValue = string;

export type PlanetTags = {
  [tag: PlanetTagKey]: PlanetTagValue[];
};

export type PlanetTagMap = Map<PlanetTagKey, PlanetTagValue[]>;

type PlanetWithAffiliationAndAge = PlanetData & {
  affiliationID: number;
  age: number;
  planetText: string;
};

export { PlanetData, PlanetCoordData, PlanetWithAffiliationAndAge };
