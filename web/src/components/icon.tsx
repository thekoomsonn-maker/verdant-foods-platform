import {
  Activity, Apple, ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Banknote, Bell, BookOpen, Briefcase, Building2, Calendar, CalendarCheck, Camera,
  ChartColumn, ChartLine, ChartPie, Check, ChevronDown, ChevronLeft, ChevronRight, CircleAlert, CircleCheck, CircleHelp, CircleX, Clock, Coins,
  CreditCard, Crosshair, Download, Ellipsis, Eye, Facebook, FileCheck, FileText, Filter, Flag, FlaskConical, Gavel, Gift, GitMerge, Globe, Handshake,
  HandCoins, Heart, History, Hourglass, House, Image as ImageIcon, Info, Instagram, Key, Languages, Layers, LayoutDashboard, LayoutGrid, Leaf, LeafyGreen,
  Linkedin, List, ListFilter, Lock, LocateFixed, LogOut, Mail, Map, MapPin, Megaphone, Menu, MessageCircle, Minus, Navigation, Newspaper, Package,
  Pencil, Percent, Phone, PiggyBank, Play, Plus, Printer, QrCode, Receipt, RefreshCw, Repeat, Route, Satellite, Scale, ScanBarcode, ScanLine, Search,
  Settings, Share2, Shield, ShieldCheck, ShoppingBag, ShoppingBasket, Siren, SlidersHorizontal, Smartphone, Split, SprayCan, Sprout, Star, Store, Sun,
  Tag, Thermometer, ThermometerSnowflake, Timer, Tractor, Trash2, TrendingUp, TriangleAlert, Truck, Upload, User, UserCheck, UserPlus, Users, Wallet,
  Warehouse, Waypoints, WifiOff, X, Youtube, Zap, Carrot, Droplets, type LucideIcon,
} from "lucide-react";

const I: Record<string, LucideIcon> = {
  activity: Activity, apple: Apple, "arrow-left": ArrowLeft, "arrow-right": ArrowRight, "arrow-up-right": ArrowUpRight, "badge-check": BadgeCheck,
  banknote: Banknote, bell: Bell, "book-open": BookOpen, briefcase: Briefcase, "building-2": Building2, calendar: Calendar, "calendar-check": CalendarCheck,
  camera: Camera, "chart-column": ChartColumn, "chart-line": ChartLine, "chart-pie": ChartPie, check: Check, "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft, "chevron-right": ChevronRight, "circle-alert": CircleAlert, "circle-check": CircleCheck, "circle-help": CircleHelp,
  "circle-x": CircleX, clock: Clock, coins: Coins, "credit-card": CreditCard, crosshair: Crosshair, download: Download, ellipsis: Ellipsis, eye: Eye,
  facebook: Facebook, "file-check": FileCheck, "file-text": FileText, filter: Filter, flag: Flag, "flask-conical": FlaskConical, gavel: Gavel, gift: Gift,
  "git-merge": GitMerge, globe: Globe, handshake: Handshake, "hand-coins": HandCoins, heart: Heart, history: History, hourglass: Hourglass, house: House,
  image: ImageIcon, info: Info, instagram: Instagram, key: Key, languages: Languages, layers: Layers, "layout-dashboard": LayoutDashboard,
  "layout-grid": LayoutGrid, leaf: Leaf, "leafy-green": LeafyGreen, linkedin: Linkedin, list: List, "list-filter": ListFilter, lock: Lock,
  "locate-fixed": LocateFixed, "log-out": LogOut, mail: Mail, map: Map, "map-pin": MapPin, megaphone: Megaphone, menu: Menu, "message-circle": MessageCircle,
  minus: Minus, navigation: Navigation, newspaper: Newspaper, package: Package, pencil: Pencil, percent: Percent, phone: Phone, "piggy-bank": PiggyBank,
  play: Play, plus: Plus, printer: Printer, "qr-code": QrCode, receipt: Receipt, "refresh-cw": RefreshCw, repeat: Repeat, route: Route,
  satellite: Satellite, scale: Scale, "scan-barcode": ScanBarcode, "scan-line": ScanLine, search: Search, settings: Settings, "share-2": Share2,
  shield: Shield, "shield-check": ShieldCheck, "shopping-bag": ShoppingBag, "shopping-basket": ShoppingBasket, siren: Siren,
  "sliders-horizontal": SlidersHorizontal, smartphone: Smartphone, split: Split, "spray-can": SprayCan, sprout: Sprout, star: Star, store: Store, sun: Sun,
  tag: Tag, thermometer: Thermometer, "thermometer-snowflake": ThermometerSnowflake, timer: Timer, tractor: Tractor, "trash-2": Trash2,
  "trending-up": TrendingUp, "triangle-alert": TriangleAlert, truck: Truck, upload: Upload, user: User, "user-check": UserCheck, "user-plus": UserPlus,
  users: Users, wallet: Wallet, warehouse: Warehouse, waypoints: Waypoints, "wifi-off": WifiOff, x: X, youtube: Youtube, zap: Zap, carrot: Carrot,
  droplets: Droplets,
};

export type IconName = keyof typeof I | (string & {});
export function Icon({ name, size = 20, className, strokeWidth = 1.75 }: { name: IconName; size?: number; className?: string; strokeWidth?: number }) {
  const C = I[name] ?? CircleHelp;
  return <C size={size} strokeWidth={strokeWidth} className={className} aria-hidden />;
}
