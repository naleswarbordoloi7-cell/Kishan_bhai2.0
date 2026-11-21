import cropCottonImg from '../assets/images/crop_cotton_field_1794995987497.jpg';
import cropWheatImg from '../assets/images/crop_wheat_field_1794995987755.jpg';
import cropGroundnutImg from '../assets/images/crop_groundnut_field_1794995988445.jpg';
import farmerPortraitImg from '../assets/images/farmer_champion_portrait_1790247882281.jpg';
import harvestGrainImg from '../assets/images/cluster_harvest_grain_1790247870115.jpg';

export const FARMER_DEFAULT_PORTRAIT = farmerPortraitImg;
export const HARVEST_GRAIN_IMAGE = harvestGrainImg;

export function resolveCropPhoto(cropName: string, currentUrl?: string): string {
  const lower = (cropName || '').toLowerCase();
  if (lower.includes('cotton') || lower.includes('कपास')) return cropCottonImg;
  if (lower.includes('wheat') || lower.includes('गेहूँ') || lower.includes('rice') || lower.includes('paddy')) return cropWheatImg;
  if (lower.includes('groundnut') || lower.includes('soybean') || lower.includes('mustard') || lower.includes('chana')) return cropGroundnutImg;
  if (currentUrl && currentUrl.startsWith('/') && !currentUrl.includes('unsplash')) return currentUrl;
  return harvestGrainImg;
}
