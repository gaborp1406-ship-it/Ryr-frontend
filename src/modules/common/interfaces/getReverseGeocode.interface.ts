export interface getReverseGeocode {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: Address;
  boundingbox: string[];
}

export interface Address {
  road: string;
  suburb: string;
  region: string;
  state: string;
  'ISO3166-2-lvl4': string;
  postcode: string;
  country: string;
  country_code: string;
}
