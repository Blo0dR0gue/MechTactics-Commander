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
};

type PlanetCoordData = Omit<PlanetData, 'x' | 'y'> & {
  coord: {
    x: number;
    y: number;
  };
};

export type PlanetTag = {
  id: number;
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
