"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  GraduationCap,
  BedDouble,
  Bath,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
  Building2,
  MessageSquare,
  Heart,
  Menu,
  X,
  Plus,
  Mail,
  User,
  Filter,
  Clock3,
  School,
  Sparkles,
  Settings,
  LogOut,
  RefreshCw,
  Database,
  ExternalLink,
  Trash2,
  Pencil,
  Send,
  Image as ImageIcon,
  Home,
  ShieldCheck,
  UploadCloud,
  MapPinned,
} from "lucide-react";
const cn = (...classes) => classes.filter(Boolean).join(" ");

const Card = ({ className = "", children, ...props }) => (
  <div className={cn("rounded-3xl border border-zinc-200/70 bg-white", className)} {...props}>
    {children}
  </div>
);

const CardContent = ({ className = "", children, ...props }) => (
  <div className={className} {...props}>{children}</div>
);

const Button = ({ className = "", variant = "default", size = "default", children, ...props }) => {
  const base = "inline-flex items-center justify-center whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-60";
  const variants = {
    default: "bg-zinc-900 text-white hover:bg-zinc-800",
    outline: "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50",
    ghost: "bg-transparent text-zinc-900 hover:bg-zinc-100",
  };
  const sizes = {
    default: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-5 py-3 text-sm",
  };
  return <button className={cn(base, variants[variant] || variants.default, sizes[size] || sizes.default, className)} {...props}>{children}</button>;
};

const Input = ({ className = "", ...props }) => (
  <input className={cn("w-full border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-400", className)} {...props} />
);

const Badge = ({ className = "", children, ...props }) => (
  <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", className)} {...props}>{children}</span>
);

const Textarea = ({ className = "", ...props }) => (
  <textarea className={cn("w-full border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400", className)} {...props} />
);

const STORAGE_KEYS = {
  supabaseUrl: "subletnyu-supabase-url",
  supabaseAnonKey: "subletnyu-supabase-anon-key",
  demoUser: "subletnyu-demo-user",
  demoListings: "subletnyu-demo-listings-v4",
  demoSaved: "subletnyu-demo-saved-v4",
  demoMessages: "subletnyu-demo-messages-v4",
};

const neighborhoods = [
  "All Areas",
  "SoHo",
  "West Village",
  "East Village",
  "Greenwich Village",
  "NoHo",
  "Flatiron",
  "Gramercy",
  "Lower East Side",
  "Union Square",
  "Chelsea",
  "Tribeca",
  "Midtown",
  "Upper East Side",
  "Upper West Side",
  "Williamsburg",
  "Brooklyn",
];

const spaceTypes = ["Full Apartment", "Private Room", "Shared Room"];
const unitTypes = ["Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom", "4+ Bedroom"];
const bathroomOptions = ["1", "1.5", "2", "2.5", "3+"];
const sortOptions = ["Recommended", "Price: Low to High", "Price: High to Low", "Newest"];

const seedListings = [
  {
    id: "seed-1",
    title: "West Village Studio for Summer",
    neighborhood: "West Village",
    address: "Christopher St & Bleecker St",
    price: 2350,
    unitBedrooms: 0,
    unitBathrooms: 1,
    term: "May 20 – Aug 20",
    campus: "8 min to Washington Sq",
    unitType: "Studio",
    spaceType: "Full Apartment",
    spaceSummary: "Entire studio apartment available for sublet",
    verified: true,
    featured: true,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    description: "Quiet furnished studio with lots of natural light, full kitchen, and easy access to NYU.",
    postedBy: "Sophie L.",
    email: "sophie@nyu.edu",
    owner_id: "seed-owner-1",
    created_at: new Date().toISOString(),
  },
  {
    id: "seed-2",
    title: "Flatiron 2 Bed Near Campus",
    neighborhood: "Flatiron",
    address: "Broadway & E 22nd St",
    price: 4100,
    unitBedrooms: 2,
    unitBathrooms: 1,
    term: "Jun 1 – Aug 31",
    campus: "12 min to Stern",
    unitType: "2 Bedroom",
    spaceType: "Full Apartment",
    spaceSummary: "Entire 2 bed / 1 bath apartment available",
    verified: true,
    featured: true,
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    description: "Ideal full-unit summer sublet for roommates. Furnished, elevator building, great light.",
    postedBy: "Ryan K.",
    email: "ryan@nyu.edu",
    owner_id: "seed-owner-2",
    created_at: new Date().toISOString(),
  },
  {
    id: "seed-3",
    title: "Private Room in East Village 3BR",
    neighborhood: "East Village",
    address: "Ave A & E 11th St",
    price: 1850,
    unitBedrooms: 3,
    unitBathrooms: 1,
    term: "Flexible",
    campus: "12 min to campus",
    unitType: "3 Bedroom",
    spaceType: "Private Room",
    spaceSummary: "1 private bedroom available in a 3 bed apartment",
    verified: false,
    featured: false,
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
    description: "Private bedroom in a shared East Village apartment. Great for summer classes or internships.",
    postedBy: "Ethan P.",
    email: "ethan@nyu.edu",
    owner_id: "seed-owner-3",
    created_at: new Date().toISOString(),
  },
];

function readLocal(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota errors in preview/demo mode.
  }
}

function clearSupabaseAuthStorage() {
  if (typeof window === "undefined") return;
  try {
    const keysToRemove = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key && key.includes("auth-token")) keysToRemove.push(key);
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Ignore storage cleanup errors.
  }
}

function getStoredSupabaseConfig() {
  if (typeof window === "undefined") return { url: "", anonKey: "" };
  return {
    url: window.localStorage.getItem(STORAGE_KEYS.supabaseUrl) || "",
    anonKey: window.localStorage.getItem(STORAGE_KEYS.supabaseAnonKey) || "",
  };
}

function setStoredSupabaseConfig(url, anonKey) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.supabaseUrl, url);
  window.localStorage.setItem(STORAGE_KEYS.supabaseAnonKey, anonKey);
}

function clearStoredSupabaseConfig() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.supabaseUrl);
  window.localStorage.removeItem(STORAGE_KEYS.supabaseAnonKey);
}

function makeSupabaseClient(url, anonKey) {
  if (!url || !anonKey) return null;
  try {
    return createClient(url, anonKey);
  } catch {
    return null;
  }
}

async function compressImageFile(file, maxDimension = 1600, quality = 0.82) {
  if (typeof window === "undefined" || !file.type.startsWith("image/")) return file;

  const imageBitmap = await createImageBitmap(file);
  const { width, height } = imageBitmap;
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) return file;

  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}

function formatRelativeTime(dateString) {
  if (!dateString) return "just now";
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function emptyListingForm() {
  return {
    id: null,
    title: "",
    neighborhood: "West Village",
    address: "",
    price: "",
    unitBedrooms: "1",
    unitBathrooms: "1",
    term: "",
    campus: "",
    unitType: "1 Bedroom",
    spaceType: "Full Apartment",
    spaceSummary: "",
    image: "",
    images: [],
    description: "",
  };
}

function normalizeListing(row) {
  const unitBedrooms = Number(row.unit_bedrooms ?? row.unitBedrooms ?? row.beds ?? 1);
  const unitBathrooms = row.unit_bathrooms ?? row.unitBathrooms ?? row.baths ?? 1;
  const unitType = row.unit_type || row.unitType || row.type || (unitBedrooms === 0 ? "Studio" : `${unitBedrooms} Bedroom`);
  const spaceType = row.space_type || row.spaceType || "Full Apartment";
  const rawImageValue = row.image_url || row.image || "";
  let images = [];

  if (Array.isArray(row.images)) {
    images = row.images.filter(Boolean);
  } else if (typeof rawImageValue === "string" && rawImageValue.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(rawImageValue);
      if (Array.isArray(parsed)) images = parsed.filter(Boolean);
    } catch {
      images = [];
    }
  } else if (typeof rawImageValue === "string" && rawImageValue.trim()) {
    images = [rawImageValue.trim()];
  }

  const fallbackImage = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80";
  if (!images.length) images = [fallbackImage];

  return {
    id: row.id,
    title: row.title || "Untitled Listing",
    neighborhood: row.neighborhood || "West Village",
    address: row.address || "",
    price: Number(row.price || 0),
    unitBedrooms,
    unitBathrooms,
    term: row.term || "Flexible",
    campus: row.campus_distance || row.campus || "Near NYU campus",
    unitType,
    spaceType,
    spaceSummary: row.space_summary || row.spaceSummary || "",
    verified: Boolean(row.verified),
    featured: Boolean(row.featured),
    image: images[0],
    images,
    description: row.description || "",
    postedBy: row.posted_by || row.postedBy || "NYU Student",
    email: row.contact_email || row.email || "",
    owner_id: row.owner_id || null,
    created_at: row.created_at || new Date().toISOString(),
  };
}

function normalizeMessage(row, currentUserId) {
  const counterpartId = row.sender_id === currentUserId ? row.recipient_id : row.sender_id;
  const counterpartName = row.sender_id === currentUserId
    ? row.recipient_name || row.recipient_email || "Student"
    : row.sender_name || "Student";

  return {
    id: row.id,
    listingId: row.listing_id,
    listingTitle: row.listing_title || "SubletNYU listing",
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    senderName: row.sender_name || "Student",
    recipientName: row.recipient_name || row.recipient_email || "Student",
    recipientEmail: row.recipient_email || "",
    body: row.body || "",
    createdAt: row.created_at || new Date().toISOString(),
    counterpartId,
    counterpartName,
    isMine: row.sender_id === currentUserId,
  };
}

