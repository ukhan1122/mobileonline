import mongoose, { Schema, Document, Model } from 'mongoose';
import { CleanSpecs, PhoneVariant } from '@/lib/types';

export interface IPhone extends Document {
  name: string;
  brand: string;
  slug: string;
  pricePKR: number;
  priceUSD: number;
  price?: number;               // legacy / demo compat
  priceMax?: number;            // legacy / demo compat
  image?: string;
  releaseDate?: string;
  specs: CleanSpecs;           // Now uses the clean nested structure
  variants?: PhoneVariant[];
  colors?: string[];
  isFeatured?: boolean;
  popularityScore?: number;
  inStock?: boolean;
  description?: string;
}

const VariantSchema = new Schema<PhoneVariant>(
  {
    storage: { type: String, required: true },
    ram: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

// New clean nested specs structure (matches what cleanMobileSpecs() produces)
const DisplaySchema = new Schema(
  {
    size: String,
    type: String,
    resolution: String,
    refreshRate: String,
    protection: String,
  },
  { _id: false }
);

const MemorySchema = new Schema(
  {
    ram: String,
    storage: String,
    cardSlot: String,
  },
  { _id: false }
);

const PerformanceSchema = new Schema(
  {
    processor: String,
    gpu: String,
  },
  { _id: false }
);

const BatterySchema = new Schema(
  {
    capacity: String,
    charging: String,
  },
  { _id: false }
);

const CameraSchema = new Schema(
  {
    rear: Schema.Types.Mixed,
    front: Schema.Types.Mixed,
  },
  { _id: false }
);

const BodySchema = new Schema(
  {
    dimensions: String,
    build: String,
  },
  { _id: false }
);

const MainCameraSchema = new Schema(
  {
    features: String,
    video: String,
  },
  { _id: false }
);

const SelfieCameraSchema = new Schema(
  {
    features: String,
    video: String,
  },
  { _id: false }
);

const SoundSchema = new Schema(
  {
    loudspeaker: String,
    jack: String,
  },
  { _id: false }
);

const CommsSchema = new Schema(
  {
    wlan: String,
    bluetooth: String,
    gps: String,
    nfc: String,
    radio: String,
    usb: String,
  },
  { _id: false }
);

const FeaturesSchema = new Schema(
  {
    sensors: String,
  },
  { _id: false }
);

const MiscSchema = new Schema(
  {
    colors: String,
    models: String,
  },
  { _id: false }
);

// connectivity is intentionally flexible (dynamic keys)
const ConnectivitySchema = new Schema({}, { _id: false, strict: false });

const SpecsSchema = new Schema<CleanSpecs>(
  {
    // releaseDate removed from specs - it lives at the phone document root level
    // and is auto-populated from the uploaded specs table during save.
    sim: String,
    weight: String,
    os: String,

    display: { type: DisplaySchema },
    memory: { type: MemorySchema },
    performance: { type: PerformanceSchema },
    battery: { type: BatterySchema },
    camera: { type: CameraSchema },

    body: { type: BodySchema },
    mainCamera: { type: MainCameraSchema },
    selfieCamera: { type: SelfieCameraSchema },
    sound: { type: SoundSchema },
    comms: { type: CommsSchema },
    features: { type: FeaturesSchema },
    misc: { type: MiscSchema },

    connectivity: { type: ConnectivitySchema },
    other: Schema.Types.Mixed,
  },
  { _id: false }
);

const PhoneSchema = new Schema<IPhone>(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    pricePKR: { type: Number, required: true, min: 0, index: true },
    priceUSD: { type: Number, required: true, min: 0 },
    price: { type: Number, min: 0 },      // legacy
    priceMax: { type: Number, min: 0 },   // legacy
    image: String,
    releaseDate: String,
    specs: { type: SpecsSchema, required: true },
    variants: [VariantSchema],
    colors: [String],
    isFeatured: { type: Boolean, default: false, index: true },
    popularityScore: { type: Number, default: 50, min: 0, max: 100 },
    inStock: { type: Boolean, default: true },
    description: String,
  },
  {
    timestamps: true,
  }
);

// Useful indexes for search and price filtering
PhoneSchema.index({ name: 'text', brand: 'text' });
PhoneSchema.index({ pricePKR: 1, brand: 1 });
PhoneSchema.index({ priceUSD: 1, brand: 1 });

// Prevent model overwrite during hot reload in development
const Phone: Model<IPhone> =
  mongoose.models.Phone || mongoose.model<IPhone>('Phone', PhoneSchema);

export default Phone;
