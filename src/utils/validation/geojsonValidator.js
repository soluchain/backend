import * as turf from "@turf/turf";

export const calculateGeoJSONArea = (geoJSON) => {
  // Use the turf.area function to calculate the area of the GeoJSON feature
  const area = turf.area(geoJSON);
  // Convert the area from square meters to square kilometers
  const areaInSquareKilometers = area / 1000000;
  return areaInSquareKilometers;
};

export const geoJsonAreaValidator = (geoJSON, maxArea) => {
  try {
    if (!geoJSON || !maxArea) {
      return {
        isValid: false,
      };
    }

    // callculate the area of the GeoJSON feature
    const area = calculateGeoJSONArea(geoJSON);

    return {
      isValid: area <= maxArea,
      area,
      maxArea,
    };
  } catch (error) {
    console.log(error);
    return false;
  }
};
