import { Skill } from "@/types";
import { generateId } from "@/lib/utils";

export const SEED_SKILLS: Skill[] = [
  // Keepa Skills
  { id: generateId(), skillName: "I can identify Buy Box price on Keepa chart", category: "Keepa", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I can read and interpret sales rank drops", category: "Keepa", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I can tell if Amazon is actively competing on a listing", category: "Keepa", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I can spot seller count spikes on the Keepa chart", category: "Keepa", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I can detect price tanking patterns", category: "Keepa", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I can compare current price to 90-day average", category: "Keepa", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I can identify seasonal products from Keepa charts", category: "Keepa", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I can determine if demand is real or temporary", category: "Keepa", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I can spot fake/inflated profit opportunities", category: "Keepa", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I can avoid oversaturated products using Keepa", category: "Keepa", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },

  // SellerAmp Skills
  { id: generateId(), skillName: "I can calculate ROI accurately in SellerAmp", category: "SellerAmp", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I can calculate net profit with all fees", category: "SellerAmp", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I can calculate max cost / break even price", category: "SellerAmp", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I understand FBA fees and referral fees", category: "SellerAmp", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I can check product restrictions in SellerAmp", category: "SellerAmp", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I can identify variation risk with SellerAmp", category: "SellerAmp", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I can check IP alerts in SellerAmp", category: "SellerAmp", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I can use SellerAmp alongside Keepa effectively", category: "SellerAmp", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },

  // Product Research Skills
  { id: generateId(), skillName: "I can calculate break even price from scratch", category: "Product Research", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I can check and interpret FBA seller count", category: "Product Research", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I can assess Amazon presence on a listing", category: "Product Research", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I can identify risky brands and IP threats", category: "Product Research", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I can avoid wrong pack count / UPC mismatch errors", category: "Product Research", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I can determine the right test buy quantity", category: "Product Research", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I can quickly reject bad leads using a checklist", category: "Product Research", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },

  // Inventory Management Skills
  { id: generateId(), skillName: "I can track and project sell through rate", category: "Inventory Management", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I know how to avoid overbuying on test products", category: "Inventory Management", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I can calculate reorder points correctly", category: "Inventory Management", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I can track cash tied up in inventory", category: "Inventory Management", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I can identify and address slow moving inventory", category: "Inventory Management", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
  { id: generateId(), skillName: "I know when NOT to reorder a product", category: "Inventory Management", status: "not_started", confidenceScore: 0, notes: "", updatedAt: new Date().toISOString() },
];
