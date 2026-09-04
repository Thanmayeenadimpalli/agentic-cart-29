import type { Category, Product, ProductTag } from "@/types";

const APPAREL_SIZES = ["XS", "S", "M", "L", "XL"];
const SHOE_SIZES = ["6", "7", "8", "9", "10", "11"];
const ONE_SIZE = ["One Size"];

type Seed = [
  name: string,
  category: Category,
  price: number,
  rating: number,
  stock: number,
  tags: ProductTag[],
  colors: string[],
  description: string,
];

const seeds: Seed[] = [
  // Outerwear
  ["Quilted Bomber Jacket", "Outerwear", 2499, 4.5, 18, ["winter", "outerwear", "casual"], ["Black", "Olive", "Navy"], "Lightweight quilted bomber with ribbed cuffs and a water-repellent shell."],
  ["Merino Wool Overcoat", "Outerwear", 7899, 4.8, 6, ["winter", "outerwear", "formal", "premium"], ["Charcoal", "Camel"], "Tailored double-faced merino overcoat with a clean notch lapel."],
  ["Sherpa-Lined Denim Jacket", "Outerwear", 3299, 4.3, 12, ["winter", "outerwear", "casual"], ["Indigo", "Stone"], "Rigid denim jacket lined with plush sherpa for cold-weather layering."},
  ["Packable Puffer Jacket", "Outerwear", 3899, 4.6, 20, ["winter", "outerwear", "premium"], ["Black", "Rust", "Teal"], "600-fill packable puffer that folds into its own pocket."],
  ["Fleece Zip Hoodie", "Outerwear", 1499, 4.2, 34, ["winter", "casual", "outerwear", "budget"], ["Grey", "Black"], "Brushed-back fleece hoodie with a full-length YKK zip."],
  ["Cable Knit Sweater", "Outerwear", 1899, 4.4, 22, ["winter", "casual", "outerwear"], ["Cream", "Forest"], "Chunky cable knit crewneck in a soft wool blend."],
  ["Softshell Windbreaker", "Outerwear", 2199, 4.1, 16, ["outerwear", "sport", "rain"], ["Black", "Blue"], "Wind-resistant softshell with taped seams and a stowaway hood."],
  ["Wool Blend Blazer", "Outerwear", 5499, 4.7, 8, ["formal", "premium", "outerwear"], ["Navy", "Grey"], "Half-canvassed blazer with a soft shoulder and working cuffs."],
  ["Hooded Parka", "Outerwear", 6299, 4.6, 7, ["winter", "outerwear", "premium"], ["Olive", "Black"], "Longline parka with faux-fur trim and a storm-proof front placket."],
  ["Lightweight Rain Shell", "Outerwear", 999, 3.9, 40, ["rain", "budget", "outerwear"], ["Yellow", "Black"], "Featherweight rain shell that packs down to palm size."],

  // Tops
  ["Thermal Base Layer Tee", "Tops", 799, 4.3, 45, ["winter", "budget", "sport"], ["Black", "Grey"], "Waffle-knit thermal base layer with flatlock seams."],
  ["Heavyweight Sweatshirt", "Tops", 1299, 4.4, 30, ["winter", "casual", "budget"], ["Ecru", "Navy"], "380 GSM loopback cotton sweatshirt with a boxy fit."],
  ["Oxford Button-Down Shirt", "Tops", 1599, 4.5, 26, ["formal", "casual"], ["White", "Sky"], "Classic oxford cloth shirt with a soft roll collar."],
  ["Slim Fit Dress Shirt", "Tops", 1899, 4.4, 21, ["formal", "premium"], ["White", "Lilac"], "Wrinkle-resistant two-ply cotton dress shirt."],
  ["Merino Crew Neck Tee", "Tops", 2299, 4.6, 14, ["premium", "winter"], ["Charcoal", "Sand"], "17.5 micron merino tee — odour resistant and temperature regulating."],
  ["Dry-Fit Training Tee", "Tops", 649, 4.1, 50, ["sport", "budget", "summer"], ["Black", "Lime"], "Moisture-wicking training tee with mesh side panels."],
  ["Compression Long Sleeve", "Tops", 899, 4.2, 33, ["sport", "budget"], ["Black", "Navy"], "Second-skin compression top for high-output sessions."],
  ["Turtleneck Knit Top", "Tops", 1749, 4.3, 17, ["winter", "formal"], ["Black", "Oat"], "Fine-gauge turtleneck that layers cleanly under a blazer."],
  ["Graphic Cotton Tee", "Tops", 499, 4.0, 60, ["casual", "budget", "summer"], ["White", "Black"], "Combed cotton tee with a screen-printed studio graphic."],
  ["Flannel Overshirt", "Tops", 1399, 4.4, 24, ["winter", "casual"], ["Red Check", "Green Check"], "Brushed flannel overshirt heavy enough to wear as a light jacket."],

  // Bottoms
  ["Straight Fit Jeans", "Bottoms", 1999, 4.4, 28, ["casual", "winter"], ["Indigo", "Black"], "12oz rigid denim in a clean straight leg."],
  ["Slim Stretch Chinos", "Bottoms", 1699, 4.3, 30, ["formal", "casual"], ["Khaki", "Navy"], "Two-way stretch cotton twill chinos with a hidden comfort waistband."],
  ["Wool Blend Trousers", "Bottoms", 3299, 4.6, 11, ["formal", "premium", "winter"], ["Charcoal", "Navy"], "Pleated wool blend trousers with a tailored break."],
  ["Fleece Joggers", "Bottoms", 1199, 4.2, 38, ["winter", "casual", "budget", "sport"], ["Grey", "Black"], "Tapered fleece joggers with zip side pockets."],
  ["Performance Training Shorts", "Bottoms", 749, 4.1, 44, ["sport", "budget", "summer"], ["Black", "Navy"], "7-inch four-way stretch shorts with a liner."],
  ["Thermal Lined Track Pants", "Bottoms", 1499, 4.3, 19, ["winter", "sport"], ["Black", "Charcoal"], "Brushed thermal lining with articulated knees."],
  ["Corduroy Trousers", "Bottoms", 2199, 4.2, 13, ["winter", "casual"], ["Tan", "Bottle"], "8-wale corduroy trousers with a relaxed straight leg."],
  ["Cargo Utility Pants", "Bottoms", 1899, 4.0, 22, ["casual"], ["Olive", "Sand"], "Ripstop cargo pants with bellowed thigh pockets."],
  ["Everyday Gym Tights", "Bottoms", 999, 4.2, 36, ["sport", "budget"], ["Black"], "Squat-proof gym tights with a phone pocket."],

  // Footwear
  ["Leather Chelsea Boots", "Footwear", 4499, 4.7, 9, ["winter", "formal", "premium"], ["Brown", "Black"], "Full-grain leather Chelsea boots on a stacked heel."],
  ["Insulated Snow Boots", "Footwear", 3799, 4.5, 12, ["winter", "premium"], ["Black", "Brown"], "Waterproof insulated boots rated for sub-zero mornings."],
  ["Everyday Canvas Sneakers", "Footwear", 1299, 4.1, 40, ["casual", "budget", "summer"], ["White", "Black"], "Vulcanised canvas sneakers with a cushioned insole."],
  ["Running Trainers", "Footwear", 2799, 4.5, 25, ["sport"], ["Blue", "Grey"], "Foam-cushioned neutral trainers for daily mileage."],
  ["Gym Cross-Trainers", "Footwear", 1899, 4.2, 27, ["sport", "budget"], ["Black", "White"], "Flat, stable cross-trainers built for lifting and HIIT."],
  ["Oxford Dress Shoes", "Footwear", 5299, 4.6, 7, ["formal", "premium"], ["Black", "Oxblood"], "Goodyear-welted oxfords with a closed lacing system."],
  ["Fleece-Lined Slip-Ons", "Footwear", 1099, 3.9, 32, ["winter", "budget", "casual"], ["Grey", "Navy"], "Cosy fleece-lined slip-ons for the commute and the couch."],
  ["Hiking Boots", "Footwear", 4199, 4.4, 10, ["winter", "sport", "rain"], ["Brown", "Charcoal"], "Grippy lugged outsole with a waterproof membrane."],

  // Accessories
  ["Lambswool Scarf", "Accessories", 899, 4.4, 40, ["winter", "budget"], ["Grey", "Camel"], "Soft lambswool scarf with fringed ends."],
  ["Touchscreen Gloves", "Accessories", 599, 4.1, 55, ["winter", "budget"], ["Black", "Charcoal"], "Insulated gloves with conductive fingertips."],
  ["Ribbed Beanie", "Accessories", 399, 4.2, 70, ["winter", "budget", "casual"], ["Black", "Mustard"], "Double-layer ribbed beanie in a wool blend."],
  ["Leather Belt", "Accessories", 1199, 4.3, 30, ["formal", "casual"], ["Brown", "Black"], "Full-grain leather belt with a brushed nickel buckle."],
  ["Wool Socks 3-Pack", "Accessories", 299, 4.0, 90, ["winter", "budget"], ["Mixed"], "Cushioned merino-blend crew socks, three pairs."],
  ["Cashmere Muffler", "Accessories", 2999, 4.8, 6, ["winter", "premium", "formal"], ["Charcoal", "Ivory"], "Pure cashmere muffler woven in a fine twill."],
  ["Gym Duffle Bag", "Accessories", 1499, 4.2, 20, ["sport"], ["Black", "Navy"], "28L water-resistant duffle with a vented shoe compartment."],
  ["Silk Blend Tie", "Accessories", 799, 4.1, 26, ["formal"], ["Navy", "Burgundy"], "Silk blend tie with a subtle woven texture."],
];

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const products: Product[] = seeds.map(
  ([name, category, price, rating, stock, tags, colors, description]) => {
    const id = slug(name);
    return {
      id,
      name,
      category,
      price,
      rating,
      stock,
      tags,
      colors,
      description,
      sizes: category === "Footwear" ? SHOE_SIZES : category === "Accessories" ? ONE_SIZE : APPAREL_SIZES,
      imageUrl: `https://picsum.photos/seed/${id}/400/500`,
    };
  },
);

export const categories: Category[] = ["Outerwear", "Tops", "Bottoms", "Footwear", "Accessories"];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
