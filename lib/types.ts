// Shared TypeScript types for the WhatMobile clone

export interface PhoneVariant {
  storage: string; // e.g. "128GB", "256GB"
  ram: string;     // e.g. "8GB"
  price: number;   // in PKR
}

// Clean nested specs structure (preferred going forward)
export interface CleanSpecs {
  // releaseDate removed from specs.
  // It is automatically extracted to the top-level phone.releaseDate field during upload.
  sim?: string;
  weight?: string;
  os?: string;

  display?: {
    size?: string;
    type?: string;
    resolution?: string;
    refreshRate?: string;
    protection?: string;
  };

  memory?: {
    ram?: string;
    storage?: string;
    cardSlot?: string;
  };

  performance?: {
    processor?: string;
    gpu?: string;
  };

  battery?: {
    capacity?: string;
    charging?: string;
  };

  camera?: {
    rear?: string | any;
    front?: string | any;
  };

  connectivity?: {
    [key: string]: boolean | string;
  };

  body?: {
    dimensions?: string;
    build?: string;
  };

  mainCamera?: {
    features?: string;
    video?: string;
  };

  selfieCamera?: {
    features?: string;
    video?: string;
  };

  sound?: {
    loudspeaker?: string;
    jack?: string;
  };

  comms?: {
    wlan?: string;
    bluetooth?: string;
    gps?: string;
    nfc?: string;
    radio?: string;
    usb?: string;
  };

  features?: {
    sensors?: string;
  };

  misc?: {
    colors?: string;
    models?: string;
  };

  other?: Record<string, any>;
}

/** @deprecated Use CleanSpecs instead. Kept for backward compatibility during migration. */
export interface PhoneSpecs extends CleanSpecs {}

export interface Phone {
  _id?: string;
  name: string;
  brand: string;
  slug: string;                 // URL friendly: "samsung-galaxy-a35-5g"
  pricePKR: number;             // Real price in Pakistan (PKR)
  priceUSD: number;             // Approximate international price in USD
  image?: string;               // Image URL or /images/ path
  releaseDate?: string;         // "March 2024" or ISO
  specs: PhoneSpecs;
  variants?: PhoneVariant[];
  colors?: string[];
  isFeatured?: boolean;         // Show on homepage "Best Phones"
  popularityScore?: number;     // For "Trending" / sorting
  inStock?: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// For price range pages
export interface PriceRange {
  label: string;
  slug: string;          // "under-20000", "20000-30000"
  min: number;
  max: number | null;    // null = no upper limit
}

// For brand pages
export interface Brand {
  name: string;
  slug: string;
  logo?: string;
  phoneCount?: number;
}