function threadKeyFromMessage(message, currentUserId) {
  const counterpartId = message.senderId === currentUserId ? message.recipientId : message.senderId;
  return `${message.listingId}__${counterpartId}`;
}

function Modal({ open, onClose, title, children, maxWidth = "max-w-2xl" }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${maxWidth} rounded-[2rem] border border-zinc-200 bg-white shadow-2xl`}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
              <h3 className="text-xl font-semibold text-zinc-950">{title}</h3>
              <button onClick={onClose} className="rounded-full border border-zinc-200 p-2 text-zinc-600 transition hover:bg-zinc-50">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[85vh] overflow-y-auto p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ListingCard({ listing, onView, onToggleSave, isSaved, onMessage, canDelete, canEdit, onDelete, onEdit }) {
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
      <Card className="overflow-hidden rounded-[28px] border-zinc-200/70 bg-white shadow-sm transition-all hover:shadow-2xl hover:shadow-zinc-200/60">
        <div className="relative h-60 w-full overflow-hidden">
          <img src={listing.image} alt={listing.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {listing.verified && <Badge className="rounded-full border-0 bg-white/90 px-3 py-1 text-zinc-900">Verified</Badge>}
            {listing.featured && <Badge className="rounded-full border-0 bg-violet-600 px-3 py-1 text-white">Featured</Badge>}
            <Badge className="rounded-full border-0 bg-black/55 px-3 py-1 text-white">{listing.spaceType}</Badge>
          </div>
          <div className="absolute right-4 top-4 flex gap-2">
            {canEdit && (
              <button onClick={() => onEdit(listing)} className="rounded-full bg-white/90 p-2 text-zinc-700 shadow-sm transition hover:scale-105">
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {canDelete && (
              <button onClick={() => onDelete(listing)} className="rounded-full bg-white/90 p-2 text-zinc-700 shadow-sm transition hover:scale-105">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button onClick={() => onToggleSave(listing.id)} className={`rounded-full p-2 shadow-sm transition hover:scale-105 ${isSaved ? "bg-violet-600 text-white" : "bg-white/90 text-zinc-700"}`}>
              <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            </button>
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="text-xl font-semibold tracking-tight">{listing.title}</div>
            <div className="mt-1 flex items-center gap-2 text-sm text-white/90">
              <MapPin className="h-4 w-4" />
              {listing.neighborhood}{listing.address ? ` • ${listing.address}` : ""}
            </div>
          </div>
        </div>

        <CardContent className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-semibold text-zinc-950">${listing.price.toLocaleString()}<span className="ml-1 text-sm font-normal text-zinc-500">/ month</span></div>
              <div className="mt-1 text-sm text-zinc-600">{listing.spaceSummary || `${listing.spaceType} in ${listing.unitType}`}</div>
            </div>
            <div className="rounded-2xl bg-zinc-50 px-3 py-2 text-right text-xs text-zinc-500">
              <div>{listing.term}</div>
              <div className="mt-1">{listing.campus}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-2xl bg-zinc-50 p-3 text-sm text-zinc-700">
            <div className="flex items-center gap-2"><BedDouble className="h-4 w-4" />{listing.unitBedrooms === 0 ? "Studio" : `${listing.unitBedrooms} bd`}</div>
            <div className="flex items-center gap-2"><Bath className="h-4 w-4" />{listing.unitBathrooms} ba</div>
            <div className="flex items-center gap-2"><Home className="h-4 w-4" />{listing.unitType}</div>
          </div>

          <div className="line-clamp-2 text-sm leading-6 text-zinc-600">{listing.description}</div>

          <div className="flex gap-3 pt-1">
            <Button onClick={() => onView(listing)} className="flex-1 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800">View Listing</Button>
            <Button onClick={() => onMessage(listing)} variant="outline" className="rounded-2xl border-zinc-300">
              <MessageSquare className="mr-2 h-4 w-4" />Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function SubletNYUPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("All Areas");
  const [selectedSpaceType, setSelectedSpaceType] = useState("All Types");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sortBy, setSortBy] = useState("Recommended");
  const [activeView, setActiveView] = useState("home");
  const [selectedListing, setSelectedListing] = useState(null);
  const [listingModalOpen, setListingModalOpen] = useState(false);
  const [listingEditorOpen, setListingEditorOpen] = useState(false);
  const [messageComposerOpen, setMessageComposerOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [messageTarget, setMessageTarget] = useState(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [dbStatus, setDbStatus] = useState("Demo mode");
  const fileInputRef = useRef(null);

  const [supabaseClient, setSupabaseClient] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [listings, setListings] = useState(seedListings);
  const [savedListingIds, setSavedListingIds] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedThreadKey, setSelectedThreadKey] = useState(null);

  const [listingForm, setListingForm] = useState(emptyListingForm());
  const [editingListingId, setEditingListingId] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [loginForm, setLoginForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [messageText, setMessageText] = useState("");
  const [threadReplyText, setThreadReplyText] = useState("");
  const [settingsForm, setSettingsForm] = useState({ url: "", anonKey: "" });
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [activePreviewImage, setActivePreviewImage] = useState("");
  const [selectedListingImageIndex, setSelectedListingImageIndex] = useState(0);

  function mapAuthUser(authUser) {
    if (!authUser) return null;
    return {
      id: authUser.id,
      name:
        authUser.user_metadata?.full_name ||
        [authUser.user_metadata?.first_name, authUser.user_metadata?.last_name].filter(Boolean).join(" ") ||
        authUser.email?.split("@")[0] ||
        "NYU Student",
      firstName: authUser.user_metadata?.first_name || "",
      lastName: authUser.user_metadata?.last_name || "",
      email: authUser.email || "",
      verified: Boolean(authUser.email?.endsWith("@nyu.edu")),
    };
  }

  async function loadListingsOnly(client) {
    const listingsRes = await client.from("listings").select("*").order("created_at", { ascending: false });
    if (listingsRes.error) throw listingsRes.error;
    setListings((listingsRes.data || []).map(normalizeListing));
  }

  async function loadUserScopedData(client, mappedUser) {
    if (!mappedUser?.id) {
      setSavedListingIds([]);
      setMessages([]);
      setSelectedThreadKey(null);
      return;
    }

    const savedRes = await client.from("saved_listings").select("listing_id").eq("user_id", mappedUser.id);
    if (savedRes.error) throw savedRes.error;
    setSavedListingIds((savedRes.data || []).map((item) => item.listing_id));

    const msgRes = await client
      .from("messages")
      .select("id, listing_id, listing_title, sender_id, recipient_id, sender_name, recipient_name, recipient_email, body, created_at")
      .order("created_at", { ascending: false });
    if (msgRes.error) throw msgRes.error;
    setMessages((msgRes.data || []).map((row) => normalizeMessage(row, mappedUser.id)));
    setSelectedThreadKey(null);
  }

  useEffect(() => {
    const config = getStoredSupabaseConfig();
    const client = makeSupabaseClient(config.url, config.anonKey);
    setSettingsForm(config);
    setSupabaseClient(client);
    setConfigured(Boolean(client));

    const demoUser = readLocal(STORAGE_KEYS.demoUser, null);
    const demoListings = readLocal(STORAGE_KEYS.demoListings, seedListings);
    const demoSaved = readLocal(STORAGE_KEYS.demoSaved, []);
    const demoMessages = readLocal(STORAGE_KEYS.demoMessages, []);

    if (!client) {
      setCurrentUser(demoUser);
      setListings(demoListings);
      setSavedListingIds(demoSaved);
      setMessages(demoMessages);
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((url) => {
        if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [imagePreviewUrls]);

  useEffect(() => {
    if (!supabaseClient) return;
    let mounted = true;

    async function bootstrap() {
      setLoading(true);
      try {
        const { data: authData } = await supabaseClient.auth.getUser();
        if (!mounted) return;
        const mappedUser = mapAuthUser(authData?.user || null);
        setCurrentUser(mappedUser);
        await loadListingsOnly(supabaseClient);
        if (!mounted) return;
        await loadUserScopedData(supabaseClient, mappedUser);
        if (!mounted) return;
        setDbStatus("Connected to Supabase");
      } catch (error) {
        setDbStatus(`Connection issue: ${error.message}`);
        showToast("Supabase connected, but one or more tables, columns, or policies still need setup");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    bootstrap();

    const { data: listener } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      const mappedUser = mapAuthUser(session?.user || null);
      setCurrentUser(mappedUser);
      setAuthLoading(false);
      if (mappedUser) {
        setLoginModalOpen(false);
        setLoginForm({ firstName: "", lastName: "", email: "", password: "" });
      }
      try {
        loadListingsOnly(supabaseClient).catch(() => {});
        loadUserScopedData(supabaseClient, mappedUser).catch(() => {});
      } catch (error) {
        if (mounted) showToast(error.message || "Could not refresh account data");
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabaseClient]);

  useEffect(() => {
    if (configured) return;
    writeLocal(STORAGE_KEYS.demoUser, currentUser);
  }, [currentUser, configured]);

  useEffect(() => {
    if (configured) return;
    writeLocal(STORAGE_KEYS.demoListings, listings);
  }, [listings, configured]);

  useEffect(() => {
    if (configured) return;
    writeLocal(STORAGE_KEYS.demoSaved, savedListingIds);
  }, [savedListingIds, configured]);

  useEffect(() => {
    if (configured) return;
    writeLocal(STORAGE_KEYS.demoMessages, messages);
  }, [messages, configured]);

  const filteredListings = useMemo(() => {
    let result = [...listings].filter((listing) => {
      const term = search.trim().toLowerCase();
      const matchesSearch = !term || listing.title.toLowerCase().includes(term) || listing.neighborhood.toLowerCase().includes(term) || listing.unitType.toLowerCase().includes(term) || listing.spaceType.toLowerCase().includes(term) || listing.description.toLowerCase().includes(term) || listing.spaceSummary.toLowerCase().includes(term);
      const matchesNeighborhood = selectedNeighborhood === "All Areas" || listing.neighborhood === selectedNeighborhood;
      const matchesSpaceType = selectedSpaceType === "All Types" || listing.spaceType === selectedSpaceType;
      const matchesPrice = Number(listing.price) <= Number(maxPrice);
      return matchesSearch && matchesNeighborhood && matchesSpaceType && matchesPrice;
    });

    if (sortBy === "Price: Low to High") result.sort((a, b) => a.price - b.price);
    if (sortBy === "Price: High to Low") result.sort((a, b) => b.price - a.price);
    if (sortBy === "Newest") result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return result;
  }, [listings, search, selectedNeighborhood, selectedSpaceType, maxPrice, sortBy]);

  const savedListings = useMemo(() => listings.filter((listing) => savedListingIds.includes(listing.id)), [listings, savedListingIds]);

  const myListings = useMemo(() => {
    if (!currentUser) return [];
    return listings.filter((listing) => listing.email === currentUser.email || listing.owner_id === currentUser.id);
  }, [listings, currentUser]);

  const threads = useMemo(() => {
    if (!currentUser) return [];
    const map = new Map();
    const sorted = [...messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    for (const message of sorted) {
      const key = threadKeyFromMessage(message, currentUser.id);
      const counterpartId = message.senderId === currentUser.id ? message.recipientId : message.senderId;
      const counterpartName = message.senderId === currentUser.id ? (message.recipientName || "Student") : (message.senderName || "Student");
      const counterpartEmail = message.senderId === currentUser.id ? (message.recipientEmail || "") : "";

      if (!map.has(key)) {
        map.set(key, {
          key,
          listingId: message.listingId,
          listingTitle: message.listingTitle,
          counterpartId,
          counterpartName,
          counterpartEmail,
          lastMessage: message.body,
          lastAt: message.createdAt,
          unreadCount: message.isMine ? 0 : 1,
        });
      } else if (!message.isMine) {
        const existing = map.get(key);
        existing.unreadCount += 1;
      }
    }

    return Array.from(map.values()).sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
  }, [messages, currentUser]);

  useEffect(() => {
    if (!selectedThreadKey && threads.length) setSelectedThreadKey(threads[0].key);
    if (selectedThreadKey && !threads.find((thread) => thread.key === selectedThreadKey)) {
      setSelectedThreadKey(threads[0]?.key || null);
    }
  }, [threads, selectedThreadKey]);

  const selectedThread = useMemo(() => threads.find((thread) => thread.key === selectedThreadKey) || null, [threads, selectedThreadKey]);

  const selectedThreadMessages = useMemo(() => {
    if (!currentUser || !selectedThreadKey) return [];
    return [...messages]
      .filter((message) => threadKeyFromMessage(message, currentUser.id) === selectedThreadKey)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [messages, currentUser, selectedThreadKey]);

  const selectedThreadListing = useMemo(() => {
    if (!selectedThread) return null;
    return listings.find((item) => item.id === selectedThread.listingId) || null;
  }, [selectedThread, listings]);

  function showToast(text) {
    setToast(text);
  }

  function requireLogin(callback) {
    if (!currentUser) {
      setLoginModalOpen(true);
      return;
    }
    callback();
  }

  function resetListingEditor() {
    setListingForm(emptyListingForm());
    setEditingListingId(null);
    setSelectedImageFiles([]);
    imagePreviewUrls.forEach((url) => {
      if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
    });
    setImagePreviewUrls([]);
    setActivePreviewImage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function openCreateListing() {
    resetListingEditor();
    setListingEditorOpen(true);
  }

  function openEditListing(listing) {
    setEditingListingId(listing.id);
    setListingForm({
      id: listing.id,
      title: listing.title,
      neighborhood: listing.neighborhood,
      address: listing.address || "",
      price: String(listing.price),
      unitBedrooms: String(listing.unitBedrooms),
      unitBathrooms: String(listing.unitBathrooms),
      term: listing.term,
      campus: listing.campus,
      unitType: listing.unitType,
      spaceType: listing.spaceType,
      spaceSummary: listing.spaceSummary,
      image: "",
      images: listing.images || [listing.image],
      description: listing.description,
    });
    setSelectedImageFiles([]);
    const existingImages = listing.images?.length ? listing.images : [listing.image].filter(Boolean);
    setImagePreviewUrls(existingImages);
    setActivePreviewImage(existingImages[0] || "");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setListingEditorOpen(true);
  }

  async function handleSelectedFile(fileList) {
    const incomingFiles = Array.from(fileList || []);
    if (!incomingFiles.length) return;

    const combinedFiles = [...selectedImageFiles, ...incomingFiles].slice(0, 10);
    setSelectedImageFiles(combinedFiles);

    const previewPromises = combinedFiles.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
          reader.onerror = () => resolve("");
          reader.readAsDataURL(file);
        })
    );

    const nextPreviews = (await Promise.all(previewPromises)).filter(Boolean);
    setImagePreviewUrls(nextPreviews);
    setListingForm((prev) => ({ ...prev, image: "" }));
    setActivePreviewImage((current) => current || nextPreviews[0] || "");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleRemovePhoto(indexToRemove) {
    const previewSource = imagePreviewUrls.length ? imagePreviewUrls : listingForm.images || [];
    const nextPreviewUrls = previewSource.filter((_, idx) => idx !== indexToRemove);
    const nextSelectedFiles = selectedImageFiles.filter((_, idx) => idx !== indexToRemove);
    const nextListingImages = (listingForm.images || []).filter((_, idx) => idx !== indexToRemove);

    setSelectedImageFiles(nextSelectedFiles);
    setImagePreviewUrls(imagePreviewUrls.length ? nextPreviewUrls : []);
    setListingForm((prev) => ({
      ...prev,
      images: nextListingImages,
      image: "",
    }));
    setActivePreviewImage(nextPreviewUrls[0] || nextListingImages[0] || "");
  }

  function handleViewListing(listing) {
    setSelectedListing(listing);
    setSelectedListingImageIndex(0);
    setListingModalOpen(true);
  }

  function handleOpenMessage(listing) {
    requireLogin(() => {
      setMessageTarget(listing);
      setMessageText("");
      setMessageComposerOpen(true);
    });
  }

  async function handleToggleSave(id) {
    requireLogin(async () => {
      const currentlySaved = savedListingIds.includes(id);
      const next = currentlySaved ? savedListingIds.filter((item) => item !== id) : [...savedListingIds, id];

      if (supabaseClient && currentUser?.id) {
        if (currentlySaved) {
          const { error } = await supabaseClient.from("saved_listings").delete().eq("user_id", currentUser.id).eq("listing_id", id);
          if (error) {
            showToast("Could not update saved listings");
            return;
          }
        } else {
          const { error } = await supabaseClient.from("saved_listings").insert({ user_id: currentUser.id, listing_id: id });
          if (error) {
            showToast("Could not update saved listings");
            return;
          }
        }
      }

      setSavedListingIds(next);
      showToast(currentlySaved ? "Removed from saved" : "Saved listing");
    });
  }

  async function createMessageRecord({ listing, body, recipientId, recipientName, recipientEmail }) {
    const createdAt = new Date().toISOString();
    const raw = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      listingId: listing.id,
      listingTitle: listing.title,
      senderId: currentUser.id,
      recipientId,
      senderName: currentUser.name,
      recipientName: recipientName || recipientEmail || "Student",
      recipientEmail: recipientEmail || "",
      body,
      createdAt,
      counterpartId: recipientId,
      counterpartName: recipientName || recipientEmail || "Student",
      isMine: true,
    };

    if (supabaseClient) {
      const { data, error } = await supabaseClient
        .from("messages")
        .insert({
          listing_id: listing.id,
          listing_title: listing.title,
          sender_id: currentUser.id,
          recipient_id: recipientId,
          sender_name: currentUser.name,
          recipient_name: recipientName || recipientEmail || "Student",
          recipient_email: recipientEmail || null,
          body,
        })
        .select()
        .single();
      if (error) throw error;
      return normalizeMessage(data, currentUser.id);
    }

    return raw;
  }

  async function handleSendMessage() {
    if (!messageText.trim() || !messageTarget || !currentUser) return;
    try {
      const newMessage = await createMessageRecord({
        listing: messageTarget,
        body: messageText.trim(),
        recipientId: messageTarget.owner_id || `owner-${messageTarget.id}`,
        recipientName: messageTarget.postedBy,
        recipientEmail: messageTarget.email,
      });
      setMessages((prev) => [newMessage, ...prev]);
      setMessageText("");
      setMessageComposerOpen(false);
      setActiveView("messages");
      setSelectedThreadKey(threadKeyFromMessage(newMessage, currentUser.id));
      showToast("Message sent");
    } catch {
      showToast("Message failed to send");
    }
  }

  async function handleSendReply() {
    if (!threadReplyText.trim() || !selectedThread || !currentUser) return;
    const listing = listings.find((item) => item.id === selectedThread.listingId);
    if (!listing) {
      showToast("Listing not found for this thread");
      return;
    }

    if (selectedThread.counterpartId === currentUser.id) {
      showToast("You cannot reply to your own account");
      return;
    }

    try {
      const newMessage = await createMessageRecord({
        listing,
        body: threadReplyText.trim(),
        recipientId: selectedThread.counterpartId,
        recipientName: selectedThread.counterpartName,
        recipientEmail: selectedThread.counterpartEmail || "",
      });
      setMessages((prev) => [newMessage, ...prev]);
      setThreadReplyText("");
      setSelectedThreadKey(threadKeyFromMessage(newMessage, currentUser.id));
      showToast("Reply sent");
    } catch {
      showToast("Reply failed to send");
    }
  }

  async function handleLogin() {
    if (!loginForm.email.trim() || !loginForm.password.trim()) return;

    const email = loginForm.email.trim().toLowerCase();
    const firstName = loginForm.firstName.trim();
    const lastName = loginForm.lastName.trim();
    const password = loginForm.password;
    const fullName = [firstName, lastName].filter(Boolean).join(" ");

    if (!supabaseClient) {
      showToast("Connect Supabase in Setup to use real accounts");
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === "signup") {
        if (!firstName || !lastName) {
          showToast("First name and last name are required");
          return;
        }

        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              full_name: fullName,
            },
          },
        });

        if (error) {
          showToast(error.message || "Sign up failed");
          return;
        }

        setLoginModalOpen(false);
        setLoginForm({ firstName: "", lastName: "", email: "", password: "" });

        if (!data.session) {
          showToast("Account created. You can log in now.");
        } else {
          const mappedUser = mapAuthUser(data.user);
          setCurrentUser(mappedUser);
          showToast("Account created");
          loadUserScopedData(supabaseClient, mappedUser).catch(() => {});
        }
        return;
      }

      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error || !data?.user) {
        showToast(error?.message || "Login failed");
        return;
      }

      const mappedUser = mapAuthUser(data.user);
      setCurrentUser(mappedUser);
      setLoginModalOpen(false);
      setLoginForm({ firstName: "", lastName: "", email: "", password: "" });
      setAuthLoading(false);
      showToast("Logged in");
      loadUserScopedData(supabaseClient, mappedUser).catch((error) => {
        showToast(error?.message || "Logged in, but could not refresh account data");
      });
    } catch (error) {
      showToast(error?.message || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    const clearUi = () => {
      setCurrentUser(null);
      setSavedListingIds([]);
      setMessages([]);
      setSelectedThreadKey(null);
      setSelectedListing(null);
      setListingModalOpen(false);
      setMessageComposerOpen(false);
      setLoginModalOpen(false);
      setListingEditorOpen(false);
      setActiveView("home");
      setMobileMenuOpen(false);
    };

    try {
      clearUi();
      clearSupabaseAuthStorage();

      if (supabaseClient) {
        const signOutPromise = supabaseClient.auth.signOut({ scope: "local" });
        await Promise.race([
          signOutPromise,
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ]);
      }

      showToast("Logged out");
    } catch (error) {
      clearUi();
      clearSupabaseAuthStorage();
      showToast(error?.message || "Logged out");
    }
  }

  async function uploadSelectedImages() {
    if (!selectedImageFiles.length) return listingForm.images?.length ? listingForm.images : [];
    if (!supabaseClient) return imagePreviewUrls;

    setImageUploading(true);
    try {
      const preparedFiles = await Promise.all(
        selectedImageFiles.slice(0, 10).map((file) => compressImageFile(file))
      );

      const uploadedUrls = await Promise.all(
        preparedFiles.map(async (file) => {
          const ext = file.name.split(".").pop() || "jpg";
          const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const uploadRes = await supabaseClient.storage.from("listing-images").upload(fileName, file, {
            upsert: false,
            contentType: file.type || undefined,
          });
          if (uploadRes.error) throw uploadRes.error;
          const publicUrlRes = supabaseClient.storage.from("listing-images").getPublicUrl(fileName);
          return publicUrlRes.data.publicUrl;
        })
      );

      return uploadedUrls;
    } finally {
      setImageUploading(false);
    }
  }

  async function handleSaveListing() {
    if (!currentUser) {
      setLoginModalOpen(true);
      return;
    }

    if (!listingForm.title || !listingForm.price || !listingForm.term || !listingForm.description || !listingForm.spaceSummary) {
      showToast("Please fill in the required fields");
      return;
    }

    try {
      let finalImages = listingForm.images?.length ? listingForm.images.filter(Boolean).slice(0, 10) : [];
      if (selectedImageFiles.length) finalImages = await uploadSelectedImages();
      if (!finalImages.length && imagePreviewUrls.length) {
        finalImages = imagePreviewUrls.filter((url) => !url.startsWith("blob:")).slice(0, 10);
      }
      const finalImage = finalImages[0] || "";

      const payload = {
        title: listingForm.title,
        neighborhood: listingForm.neighborhood,
        address: listingForm.address,
        price: Number(listingForm.price),
        unit_bedrooms: Number(listingForm.unitBedrooms),
        unit_bathrooms: String(listingForm.unitBathrooms),
        term: listingForm.term,
        campus_distance: listingForm.campus || "Near NYU campus",
        unit_type: listingForm.unitType,
        space_type: listingForm.spaceType,
        space_summary: listingForm.spaceSummary,
        verified: Boolean(currentUser.verified),
        featured: false,
        image_url: finalImages.length > 1 ? JSON.stringify(finalImages) : (finalImage || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80"),
        description: listingForm.description,
        posted_by: currentUser.name,
        contact_email: currentUser.email,
        owner_id: currentUser.id,
      };

      let savedListing;

      if (editingListingId) {
        if (supabaseClient) {
          const { data, error } = await supabaseClient.from("listings").update(payload).eq("id", editingListingId).eq("owner_id", currentUser.id).select().single();
          if (error) throw error;
          savedListing = normalizeListing(data);
        } else {
          savedListing = normalizeListing({ ...payload, id: editingListingId, created_at: new Date().toISOString() });
        }
        setListings((prev) => prev.map((item) => (item.id === editingListingId ? { ...item, ...savedListing } : item)));
        showToast("Listing updated");
      } else {
        if (supabaseClient) {
          const { data, error } = await supabaseClient.from("listings").insert(payload).select().single();
          if (error) throw error;
          savedListing = normalizeListing(data);
        } else {
          savedListing = normalizeListing({ ...payload, id: `${Date.now()}`, created_at: new Date().toISOString() });
        }
        setListings((prev) => [savedListing, ...prev]);
        showToast("Your listing is live");
      }

      resetListingEditor();
      setListingEditorOpen(false);
      setActiveView("my-listings");
    } catch {
      showToast(selectedImageFiles.length ? "Could not save listing or upload images" : "Could not save listing");
    }
  }

  async function handleDeleteListing(listing) {
    requireLogin(async () => {
      if (!currentUser) return;
      if (supabaseClient) {
        const { error } = await supabaseClient.from("listings").delete().eq("id", listing.id).eq("owner_id", currentUser.id);
        if (error) {
          showToast("Could not delete listing");
          return;
        }
      }
      setListings((prev) => prev.filter((item) => item.id !== listing.id));
      showToast("Listing deleted");
    });
  }

  async function handleSaveSupabaseConfig() {
    const url = settingsForm.url.trim();
    const anonKey = settingsForm.anonKey.trim();
    const client = makeSupabaseClient(url, anonKey);
    if (!client) {
      showToast("Please enter a valid Supabase URL and publishable key");
      return;
    }
    setStoredSupabaseConfig(url, anonKey);
    setSupabaseClient(client);
    setConfigured(true);
    setSettingsModalOpen(false);
    showToast("Supabase config saved");
  }

  function handleDisconnectSupabase() {
    clearStoredSupabaseConfig();
    setSupabaseClient(null);
    setConfigured(false);
    setSettingsForm({ url: "", anonKey: "" });
    setCurrentUser(readLocal(STORAGE_KEYS.demoUser, null));
    setListings(readLocal(STORAGE_KEYS.demoListings, seedListings));
    setSavedListingIds(readLocal(STORAGE_KEYS.demoSaved, []));
    setMessages(readLocal(STORAGE_KEYS.demoMessages, []));
    setDbStatus("Demo mode");
    showToast("Switched back to demo mode");
  }

  const heroListings = filteredListings.slice(0, 6);

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#fafafa,#ffffff_30%,#ffffff)] text-zinc-900">
      <div className="absolute inset-x-0 top-0 -z-10 h-[46rem] bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.18),transparent_38%),radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_25%),linear-gradient(to_bottom,#fafafa,#ffffff)]" />

      <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <button onClick={() => setActiveView("home")} className="flex items-center gap-3 text-left">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-500/20"><GraduationCap className="h-5 w-5" /></div>
            <div>
              <div className="text-lg font-semibold tracking-tight">SubletNYU</div>
              <div className="text-xs text-zinc-500">by NYU students, for NYU students {configured ? "• live database mode" : "• demo mode"}</div>
            </div>
          </button>

          <nav className="hidden items-center gap-8 md:flex">
            <button onClick={() => setActiveView("browse")} className="text-sm text-zinc-600 transition hover:text-zinc-900">Browse</button>
            <button onClick={() => setActiveView("saved")} className="text-sm text-zinc-600 transition hover:text-zinc-900">Saved</button>
            <button onClick={() => setActiveView("messages")} className="text-sm text-zinc-600 transition hover:text-zinc-900">Messages</button>
            <button onClick={() => setActiveView("my-listings")} className="text-sm text-zinc-600 transition hover:text-zinc-900">My Listings</button>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button variant="outline" onClick={() => setSettingsModalOpen(true)} className="rounded-2xl border-zinc-300">
              <Settings className="mr-2 h-4 w-4" />Setup
            </Button>
            {currentUser ? (
              <>
                <div className="rounded-2xl border border-zinc-200 px-4 py-2 text-sm text-zinc-700">
                  {currentUser.name}
                  {currentUser.verified && <span className="ml-2 text-violet-600">• verified</span>}
                </div>
                <Button variant="outline" onClick={handleLogout} className="rounded-2xl border-zinc-300"><LogOut className="mr-2 h-4 w-4" />Log out</Button>
                <Button onClick={openCreateListing} className="rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800">Post your sublet</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setLoginModalOpen(true)} className="rounded-2xl">Log in</Button>
                <Button onClick={openCreateListing} className="rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800">Post your sublet</Button>
              </>
            )}
          </div>

          <button className="rounded-2xl border border-zinc-200 p-2 md:hidden" onClick={() => setMobileMenuOpen((v) => !v)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-zinc-200 bg-white px-6 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <button onClick={() => setActiveView("browse")} className="text-left text-sm text-zinc-700">Browse</button>
              <button onClick={() => setActiveView("saved")} className="text-left text-sm text-zinc-700">Saved</button>
              <button onClick={() => setActiveView("messages")} className="text-left text-sm text-zinc-700">Messages</button>
              <button onClick={() => setActiveView("my-listings")} className="text-left text-sm text-zinc-700">My Listings</button>
              <button onClick={() => setSettingsModalOpen(true)} className="text-left text-sm text-zinc-700">Setup</button>
              {currentUser ? (
                <button onClick={handleLogout} className="text-left text-sm text-zinc-700">Log out</button>
              ) : (
                <button onClick={() => setLoginModalOpen(true)} className="text-left text-sm text-zinc-700">Log in</button>
              )}
              <Button onClick={openCreateListing} className="mt-2 rounded-2xl bg-zinc-900 text-white">Post your sublet</Button>
            </div>
          </div>
        )}
      </header>

      <main>
        {activeView === "home" && (
          <>
            <section className="mx-auto grid max-w-7xl gap-14 px-6 pb-14 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24 lg:pt-20">
              <div className="flex flex-col justify-center">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="max-w-2xl">
                  <Badge className="mb-5 rounded-full bg-violet-100 px-4 py-1.5 text-violet-700 hover:bg-violet-100">Student housing, finally done right</Badge>
                  <h1 className="text-5xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">The clean, trusted sublet marketplace NYU students actually want to use.</h1>
                  <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">Post a full apartment or a single room, upload real photos, message in threads, and manage listings with a polished startup-quality experience.</p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Button size="lg" onClick={() => setActiveView("browse")} className="rounded-2xl bg-zinc-900 px-6 text-white hover:bg-zinc-800">Start browsing<ArrowRight className="ml-2 h-4 w-4" /></Button>
                    <Button size="lg" variant="outline" onClick={openCreateListing} className="rounded-2xl border-zinc-300 px-6">Post your sublet</Button>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-zinc-600">
                    <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-violet-600" />Full apartment or room listings</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-violet-600" />Edit listings anytime</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-violet-600" />Threaded messaging</div>
                  </div>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="relative">
                <Card className="overflow-hidden rounded-[2rem] border-zinc-200/70 bg-white shadow-2xl shadow-zinc-200/60">
                  <CardContent className="p-0">
                    <div className="relative h-[30rem] w-full overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80" alt="NYC apartment interior" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-zinc-900/10 to-transparent" />
                      <div className="absolute bottom-5 left-5 right-5 grid gap-4 rounded-3xl border border-white/20 bg-white/12 p-4 text-white backdrop-blur-md sm:grid-cols-2">
                        <div>
                          <div className="text-lg font-semibold">Student-first listing flow</div>
                          <div className="mt-1 text-sm text-white/80">Separate unit details from sublet details so listings are clear.</div>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-4 text-sm text-white/85">
                          <div className="font-medium">Best for:</div>
                          <div className="mt-1">West Village, SoHo, East Village, Flatiron, NoHo, Chelsea and more.</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="absolute -bottom-8 -left-2 grid w-[22rem] gap-3 sm:-left-8">
                  <Card className="rounded-3xl border-zinc-200/80 bg-white shadow-xl">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><ShieldCheck className="h-5 w-5" /></div>
                        <div>
                          <div className="font-semibold">{dbStatus}</div>
                          <div className="text-sm text-zinc-500">{configured ? "Publish once your database columns are ready" : "Works immediately in demo mode"}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </section>

            <section className="mx-auto max-w-7xl px-6 lg:px-8">
              <Card className="rounded-[2rem] border-zinc-200/70 bg-white shadow-xl shadow-zinc-100">
                <CardContent className="p-5 sm:p-6">
                  <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_auto]">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by area, listing type, or keywords" className="h-14 rounded-2xl border-zinc-200 pl-11" />
                    </div>
                    <select value={selectedNeighborhood} onChange={(e) => setSelectedNeighborhood(e.target.value)} className="h-14 rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-700 outline-none">{neighborhoods.map((n) => <option key={n}>{n}</option>)}</select>
                    <select value={selectedSpaceType} onChange={(e) => setSelectedSpaceType(e.target.value)} className="h-14 rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-700 outline-none"><option>All Types</option>{spaceTypes.map((t) => <option key={t}>{t}</option>)}</select>
                    <div className="flex h-14 items-center rounded-2xl border border-zinc-200 px-4 text-sm text-zinc-600">Max ${maxPrice.toLocaleString()}</div>
                    <Button onClick={() => setActiveView("browse")} className="h-14 rounded-2xl bg-violet-600 px-6 text-white hover:bg-violet-700">Search listings</Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 py-16 sm:grid-cols-4 lg:px-8">
              {[
                [`${listings.length}+`, "Active listings"],
                [configured ? "Live" : "Demo", "App mode"],
                [`${savedListings.length}`, "Saved by you"],
                [`${threads.length}`, "Message threads"],
              ].map(([value, label]) => (
                <Card key={label} className="rounded-3xl border-zinc-200/70 bg-white">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-semibold tracking-tight text-zinc-950">{value}</div>
                    <div className="mt-2 text-sm text-zinc-500">{label}</div>
                  </CardContent>
                </Card>
              ))}
            </section>

            <section className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <Badge className="mb-3 rounded-full bg-zinc-100 text-zinc-700 hover:bg-zinc-100">Featured listings</Badge>
                  <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">Browse SubletNYU listings</h2>
                  <p className="mt-2 text-zinc-600">A much clearer way to browse rooms, apartments, and summer sublets around NYU.</p>
                </div>
                <Button variant="outline" onClick={() => setActiveView("browse")} className="rounded-2xl border-zinc-300">Open full marketplace</Button>
              </div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {heroListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} onView={handleViewListing} onToggleSave={handleToggleSave} isSaved={savedListingIds.includes(listing.id)} onMessage={handleOpenMessage} canDelete={false} canEdit={false} onDelete={handleDeleteListing} onEdit={openEditListing} />
                ))}
              </div>
            </section>
          </>
        )}

        {activeView === "browse" && (
          <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Badge className="mb-3 rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">Marketplace</Badge>
                <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">Find your next sublet</h2>
                <p className="mt-2 text-zinc-600">Filter by neighborhood, sublet type, price, and timing.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={openCreateListing} className="rounded-2xl border-zinc-300"><Plus className="mr-2 h-4 w-4" />Post listing</Button>
                <Button variant="outline" onClick={() => setSettingsModalOpen(true)} className="rounded-2xl border-zinc-300"><Settings className="mr-2 h-4 w-4" />Setup</Button>
              </div>
            </div>

            <Card className="mb-8 rounded-[2rem] border-zinc-200/70 bg-white shadow-sm">
              <CardContent className="grid gap-4 p-5 lg:grid-cols-5">
                <div className="relative lg:col-span-2">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search listings" className="h-12 rounded-2xl border-zinc-200 pl-11" />
                </div>
                <select value={selectedNeighborhood} onChange={(e) => setSelectedNeighborhood(e.target.value)} className="h-12 rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none">{neighborhoods.map((n) => <option key={n}>{n}</option>)}</select>
                <select value={selectedSpaceType} onChange={(e) => setSelectedSpaceType(e.target.value)} className="h-12 rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none"><option>All Types</option>{spaceTypes.map((t) => <option key={t}>{t}</option>)}</select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-12 rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none">{sortOptions.map((s) => <option key={s}>{s}</option>)}</select>
              </CardContent>
            </Card>

            <div className="mb-8 grid gap-4 md:grid-cols-3">
              <Card className="rounded-3xl border-zinc-200/70 bg-white"><CardContent className="flex items-center gap-3 p-5"><Filter className="h-5 w-5 text-violet-600" /><div><div className="font-medium">Price filter</div><input type="range" min="1000" max="7000" step="50" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="mt-2 w-full" /><div className="mt-1 text-sm text-zinc-500">Up to ${maxPrice.toLocaleString()}/month</div></div></CardContent></Card>
              <Card className="rounded-3xl border-zinc-200/70 bg-white"><CardContent className="flex items-center gap-3 p-5"><MapPinned className="h-5 w-5 text-violet-600" /><div><div className="font-medium">Prime student areas</div><div className="mt-1 text-sm text-zinc-500">SoHo, West Village, East Village, Flatiron, NoHo and more</div></div></CardContent></Card>
              <Card className="rounded-3xl border-zinc-200/70 bg-white"><CardContent className="flex items-center gap-3 p-5"><School className="h-5 w-5 text-violet-600" /><div><div className="font-medium">NYU-first</div><div className="mt-1 text-sm text-zinc-500">Built for Washington Square students and roommates</div></div></CardContent></Card>
            </div>

            {loading && configured && <div className="mb-6 text-sm text-zinc-500">Loading from Supabase…</div>}

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} onView={handleViewListing} onToggleSave={handleToggleSave} isSaved={savedListingIds.includes(listing.id)} onMessage={handleOpenMessage} canDelete={false} canEdit={false} onDelete={handleDeleteListing} onEdit={openEditListing} />
              ))}
            </div>
          </section>
        )}

        {activeView === "saved" && (
          <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
            <Badge className="mb-3 rounded-full bg-zinc-100 text-zinc-700 hover:bg-zinc-100">Saved</Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">Your saved listings</h2>
            <p className="mt-2 text-zinc-600">Keep track of the places you want to revisit.</p>
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {savedListings.length ? savedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} onView={handleViewListing} onToggleSave={handleToggleSave} isSaved={savedListingIds.includes(listing.id)} onMessage={handleOpenMessage} canDelete={false} canEdit={false} onDelete={handleDeleteListing} onEdit={openEditListing} />
              )) : (
                <Card className="col-span-full rounded-3xl border-dashed border-zinc-300 bg-zinc-50"><CardContent className="p-10 text-center"><div className="text-lg font-medium text-zinc-900">No saved listings yet.</div><div className="mt-2 text-sm text-zinc-500">Tap the heart on any listing to save it.</div></CardContent></Card>
              )}
            </div>
          </section>
        )}

        {activeView === "messages" && (
          <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Badge className="mb-3 rounded-full bg-zinc-100 text-zinc-700 hover:bg-zinc-100">Inbox</Badge>
                <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">Messages</h2>
                <p className="mt-2 text-zinc-600">Reply in real threads instead of one-off lead messages.</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
                {threads.length} conversation{threads.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.38fr_0.62fr]">
              <Card className="rounded-[2rem] border-zinc-200/70 bg-white shadow-sm">
                <CardContent className="p-4">
                  <div className="mb-3 px-2 text-sm font-medium text-zinc-500">Conversations</div>
                  <div className="space-y-2">
                    {threads.length ? threads.map((thread) => (
                      <button key={thread.key} onClick={() => setSelectedThreadKey(thread.key)} className={`w-full rounded-2xl p-4 text-left transition ${selectedThreadKey === thread.key ? "bg-violet-50 ring-1 ring-violet-200" : "hover:bg-zinc-50"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-zinc-950">{thread.counterpartName}</div>
                            {thread.unreadCount > 0 && <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-semibold text-white">{thread.unreadCount}</span>}
                          </div>
                          <div className="mt-1 truncate text-sm text-violet-600">{thread.listingTitle}</div>
                          <div className="mt-2 line-clamp-2 text-sm text-zinc-600">{thread.lastMessage}</div>
                        </div>
                        <div className="whitespace-nowrap text-xs text-zinc-400">{formatRelativeTime(thread.lastAt)}</div>
                      </div>
                    </button>
                    )) : <div className="rounded-2xl bg-zinc-50 p-6 text-sm text-zinc-500">No messages yet. Start by reaching out on a listing.</div>}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-zinc-200/70 bg-white shadow-sm">
                <CardContent className="flex h-[38rem] flex-col p-0">
                  {selectedThread ? (
                    <>
                      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
                        <div>
                          <div className="text-lg font-semibold text-zinc-950">{selectedThread.counterpartName}</div>
                          <div className="mt-1 text-sm text-violet-600">{selectedThread.listingTitle}</div>
                        </div>
                        <div className="text-xs text-zinc-400">{selectedThread.counterpartEmail || "NYU user"}</div>
                      </div>
                      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                        {selectedThreadMessages.map((message) => (
                          <div key={message.id} className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[78%] rounded-3xl px-4 py-3 text-sm leading-6 ${message.isMine ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-800"}`}>
                              {!message.isMine && (
                                <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-zinc-400">{message.senderName}</div>
                              )}
                              <div>{message.body}</div>
                              <div className={`mt-2 text-xs ${message.isMine ? "text-white/60" : "text-zinc-400"}`}>{formatRelativeTime(message.createdAt)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-zinc-200 px-6 py-4">
                        <div className="mb-3 flex items-center justify-between text-xs text-zinc-400">
                          <div>{selectedThread ? `Replying to ${selectedThread.counterpartName}` : ""}</div>
                          <div>Press Cmd/Ctrl + Enter to send</div>
                        </div>
                        <div className="flex items-end gap-3">
                          <Textarea
                            value={threadReplyText}
                            onChange={(e) => setThreadReplyText(e.target.value)}
                            onKeyDown={(e) => {
                              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                                e.preventDefault();
                                handleSendReply();
                              }
                            }}
                            placeholder="Write a reply..."
                            className="min-h-[74px] rounded-2xl"
                          />
                          <Button onClick={handleSendReply} disabled={!selectedThread || selectedThread.counterpartId === currentUser?.id} className="rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50"><Send className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center p-8 text-center text-sm text-zinc-500">Select a conversation to see messages and reply.</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {activeView === "my-listings" && (
          <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <Badge className="mb-3 rounded-full bg-zinc-100 text-zinc-700 hover:bg-zinc-100">Dashboard</Badge>
                <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">My listings</h2>
                <p className="mt-2 text-zinc-600">Edit, update, or remove your sublets anytime.</p>
              </div>
              <Button onClick={openCreateListing} className="rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800"><Plus className="mr-2 h-4 w-4" />New listing</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {myListings.length ? myListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} onView={handleViewListing} onToggleSave={handleToggleSave} isSaved={savedListingIds.includes(listing.id)} onMessage={handleOpenMessage} canDelete={true} canEdit={true} onDelete={handleDeleteListing} onEdit={openEditListing} />
              )) : (
                <Card className="col-span-full rounded-3xl border-dashed border-zinc-300 bg-zinc-50"><CardContent className="p-10 text-center"><div className="text-lg font-medium text-zinc-900">You have not posted any listings yet.</div><div className="mt-2 text-sm text-zinc-500">Create one in under a minute.</div><Button onClick={openCreateListing} className="mt-5 rounded-2xl bg-violet-600 text-white hover:bg-violet-700">Post your first sublet</Button></CardContent></Card>
              )}
            </div>
          </section>
        )}

        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <Card className="rounded-[2rem] border-zinc-200/70 bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-700 text-white shadow-2xl shadow-violet-300/30">
            <CardContent className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="mb-3 flex items-center gap-2 text-sm text-violet-100"><Sparkles className="h-4 w-4" />{configured ? "Connected to Supabase" : "Publishable app in demo mode"}</div>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Ready to publish SubletNYU?</h2>
                <p className="mt-3 max-w-2xl text-violet-100">This build now has edit listing flows, clearer listing structure, stronger photo handling, and startup-level messaging UX. Open Setup, finish your database columns, then deploy.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button onClick={() => setSettingsModalOpen(true)} className="rounded-2xl bg-white text-violet-700 hover:bg-violet-50">Open setup</Button>
                <Button variant="outline" onClick={() => setActiveView("browse")} className="rounded-2xl border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">Browse listings</Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="mt-10 border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1fr_auto_auto_auto] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white"><GraduationCap className="h-5 w-5" /></div>
              <div>
                <div className="font-semibold">SubletNYU</div>
                <div className="text-sm text-zinc-500">by NYU students, for NYU students</div>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-500">A modern student housing marketplace for NYU sublets, semester stays, and short-term rentals around campus.</p>
          </div>
          <div><div className="font-medium text-zinc-900">Platform</div><div className="mt-4 space-y-3 text-sm text-zinc-500"><div>Browse</div><div>Post a listing</div><div>Edit listing</div><div>Messaging</div></div></div>
          <div><div className="font-medium text-zinc-900">Backend</div><div className="mt-4 space-y-3 text-sm text-zinc-500"><div>Supabase auth</div><div>Supabase storage</div><div>Database tables</div><div>Vercel deploy</div></div></div>
          <div><div className="font-medium text-zinc-900">Legal</div><div className="mt-4 space-y-3 text-sm text-zinc-500"><div>Terms</div><div>Privacy</div><div>Cookies</div></div></div>
        </div>
      </footer>

      <Modal open={listingModalOpen} onClose={() => setListingModalOpen(false)} title={selectedListing?.title || "Listing"} maxWidth="max-w-4xl">
        {selectedListing && (
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <div className="space-y-3">
              <img src={selectedListing.images?.[selectedListingImageIndex] || selectedListing.image} alt={selectedListing.title} className="h-[24rem] w-full rounded-[1.5rem] object-cover" />
              {!!selectedListing.images?.length && selectedListing.images.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                  {selectedListing.images.slice(0, 10).map((img, idx) => (
                    <button key={`${img}-${idx}`} onClick={() => setSelectedListingImageIndex(idx)} className={`overflow-hidden rounded-2xl border ${selectedListingImageIndex === idx ? "border-violet-500 ring-2 ring-violet-200" : "border-zinc-200"}`}>
                      <img src={img} alt={`Listing photo ${idx + 1}`} className="h-20 w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
              <div>
                <div className="text-lg font-semibold text-zinc-950">About this sublet</div>
                <p className="mt-3 leading-7 text-zinc-600">{selectedListing.description}</p>
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedListing.verified && <Badge className="rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">Verified listing</Badge>}
                  <Badge className="rounded-full bg-zinc-100 text-zinc-700 hover:bg-zinc-100">{selectedListing.spaceType}</Badge>
                  <Badge className="rounded-full bg-zinc-100 text-zinc-700 hover:bg-zinc-100">{selectedListing.unitType}</Badge>
                </div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950">{selectedListing.title}</h2>
                <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500"><MapPin className="h-4 w-4" />{selectedListing.neighborhood}{selectedListing.address ? ` • ${selectedListing.address}` : ""}</div>
              </div>
              <Card className="rounded-3xl"><CardContent className="grid gap-4 p-5 sm:grid-cols-2"><div><div className="text-sm text-zinc-500">Price</div><div className="mt-1 text-2xl font-semibold text-zinc-950">${selectedListing.price.toLocaleString()}/mo</div></div><div><div className="text-sm text-zinc-500">Available</div><div className="mt-1 text-lg font-semibold text-zinc-950">{selectedListing.term}</div></div></CardContent></Card>
              <div className="grid gap-3 rounded-3xl bg-zinc-50 p-5 text-sm text-zinc-700 sm:grid-cols-2">
                <div className="flex items-center gap-2"><BedDouble className="h-4 w-4" />Unit: {selectedListing.unitBedrooms === 0 ? "Studio" : `${selectedListing.unitBedrooms} bedrooms`}</div>
                <div className="flex items-center gap-2"><Bath className="h-4 w-4" />Unit: {selectedListing.unitBathrooms} bathrooms</div>
                <div className="flex items-center gap-2"><Home className="h-4 w-4" />Sublet: {selectedListing.spaceSummary}</div>
                <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4" />{selectedListing.campus}</div>
                <div className="flex items-center gap-2 sm:col-span-2"><User className="h-4 w-4" />Posted by {selectedListing.postedBy}</div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => handleOpenMessage(selectedListing)} className="rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800"><Mail className="mr-2 h-4 w-4" />Message poster</Button>
                <Button variant="outline" onClick={() => handleToggleSave(selectedListing.id)} className="rounded-2xl border-zinc-300">{savedListingIds.includes(selectedListing.id) ? "Saved" : "Save listing"}</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={listingEditorOpen} onClose={() => { setListingEditorOpen(false); resetListingEditor(); }} title={editingListingId ? "Edit your listing" : "Create a listing"} maxWidth="max-w-5xl">
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-3xl border-zinc-200/70"><CardContent className="p-5"><div className="mb-2 flex items-center gap-2 font-medium text-zinc-950"><Home className="h-4 w-4 text-violet-600" />1. Unit details</div><div className="text-sm leading-6 text-zinc-600">Describe the actual apartment itself: building size, total bedrooms, total bathrooms.</div></CardContent></Card>
            <Card className="rounded-3xl border-zinc-200/70"><CardContent className="p-5"><div className="mb-2 flex items-center gap-2 font-medium text-zinc-950"><BedDouble className="h-4 w-4 text-violet-600" />2. What is being sublet?</div><div className="text-sm leading-6 text-zinc-600">Be clear whether you are subletting the full apartment, one private room, or one shared room.</div></CardContent></Card>
            <Card className="rounded-3xl border-zinc-200/70"><CardContent className="p-5"><div className="mb-2 flex items-center gap-2 font-medium text-zinc-950"><ImageIcon className="h-4 w-4 text-violet-600" />3. Add visuals</div><div className="text-sm leading-6 text-zinc-600">Upload a photo file or paste a URL. Uploaded files now preview immediately before publishing.</div></CardContent></Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            <div className="space-y-8">
              <div>
                <div className="mb-4 text-lg font-semibold text-zinc-950">Listing basics</div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2"><div className="mb-2 text-sm font-medium text-zinc-700">Listing title</div><Input value={listingForm.title} onChange={(e) => setListingForm({ ...listingForm, title: e.target.value })} placeholder="Ex: West Village 2BR Summer Sublet" className="h-12 rounded-2xl" /></div>
                  <div><div className="mb-2 text-sm font-medium text-zinc-700">Neighborhood</div><select value={listingForm.neighborhood} onChange={(e) => setListingForm({ ...listingForm, neighborhood: e.target.value })} className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none">{neighborhoods.filter((n) => n !== "All Areas").map((n) => <option key={n}>{n}</option>)}</select></div>
                  <div><div className="mb-2 text-sm font-medium text-zinc-700">Address or cross streets</div><Input value={listingForm.address} onChange={(e) => setListingForm({ ...listingForm, address: e.target.value })} placeholder="Ex: Broadway & W 3rd St" className="h-12 rounded-2xl" /></div>
                  <div><div className="mb-2 text-sm font-medium text-zinc-700">Monthly price</div><Input type="number" value={listingForm.price} onChange={(e) => setListingForm({ ...listingForm, price: e.target.value })} placeholder="2500" className="h-12 rounded-2xl" /></div>
                  <div><div className="mb-2 text-sm font-medium text-zinc-700">Available term</div><Input value={listingForm.term} onChange={(e) => setListingForm({ ...listingForm, term: e.target.value })} placeholder="May 20 – Aug 20" className="h-12 rounded-2xl" /></div>
                  <div className="md:col-span-2"><div className="mb-2 text-sm font-medium text-zinc-700">Campus commute</div><Input value={listingForm.campus} onChange={(e) => setListingForm({ ...listingForm, campus: e.target.value })} placeholder="8 min to Washington Sq" className="h-12 rounded-2xl" /></div>
                </div>
              </div>

              <div>
                <div className="mb-4 text-lg font-semibold text-zinc-950">Unit details</div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div><div className="mb-2 text-sm font-medium text-zinc-700">Unit type</div><select value={listingForm.unitType} onChange={(e) => setListingForm({ ...listingForm, unitType: e.target.value })} className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none">{unitTypes.map((t) => <option key={t}>{t}</option>)}</select></div>
                  <div><div className="mb-2 text-sm font-medium text-zinc-700">Total unit bedrooms</div><Input type="number" value={listingForm.unitBedrooms} onChange={(e) => setListingForm({ ...listingForm, unitBedrooms: e.target.value })} placeholder="3" className="h-12 rounded-2xl" /></div>
                  <div><div className="mb-2 text-sm font-medium text-zinc-700">Total unit bathrooms</div><select value={listingForm.unitBathrooms} onChange={(e) => setListingForm({ ...listingForm, unitBathrooms: e.target.value })} className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none">{bathroomOptions.map((t) => <option key={t}>{t}</option>)}</select></div>
                </div>
              </div>

              <div>
                <div className="mb-4 text-lg font-semibold text-zinc-950">Sublet details</div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div><div className="mb-2 text-sm font-medium text-zinc-700">What is being sublet?</div><select value={listingForm.spaceType} onChange={(e) => setListingForm({ ...listingForm, spaceType: e.target.value })} className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none">{spaceTypes.map((t) => <option key={t}>{t}</option>)}</select></div>
                  <div className="md:col-span-2"><div className="mb-2 text-sm font-medium text-zinc-700">Sublet summary</div><Input value={listingForm.spaceSummary} onChange={(e) => setListingForm({ ...listingForm, spaceSummary: e.target.value })} placeholder="Ex: 1 private bedroom available in a 3 bed apartment" className="h-12 rounded-2xl" /></div>
                  <div className="md:col-span-2"><div className="mb-2 text-sm font-medium text-zinc-700">Describe the space</div><Textarea value={listingForm.description} onChange={(e) => setListingForm({ ...listingForm, description: e.target.value })} placeholder="Describe the condition, furniture, natural light, living room, kitchen, roommates, building amenities, and anything else that matters." className="min-h-[160px] rounded-2xl" /></div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="rounded-[2rem] border-zinc-200/70 bg-zinc-50/60">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-zinc-950"><UploadCloud className="h-5 w-5 text-violet-600" />Photos</div>
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 text-sm font-medium text-zinc-700">Upload up to 10 image files</div>
                      <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={(e) => handleSelectedFile(e.target.files)} className="h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none file:mr-3 file:rounded-xl file:border-0 file:bg-violet-50 file:px-3 file:py-2 file:text-violet-700" />
                    </div>
                    <div className="overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white">
                      <div className="flex h-64 items-center justify-center bg-zinc-100/80">
                        {(activePreviewImage || imagePreviewUrls[0] || listingForm.images?.[0] || listingForm.image) ? (
                          <img src={activePreviewImage || imagePreviewUrls[0] || listingForm.images?.[0] || listingForm.image} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="text-center text-sm text-zinc-500">
                            <ImageIcon className="mx-auto mb-3 h-8 w-8" />
                            Photo preview appears here
                          </div>
                        )}
                      </div>
                    </div>
                    {!!(imagePreviewUrls.length || listingForm.images?.length) && (
                      <div className="grid grid-cols-5 gap-2">
                        {(imagePreviewUrls.length ? imagePreviewUrls : listingForm.images || []).slice(0, 10).map((img, idx) => (
                          <div key={`${img}-${idx}`} className="relative">
                            <button type="button" onClick={() => setActivePreviewImage(img)} className={`overflow-hidden rounded-2xl border ${activePreviewImage === img ? "border-violet-500 ring-2 ring-violet-200" : "border-zinc-200"}`}>
                              <img src={img} alt={`Preview ${idx + 1}`} className="h-16 w-full object-cover" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx)}
                              className="absolute -right-2 -top-2 rounded-full bg-zinc-950 p-1 text-white shadow-lg"
                              aria-label={`Remove photo ${idx + 1}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="text-xs leading-5 text-zinc-500">Uploaded files preview immediately. You can add up to 10 photos. You can select multiple at once, or click Choose Files again to add more. You can remove any photo from the thumbnail strip. When connected to Supabase, uploaded files save into your public <code>listing-images</code> bucket. Local file previews use browser-safe data URLs for more reliable rendering.</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-zinc-200/70 bg-white shadow-sm">
                <CardContent className="p-5">
                  <div className="mb-3 text-lg font-semibold text-zinc-950">Live preview</div>
                  <div className="space-y-3 rounded-3xl bg-zinc-50 p-4 text-sm text-zinc-700">
                    <div className="font-medium text-zinc-950">{listingForm.title || "Your listing title"}</div>
                    <div>{listingForm.neighborhood}{listingForm.address ? ` • ${listingForm.address}` : ""}</div>
                    <div>{listingForm.spaceSummary || "Describe exactly what is available for sublet"}</div>
                    <div>{listingForm.unitType} • {listingForm.unitBedrooms || "?"} bd • {listingForm.unitBathrooms || "?"} ba</div>
                    <div>${listingForm.price || "0"} / month • {listingForm.term || "dates not set yet"}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => { setListingEditorOpen(false); resetListingEditor(); }} className="rounded-2xl border-zinc-300">Cancel</Button>
          <Button onClick={handleSaveListing} disabled={imageUploading} className="rounded-2xl bg-violet-600 text-white hover:bg-violet-700">{imageUploading ? "Compressing & uploading..." : editingListingId ? "Save changes" : "Publish listing"}</Button>
        </div>
      </Modal>

      <Modal open={messageComposerOpen} onClose={() => setMessageComposerOpen(false)} title={messageTarget ? `Message ${messageTarget.postedBy}` : "Message"} maxWidth="max-w-2xl">
        {messageTarget && (
          <div className="space-y-4">
            <div className="rounded-3xl bg-zinc-50 p-4 text-sm text-zinc-600">Regarding: <span className="font-medium text-zinc-900">{messageTarget.title}</span></div>
            <Textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Hey! I’m interested in your listing — is it still available?" className="min-h-[180px] rounded-2xl" />
            <div className="flex justify-end"><Button onClick={handleSendMessage} className="rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800">Send message</Button></div>
          </div>
        )}
      </Modal>

      <Modal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} title="Log in to SubletNYU" maxWidth="max-w-lg">
        <div className="space-y-4">
          <div className="rounded-3xl bg-violet-50 p-4 text-sm leading-6 text-violet-700">{configured ? "Create an account or sign in with your email and password. First name, last name, email, and password are required for sign up. If Supabase email confirmation is enabled, you will need to confirm your email before logging in." : "Demo mode works instantly. Connect Supabase in Setup when you’re ready for the real backend."}</div>
          <div className="flex gap-2 rounded-2xl bg-zinc-100 p-1">
            <button type="button" onClick={() => setAuthMode("login")} className={`flex-1 rounded-2xl px-4 py-2 text-sm font-medium ${authMode === "login" ? "bg-white shadow-sm text-zinc-950" : "text-zinc-500"}`}>Log in</button>
            <button type="button" onClick={() => setAuthMode("signup")} className={`flex-1 rounded-2xl px-4 py-2 text-sm font-medium ${authMode === "signup" ? "bg-white shadow-sm text-zinc-950" : "text-zinc-500"}`}>Create account</button>
          </div>
          {authMode === "signup" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div><div className="mb-2 text-sm font-medium text-zinc-700">First name</div><Input value={loginForm.firstName} onChange={(e) => setLoginForm({ ...loginForm, firstName: e.target.value })} placeholder="First" className="h-12 rounded-2xl" /></div>
              <div><div className="mb-2 text-sm font-medium text-zinc-700">Last name</div><Input value={loginForm.lastName} onChange={(e) => setLoginForm({ ...loginForm, lastName: e.target.value })} placeholder="Last" className="h-12 rounded-2xl" /></div>
            </div>
          )}
          <div><div className="mb-2 text-sm font-medium text-zinc-700">Email</div><Input value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} placeholder="name@nyu.edu" className="h-12 rounded-2xl" /></div>
          <div><div className="mb-2 text-sm font-medium text-zinc-700">Password</div><Input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="Password" className="h-12 rounded-2xl" /></div>
          <div className="space-y-3">
            {authLoading && <div className="text-sm text-zinc-500">Signing you in…</div>}
            <div className="flex justify-end"><Button onClick={handleLogin} disabled={authLoading} className="rounded-2xl bg-violet-600 text-white hover:bg-violet-700">{authLoading ? "Working..." : authMode === "signup" ? "Create account" : "Log in"}</Button></div>
          </div>
        </div>
      </Modal>

      <Modal open={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} title="Setup SubletNYU" maxWidth="max-w-3xl">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-3xl border-zinc-200/70"><CardContent className="p-5"><div className="mb-2 flex items-center gap-2 font-semibold text-zinc-950"><Database className="h-4 w-4" />Supabase connection</div><p className="mb-4 text-sm leading-6 text-zinc-600">Paste your project URL and publishable key here. They will be stored locally in your browser for testing.</p><div className="space-y-3"><Input value={settingsForm.url} onChange={(e) => setSettingsForm((prev) => ({ ...prev, url: e.target.value }))} placeholder="https://your-project.supabase.co" className="h-12 rounded-2xl" /><Input value={settingsForm.anonKey} onChange={(e) => setSettingsForm((prev) => ({ ...prev, anonKey: e.target.value }))} placeholder="your publishable key" className="h-12 rounded-2xl" /><div className="flex flex-wrap gap-3"><Button onClick={handleSaveSupabaseConfig} className="rounded-2xl bg-violet-600 text-white hover:bg-violet-700">Save connection</Button><Button variant="outline" onClick={handleDisconnectSupabase} className="rounded-2xl border-zinc-300">Use demo mode</Button></div></div></CardContent></Card>
            <Card className="rounded-3xl border-zinc-200/70"><CardContent className="p-5"><div className="mb-2 flex items-center gap-2 font-semibold text-zinc-950"><RefreshCw className="h-4 w-4" />Status</div><div className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600">{dbStatus}</div><div className="mt-4 text-sm leading-6 text-zinc-600">Mode: <span className="font-medium text-zinc-900">{configured ? "Live database" : "Demo"}</span></div><div className="mt-2 text-sm leading-6 text-zinc-600">Current user: <span className="font-medium text-zinc-900">{currentUser?.email || "Not signed in"}</span></div></CardContent></Card>
          </div>

          <Card className="rounded-3xl border-zinc-200/70"><CardContent className="p-5"><div className="mb-3 flex items-center gap-2 font-semibold text-zinc-950"><ExternalLink className="h-4 w-4" />Columns this upgraded build expects</div><div className="space-y-3 text-sm leading-6 text-zinc-600"><div><span className="font-medium text-zinc-900">listings</span>: id, created_at, title, neighborhood, address, price, unit_bedrooms, unit_bathrooms, term, campus_distance, unit_type, space_type, space_summary, verified, featured, image_url, description, posted_by, contact_email, owner_id</div><div><span className="font-medium text-zinc-900">saved_listings</span>: id, created_at, user_id, listing_id</div><div><span className="font-medium text-zinc-900">messages</span>: id, created_at, listing_id, listing_title, sender_id, recipient_id, sender_name, recipient_name, recipient_email, body</div><div><span className="font-medium text-zinc-900">storage bucket</span>: listing-images (public)</div><div><span className="font-medium text-zinc-900">auth</span>: email/password sign-in enabled</div></div></CardContent></Card>
        </div>
      </Modal>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="fixed bottom-6 right-6 z-[110] rounded-2xl bg-zinc-950 px-4 py-3 text-sm text-white shadow-2xl">{toast}</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
