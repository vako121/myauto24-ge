import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Fuel = "ბენზინი" | "დიზელი" | "ჰიბრიდი" | "ელექტრო";
export type Transmission = "ავტომატიკა" | "მექანიკა";
export type Drive = "წინა" | "უკანა" | "4x4";
export type VipPackage = "super" | "vip" | "color" | null;

export const modelsByMake: Record<string, string[]> = {
  BMW: ["3 Series", "5 Series", "M3", "M5 Competition", "X3", "X5"],
  "Mercedes-Benz": ["C 300", "E 350", "S 500", "GLE", "GLC", "A 200"],
  Toyota: ["Camry", "Camry Hybrid", "Prius", "RAV4", "Land Cruiser", "Corolla"],
  Tesla: ["Model 3", "Model S", "Model X", "Model Y Long Range"],
  Honda: ["Civic", "Accord", "CR-V", "Fit", "HR-V"],
  Ford: ["Mustang GT", "Fusion", "Escape", "Explorer", "F-150"],
  Audi: ["A4", "A6", "Q5", "Q7", "RS6", "e-tron"],
  Hyundai: ["Elantra", "Sonata", "Tucson", "Santa Fe", "Kona"],
  Lexus: ["IS 300", "ES 350", "RX 350", "GX 460", "LX 570"],
  Volkswagen: ["Golf", "Golf GTI", "Passat", "Tiguan", "Touareg"],
  Porsche: ["911", "Cayenne", "Macan", "Panamera", "Taycan"],
  Nissan: ["Altima", "Leaf", "Rogue", "X-Trail", "Patrol"],
};

export const allModels = Array.from(new Set(Object.values(modelsByMake).flat())).sort();

export const getModelsForMake = (make: string) => modelsByMake[make] ?? [];

export type ListingRow = Tables<"listings">;
export type ListingInsert = TablesInsert<"listings">;
export type ListingRow = Tables<"listings">;
export type ListingInsert = TablesInsert<"listings">;
export type ProfileRow = Tables<"profiles">;

export type Car = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel: Fuel;
  transmission: Transmission;
  city: string;
  image: string;
  image_url: string;
  contact_name: string;
  contact_phone: string;
  vip: VipPackage;
  description: string;
  engine: string;
  drive: Drive;
  color: string;
  user_id: string;
  createdAt: string;
  created_at: string;
};

const img = (q: string, seed: number) =>
  `https://images.unsplash.com/photo-${q}?auto=format&fit=crop&w=1200&q=80&sig=${seed}`;

const withCompatFields = (
  car: Omit<Car, "image_url" | "contact_name" | "contact_phone" | "user_id" | "created_at">,
): Car => ({
  ...car,
  image_url: car.image,
  contact_name: "",
  contact_phone: "",
  user_id: "",
  created_at: car.createdAt,
});

export const cars: Car[] = [
  withCompatFields({
    id: "1",
    make: "BMW",
    model: "M5 Competition",
    year: 2022,
    price: 95000,
    mileage: 18000,
    fuel: "ბენზინი",
    transmission: "ავტომატიკა",
    city: "თბილისი",
    image: img("1555215695-3004980ad54e", 1),
    vip: "super",
    description: "სრული კომპლექტაცია, Carbon pack, Harman Kardon, panorama.",
    engine: "4.4L V8",
    drive: "4x4",
    color: "შავი",
    createdAt: "2025-05-01",
  }),
  withCompatFields({
    id: "2",
    make: "Mercedes-Benz",
    model: "E 350",
    year: 2020,
    price: 42500,
    mileage: 65000,
    fuel: "ბენზინი",
    transmission: "ავტომატიკა",
    city: "ბათუმი",
    image: img("1617531653332-bd46c24f2068", 2),
    vip: "vip",
    description: "AMG line, panorama, burmester, full LED.",
    engine: "3.0L",
    drive: "უკანა",
    color: "თეთრი",
    createdAt: "2025-05-03",
  }),
  withCompatFields({
    id: "3",
    make: "Toyota",
    model: "Camry Hybrid",
    year: 2021,
    price: 28900,
    mileage: 42000,
    fuel: "ჰიბრიდი",
    transmission: "ავტომატიკა",
    city: "თბილისი",
    image: img("1621007947382-bb3c3994e3fb", 3),
    vip: "vip",
    description: "ეკონომიური, მაქსიმალური კომპლექტი, უმტვრევო.",
    engine: "2.5L Hybrid",
    drive: "წინა",
    color: "ვერცხლისფერი",
    createdAt: "2025-05-05",
  }),
  withCompatFields({
    id: "4",
    make: "Tesla",
    model: "Model Y Long Range",
    year: 2023,
    price: 54000,
    mileage: 12000,
    fuel: "ელექტრო",
    transmission: "ავტომატიკა",
    city: "თბილისი",
    image: img("1560958089-b8a1929cea89", 4),
    vip: "super",
    description: "Autopilot, full self driving package, premium interior.",
    engine: "Dual Motor",
    drive: "4x4",
    color: "ლურჯი",
    createdAt: "2025-05-06",
  }),
  withCompatFields({
    id: "5",
    make: "Honda",
    model: "Civic",
    year: 2019,
    price: 18500,
    mileage: 78000,
    fuel: "ბენზინი",
    transmission: "ავტომატიკა",
    city: "ქუთაისი",
    image: img("1583121274602-3e2820c69888", 5),
    vip: "color",
    description: "კარგ მდგომარეობაში, ერთი მფლობელი.",
    engine: "1.5L Turbo",
    drive: "წინა",
    color: "წითელი",
    createdAt: "2025-05-04",
  }),
  withCompatFields({
    id: "6",
    make: "Ford",
    model: "Mustang GT",
    year: 2021,
    price: 47000,
    mileage: 25000,
    fuel: "ბენზინი",
    transmission: "ავტომატიკა",
    city: "თბილისი",
    image: img("1494976388531-d1058494cdd8", 6),
    vip: "vip",
    description: "5.0 V8, Recaro seats, performance pack.",
    engine: "5.0L V8",
    drive: "უკანა",
    color: "ყვითელი",
    createdAt: "2025-05-02",
  }),
  withCompatFields({
    id: "7",
    make: "Audi",
    model: "Q7",
    year: 2020,
    price: 51000,
    mileage: 58000,
    fuel: "დიზელი",
    transmission: "ავტომატიკა",
    city: "ბათუმი",
    image: img("1606664515524-ed2f786a0bd6", 7),
    vip: "color",
    description: "7 ადგილიანი, S-line, panorama, virtual cockpit.",
    engine: "3.0 TDI",
    drive: "4x4",
    color: "ნაცრისფერი",
    createdAt: "2025-04-29",
  }),
  withCompatFields({
    id: "8",
    make: "Hyundai",
    model: "Sonata",
    year: 2018,
    price: 14200,
    mileage: 95000,
    fuel: "ბენზინი",
    transmission: "ავტომატიკა",
    city: "რუსთავი",
    image: img("1552519507-da3b142c6e3d", 8),
    vip: null,
    description: "სუფთა, განბაჟებული, შეცვლილი ზეთი.",
    engine: "2.4L",
    drive: "წინა",
    color: "შავი",
    createdAt: "2025-04-28",
  }),
  withCompatFields({
    id: "9",
    make: "Lexus",
    model: "RX 350",
    year: 2022,
    price: 62000,
    mileage: 28000,
    fuel: "ბენზინი",
    transmission: "ავტომატიკა",
    city: "თბილისი",
    image: img("1606016159991-dfe4f2746ad5", 9),
    vip: "vip",
    description: "F-Sport, Mark Levinson, head-up display.",
    engine: "3.5L V6",
    drive: "4x4",
    color: "თეთრი",
    createdAt: "2025-05-07",
  }),
  withCompatFields({
    id: "10",
    make: "Volkswagen",
    model: "Golf GTI",
    year: 2020,
    price: 24500,
    mileage: 48000,
    fuel: "ბენზინი",
    transmission: "მექანიკა",
    city: "თბილისი",
    image: img("1606664515524-ed2f786a0bd6", 10),
    vip: null,
    description: "Hot hatch, performance pack, DCC.",
    engine: "2.0 TSI",
    drive: "წინა",
    color: "წითელი",
    createdAt: "2025-04-30",
  }),
  withCompatFields({
    id: "11",
    make: "Porsche",
    model: "Cayenne",
    year: 2021,
    price: 78000,
    mileage: 32000,
    fuel: "ბენზინი",
    transmission: "ავტომატიკა",
    city: "თბილისი",
    image: img("1614162692292-7ac56d7f7f1e", 11),
    vip: "super",
    description: "Sport Chrono, air suspension, BOSE.",
    engine: "3.0L V6",
    drive: "4x4",
    color: "შავი",
    createdAt: "2025-05-08",
  }),
  withCompatFields({
    id: "12",
    make: "Kia",
    model: "Sportage",
    year: 2019,
    price: 19800,
    mileage: 71000,
    fuel: "დიზელი",
    transmission: "ავტომატიკა",
    city: "ბათუმი",
    image: img("1568844293986-8d0400bd4745", 12),
    vip: null,
    description: "სრული კომპლექტი, panorama, leather.",
    engine: "2.0 CRDi",
    drive: "4x4",
    color: "ლურჯი",
    createdAt: "2025-04-27",
  }),
];
export const makes = Object.keys(modelsByMake);
export const cities = Array.from(
  new Set(cars.map((car) => car.city))
).sort();
export async function fetchCars() {
  return cars;
}
export async function fetchCarById(id: string) {
  return cars.find((car) => car.id === id) ?? null;
}
