/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, RefreshCw, Printer, Play, X, Heart, ShoppingBag, Sun, Moon } from 'lucide-react';
import productsData from '../metadata.json';

// Interfaces
interface Product {
  articleNumber: string;
  description: string;
  mainGroup: string;
  subGroup?: string;
  locationCode?: string;
  location: string;
}

interface LocationInfo {
  pad: string;
  side: 'Links' | 'Rechts' | 'Both';
  section: string;
}

interface MapTarget {
  pad: string;
  sec: string | null;
  side: 'Links' | 'Rechts' | 'Both';
  subTarget?: string | null;
}

// Utility maps and icons
const icons: Record<string, string> = {
  "Gereedschap": "🛠️", "Hout": "🪵", "IJzerwaren": "🔩", "Sanitair": "🚽", "Algemeen": "🏷️",
  "Elektra": "🔌", "Verf": "🎨", "Verwarming": "🌡️", "Bouwstoffen": "🧱",
  "Eigen gebruik": "🏢", "Lokaal": "📍", "Verlichting": "💡", "Hang- en sluitwerk": "🔐",
  "Verwarming en klimaat": "🌡️", "Emballage": "📦", "Persoonlijke beschermings": "🦺",
  "Schoonmaak bedrijfswagen": "🧽", "Schoonmaak, bedrijfswagen": "🧽", "Keukens": "🍳", "Lijm, kit en pur": "🧴",
  "Bevestigingsmateriaal": "🔩", "Bouwmaterials": "🧱", "Deuren / Kozijnen": "🚪", "Kleding / schoenen": "🥾",
  "Hout / gipsplaten": "🪵", "Plinten": "🪵", "Verf benodigdheden / attributen": "🖌️", "Kleding": "🥾", "Elektra / PVC": "🔌"
};

const aisleCategories: Record<string, string> = {
  "1": "Hout", "2": "Plinten", "3": "Hout", "4": "Deuren Kozijnen", "5": "IJzerwaren", 
  "6": "Schroeven", "7": "Kit, pur lijm", "8": "Verf benodigdheden", 
  "9": "Verf", "10": "Verf", "11": "Gereedschap", "12": "Gereedschap", 
  "13": "Kleding Schoenen", "14": "Sanitair", "15": "Sanitair", 
  "16": "Elektra", "17": "Elektra PVC"
};

const backAisleLabels: Record<string, string> = {
  "1": "Hout", "2": "Tuinhout", "3": "Vuren ruw geschaafd", "4": "Vuren ruw geschaafd", "5": "Hout",
  "6": "Plaatmateriaal hout", "7": "Hout", "8": "Plaatmateriaal hout", "9": "Ventilatie", "10": "Steigers Bekisting",
  "11": "Pleisters Stuc", "12": "Cement Mortels", "13": "Stenen Blokken", "14": "Tegels Voegmiddelen", 
  "15": "Dakbedekking", "16": "Verwarming Isolatie", "17": "Keukenattributen Isolatie"
};

const i18nData: Record<string, any> = {
  nl: { 
    introSlogan: "Alles voor de vakman",
    introNav: "Smart Navigator",
    introP: "Vind direct jouw producten in de vestiging. Geen gezoek, meteen aan de slag!",
    introBtn: "START ZOEKEN",
    placeholder: "Zoek artikel of code...", search: "ZOEKEN", reset: "RESET", 
    allCats: "Alle categorieën",
    resFoundPlural: "RESULTATEN", resFoundSingular: "RESULTAAT", noResTitle: "Geen resultaten voor", 
    noResDesc: "Controleer je spelling.", clearBtn: "WIS", printBtn: "PRINT BON", 
    askHelp: "VRAAG OM HULP", helpRequested: "HULP IS ONDERWEG!",
    entrance: "INGANG", left: "LINKS", leftWord: "Links", right: "RECHTS", rightWord: "Rechts", sect: "Sectie", pad: "PAD", padWord: "Pad", zijde: "ZIJDE", kassa: "KASSA",
    serviceDesk: "Service desk", salesDesk: "Verkoopdesk", coffeeCorner: "Koffiehoek", paintDesk: "Verfbalie",
    exit: "UITGANG", sawmill: "Zaagafdeling",
    expandMap: "KAART VERGROTEN",
    backWallShort: "ACHTERWAND", backWallLong: "Achterwand",
    location: "LOCATIE:", art: "Art.", loc: "LOC", unknownLoc: "Onbekende locatie",
    youAreHere: "U bent hier",
    emptyList: "Uw winkelwagen is leeg",
    routeButton: "BEREKEN ROUTE",
    cartTitle: "WINKELWAGEN"
  },
  en: { 
    introSlogan: "Everything for the professional",
    introNav: "Smart Navigator",
    introP: "Find your products instantly in the store. No searching, just building!",
    introBtn: "START SEARCHING",
    placeholder: "Search item or code...", search: "SEARCH", reset: "RESET", 
    allCats: "All categories",
    resFoundPlural: "RESULTS", resFoundSingular: "RESULT", noResTitle: "No results for", 
    noResDesc: "Check your spelling.", clearBtn: "CLEAR", printBtn: "PRINT TICKET", 
    askHelp: "ASK FOR HELP", helpRequested: "HELP IS ON THE WAY!",
    entrance: "ENTRANCE", left: "LEFT", leftWord: "Left", right: "RIGHT", rightWord: "Right", sect: "Section", pad: "AISLE", padWord: "Aisle", zijde: "SIDE", kassa: "CASHIER",
    serviceDesk: "Service Desk", salesDesk: "Sales Desk", coffeeCorner: "Coffee Corner", paintDesk: "Paint Desk",
    exit: "EXIT", sawmill: "Sawmill",
    expandMap: "EXPAND MAP",
    backWallShort: "BACK WALL", backWallLong: "Back wall",
    location: "LOCATION:", art: "Art.", loc: "LOC", unknownLoc: "Unknown location",
    youAreHere: "You are here",
    emptyList: "Your shopping bag is empty",
    routeButton: "CALCULATE ROUTE",
    cartTitle: "SHOPPING BAG"
  },
  uk: { 
    introSlogan: "Все для професіоналів",
    introNav: "Розумний навігатор",
    introP: "Миттєво знаходьте потрібні товари у магазині. Без пошуків, одразу до справи!",
    introBtn: "ПОЧАТИ ПОШУК",
    placeholder: "Пошук товару або коду...", search: "ПОШУК", reset: "СКИДАННЯ", 
    allCats: "Всі категорії",
    resFoundPlural: "РЕЗУЛЬТАТІВ", resFoundSingular: "РЕЗУЛЬТАТ", noResTitle: "Немає результатів для", 
    noResDesc: "Перевірте правильність написання.", clearBtn: "ОЧИСТИТИ", printBtn: "ДРУКУВАТИ ЧЕК", 
    askHelp: "ПОПРОСИТИ ПРО ДОПОМОГУ", helpRequested: "ДОПОМОГА ВЖЕ В ДОРОЗІ!",
    entrance: "ВХІД", left: "ЛІВОРУЧ", leftWord: "Ліворуч", right: "ПРАВОРУЧ", rightWord: "Праворуч", sect: "Секція", pad: "РЯД", padWord: "Ряд", zijde: "СТОРОНА", kassa: "КАСА",
    serviceDesk: "Сервісний центр", salesDesk: "Відділ продажу", coffeeCorner: "Кавовий куточок", paintDesk: "Відділ фарб",
    exit: "ВИХІД", sawmill: "Пилорама",
    expandMap: "РОЗГОРНУТИ КАРТУ",
    backWallShort: "ЗАДНЯ СТІНА", backWallLong: "Задня стіна",
    location: "РОЗТАШУВАННЯ:", art: "Арт.", loc: "МІСЦЕ", unknownLoc: "Невідоме розташування",
    youAreHere: "Ви тут",
    emptyList: "Ваш список порожній",
    routeButton: "ПОБУДУВАТИ МАРШРУТ",
    cartTitle: "КОШИК"
  },
  pl: { 
    introSlogan: "Wszystko dla profesjonalisty",
    introNav: "Inteligentny Nawigator",
    introP: "Znajdź swoje produkty natychmiast w sklepie. Bez szukania, od razu do pracy!",
    introBtn: "ROZPOCZNIJ WYSZUKIWANIE",
    placeholder: "Szukaj artykułu lub kodu...", search: "SZUKAJ", reset: "RESET", 
    allCats: "Wszystkie kategorie",
    resFoundPlural: "WYNIKI", resFoundSingular: "WYNIK", noResTitle: "Brak wyników dla", 
    noResDesc: "Sprawdź pisownię.", clearBtn: "WYCZYŚĆ", printBtn: "DRUKUJ BILET", 
    askHelp: "POPROŚ O POMOC", helpRequested: "POMOC JEST W DRODZE!",
    entrance: "WEJŚCIE", left: "LEWA", leftWord: "Lewa", right: "PRAWA", rightWord: "Prawa", sect: "Sekcja", pad: "ALEJA", padWord: "Aleja", zijde: "STRONA", kassa: "KASA",
    serviceDesk: "Punkt obsługi", salesDesk: "Punkt sprzedaży", coffeeCorner: "Kącik kawowy", paintDesk: "Dział farb",
    exit: "WYJŚCIE", sawmill: "Piła",
    expandMap: "POWIĘKSZ MAPĘ",
    backWallShort: "TYLNA ŚCIANA", backWallLong: "Tylna ściana",
    location: "LOKALIZACJA:", art: "Art.", loc: "LOK", unknownLoc: "Nieznana lokalizacja",
    youAreHere: "Jesteś tutaj",
    emptyList: "Twoja koszyk zakupowy jest pusty",
    routeButton: "WYZNACZ TRASĘ",
    cartTitle: "KOSZYK"
  }
};

const getImageUrl = (sku: string) => `https://cdn.bouwmaat.nl/api/images/${sku}.webp`;

export default function App() {
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [curLang, setCurLang] = useState<string>(() => localStorage.getItem('bouwmaat_lang') || 'nl');
  const [isIntroLangMenuOpen, setIsIntroLangMenuOpen] = useState<boolean>(false);
  const [isAppLangMenuOpen, setIsAppLangMenuOpen] = useState<boolean>(false);
  const [isLanguageUserControlled, setIsLanguageUserControlled] = useState<boolean>(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Isometric Custom Interactive Map states
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);
  const [activeMapTarget, setActiveMapTarget] = useState<MapTarget | null>(null);
  const [helperSentSkus, setHelperSentSkus] = useState<Set<string>>(new Set());
  const [activeAisleExplorer, setActiveAisleExplorer] = useState<string | null>(null);
  const [selectedAisleFilter, setSelectedAisleFilter] = useState<string | null>(null);
  const [aisleSearchQuery, setAisleSearchQuery] = useState<string>('');

  // 3D Avatar coordinates and navigation path
  const [charLeft, setCharLeft] = useState<number>(323);
  const [charBottom, setCharBottom] = useState<string>('6px');
  const [charDir, setCharDir] = useState<number>(1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isInteracting, setIsInteracting] = useState<boolean>(true);
  const [svgPath, setSvgPath] = useState<string>('');

  // Walkways alignment calculations
  const [entranceX, setEntranceX] = useState<number>(270);
  const [kioskX, setKioskX] = useState<number>(315);
  const [exitX, setExitX] = useState<number>(720);

  // Multi-stop shopping list cart panel
  const [shoppingCart, setShoppingCart] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isMultiRouteActive, setIsMultiRouteActive] = useState<boolean>(false);

  const mapGridRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Dictionary lookup for autocomplete suggestions
  const [dictionary, setDictionary] = useState<string[]>([]);
  const [ghostText, setGhostText] = useState<string>('');

  const handleImgFallback = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!img.dataset.triedJpg) {
      img.dataset.triedJpg = 'true';
      const sku = img.dataset.sku;
      img.src = `https://images.bouwmaat.nl/images/${sku}_1.jpg?width=200&height=200&mode=pad`;
    } else if (!img.dataset.triedBackup) {
      img.dataset.triedBackup = 'true';
      img.src = 'https://picsum.photos/seed/tools/200/200';
    }
  };

  // 1. Setup loading indicators & map coordinates
  useEffect(() => {
    const mappedProducts: Product[] = (productsData as any[]).map((item: any) => ({
      articleNumber: item["ArtikelNr."] || item.artNr || '',
      description: item["Artikel omsch."] || item.name || '',
      mainGroup: item["Hoofdgroep"] || item.hg || 'Algemeen',
      subGroup: item["Subgroep"] || item.sg || '',
      locationCode: item["Schaplocatie code"] || '',
      location: item["Locatie2"] || item.loc || 'Onbekend',
    }));
    setProducts(mappedProducts);

    // Build autocomplete dictionary
    const dict = new Set<string>();
    mappedProducts.forEach(item => {
      const words = (item.description || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, '').split(/\s+/);
      words.forEach(w => {
        if (w.length >= 3) dict.add(w);
      });
    });
    setDictionary(Array.from(dict));
  }, []);

  // Sync darkmode on document body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // Close language dropdowns on document level click
  useEffect(() => {
    const handleOutsideClick = () => {
      setIsIntroLangMenuOpen(false);
      setIsAppLangMenuOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Loading bar duration simulator (no auto-hide)
  useEffect(() => {
    if (showIntro) {
      setProgress(100);
    }
  }, [showIntro]);

  // Language auto-cycle carousel when intro is open
  useEffect(() => {
    if (!showIntro || isLanguageUserControlled) return;
    const cycleLangs = ['nl', 'en', 'uk', 'pl'];
    const interval = setInterval(() => {
      setCurLang(prev => {
        const nextIdx = (cycleLangs.indexOf(prev) + 1) % cycleLangs.length;
        return cycleLangs[nextIdx];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [showIntro, isLanguageUserControlled]);

  // Recalculate entrance alignment & character positions on window resize or render
  const recalculatePositions = () => {
    const grid = mapGridRef.current;
    if (!grid) return;

    const aisle5 = document.getElementById('p-5');
    const aisle6 = document.getElementById('p-6');
    let computedEntX = grid.offsetWidth * 0.28;

    if (aisle5 && aisle6 && aisle5.offsetLeft > 0) {
      computedEntX = aisle5.offsetLeft + aisle5.offsetWidth + (aisle6.offsetLeft - (aisle5.offsetLeft + aisle5.offsetWidth)) / 2;
    } else {
      const p9 = document.getElementById('p-9');
      if (p9 && p9.offsetLeft > 0) {
        computedEntX = p9.offsetLeft - 15;
      }
    }

    const entVal = computedEntX + 20;
    setEntranceX(entVal);
    setKioskX(entVal + 45);
    setExitX(grid.offsetWidth * 0.82);
  };

  useEffect(() => {
    recalculatePositions();
    window.addEventListener('resize', recalculatePositions);
    const gridTimer = setTimeout(recalculatePositions, 350);
    return () => {
      window.removeEventListener('resize', recalculatePositions);
      clearTimeout(gridTimer);
    };
  }, [isMapExpanded, showIntro]);

  // 2. Map coordinates solver to locate exactly where character walks in warehouse
  const getMapTarget = (pad: string, side: string | undefined): { rackPad: string; isRightOfRack: boolean; rackSideClass: string } => {
    let rackPad = pad;
    let rackSideClass = 'active-side-both';
    let isRightOfRack = false; 

    if (isNaN(parseInt(pad, 10)) && pad !== '1L') {
      return { rackPad, isRightOfRack, rackSideClass };
    }

    const padNum = parseInt(pad, 10);
    const isLeft = side && side.toLowerCase().includes('link');
    const isRight = side && side.toLowerCase().includes('recht');

    if (isLeft) {
      rackPad = padNum === 1 ? '1L' : (padNum - 1).toString();
      rackSideClass = 'active-side-right'; 
      isRightOfRack = true; 
    } else if (isRight) {
      rackPad = padNum.toString();
      rackSideClass = 'active-side-left'; 
      isRightOfRack = false; 
    } else {
      rackPad = padNum.toString();
      rackSideClass = 'active-side-both';
      isRightOfRack = false; 
    }
    
    return { rackPad, isRightOfRack, rackSideClass };
  };

  // 3. Move character walking paths & draw animated SVG guide Line
  const moveCharacterWalk = (target: MapTarget | null) => {
    const sPos = kioskX - 12;
    const grid = mapGridRef.current;
    if (!grid) return;

    if (!target || target.pad === 'entrance') {
      setCharLeft(sPos);
      setCharBottom('6px');
      setCharDir(1);
      setIsRunning(false);
      setIsInteracting(true);
      setSvgPath('');
      return;
    }

    setIsInteracting(false);

    let finalLeft = sPos;
    let targetBottomVal = '0%';
    let depthPercent = 75;

    const { pad, sec, side, subTarget } = target;

    if (sec) {
      const s = parseInt(sec, 10);
      if (!isNaN(s)) {
        const isFullAisle = pad === '1L' || pad === '17';
        if (isFullAisle) {
          depthPercent = 10 + ((s - 1) / 16) * 75;
        } else {
          if (s <= 6) {
            depthPercent = 10 + ((s - 1) / 5) * 25;
          } else {
            depthPercent = 55 + ((s - 7) / 10) * 30;
          }
        }
      }
    }

    if (pad === '9' && subTarget === 'paint') {
      const p9 = document.getElementById('p-9');
      if (p9) {
        finalLeft = p9.offsetLeft - (p9.offsetWidth * 0.15) - 8;
        targetBottomVal = '1%';
      }
    } else if (pad === 'KAS') {
      const kasEl = document.getElementById('cashierZone');
      const targetDesk = subTarget ? document.getElementById('desk-' + subTarget) : null;
      if (kasEl && targetDesk) {
        finalLeft = kasEl.offsetLeft + targetDesk.offsetLeft - 8;
      } else if (kasEl) {
        finalLeft = kasEl.offsetLeft - 8;
      }
      targetBottomVal = '1%';
    } else if (pad === 'SAW') {
      const sawEl = document.getElementById('sawmillZone');
      finalLeft = sawEl ? sawEl.offsetLeft - 10 : 600;
      targetBottomVal = '1%';
    } else if (pad === 'UITGANG') {
      finalLeft = exitX;
      targetBottomVal = '0%';
    } else if (pad === 'KOFFIE') {
      const cofEl = document.getElementById('coffeeCorner');
      finalLeft = cofEl ? cofEl.offsetLeft - 8 : 800;
      targetBottomVal = '1%';
    } else if (pad === '0AW') {
      finalLeft = sPos;
      targetBottomVal = '90%';
      if (sec && !isNaN(parseInt(sec, 10))) {
        const sVal = parseInt(sec, 10);
        finalLeft = 40 + ((sVal - 1) / 16) * (grid.offsetWidth - 80);
      }
    } else if (!isNaN(parseInt(pad, 10)) || pad === '1L') {
      const { rackPad, isRightOfRack } = getMapTarget(pad, side);
      const t = document.getElementById(`p-${rackPad}`);
      if (t) {
        const gapOffset = isMapExpanded ? 12 : 9;
        finalLeft = isRightOfRack ? t.offsetLeft + t.offsetWidth + gapOffset : t.offsetLeft - gapOffset;
        targetBottomVal = `${depthPercent}%`;
      }
    }

    const floorHeight = grid.offsetHeight;
    const startY = floorHeight - 6;
    const midY = floorHeight - (8 / 100 * floorHeight);
    const endY = floorHeight - (parseFloat(targetBottomVal) / 100 * floorHeight);

    // Build the 3D drawing path string
    const dString = `M ${sPos},${startY} L ${sPos},${midY} L ${finalLeft},${midY} L ${finalLeft},${endY}`;
    setSvgPath(dString);

    // Timeline durations simulating coordinates bob animations
    const d1 = Math.abs(startY - midY);
    const d2 = Math.abs(finalLeft - sPos);
    const d3 = Math.abs(midY - endY);
    const totalDist = d1 + d2 + d3 || 1;
    const totalTime = 1200;

    const t1 = (d1 / totalDist) * totalTime;
    const t2 = (d2 / totalDist) * totalTime;
    const t3 = (d3 / totalDist) * totalTime;

    setIsRunning(true);
    setCharBottom(`${floorHeight - midY}px`);

    setTimeout(() => {
      if (finalLeft !== sPos) {
        setCharDir(finalLeft < sPos ? -1 : 1);
      }
      setCharLeft(finalLeft);

      setTimeout(() => {
        setCharDir(1);
        setCharBottom(`${floorHeight - endY}px`);

        setTimeout(() => {
          setIsRunning(false);
          if (pad !== 'KAS' && pad !== 'KOFFIE' && pad !== 'SAW' && pad !== 'UITGANG' && pad !== '0AW') {
            if (pad === '9' && subTarget === 'paint') {
              setCharDir(1);
            } else {
              const { isRightOfRack } = getMapTarget(pad, side);
              setCharDir(isRightOfRack ? -1 : 1);
            }
          }
        }, t3);
      }, t2);
    }, t1);
  };

  // Sync navigation on targets changes
  useEffect(() => {
    if (!showIntro) {
      moveCharacterWalk(activeMapTarget);
    }
  }, [activeMapTarget, isMapExpanded, kioskX, showIntro]);

  // Autocomplete suggestions and ghost text matching
  const solveGhostText = (query: string) => {
    if (!query || query !== query.trimStart()) {
      setGhostText('');
      return;
    }
    const tokens = query.toLowerCase().split(/\s+/);
    const lastToken = tokens[tokens.length - 1];
    const normalizedLast = lastToken.replace(/[^a-z0-9]/g, '');

    if (normalizedLast.length >= 1) {
      const match = dictionary.find(w => w.startsWith(normalizedLast));
      if (match) {
        const suffix = match.substring(normalizedLast.length);
        setGhostText(query + suffix);
        return;
      }
    }
    setGhostText('');
  };

  // Simulated live debounce when entering search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    solveGhostText(val);

    if (val.trim()) {
      setIsFetching(true);
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsFetching(false);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
      setIsFetching(false);
    }
  };

  const handleSearchKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setSearchQuery('');
      setGhostText('');
      setSelectedProduct(null);
      setIsSearching(false);
      closeExplorer();
    }
    if ((e.key === 'Tab' || e.key === 'ArrowRight') && ghostText) {
      e.preventDefault();
      setSearchQuery(ghostText);
      solveGhostText(ghostText);
    }
  };

  // Filter products by matched groups and description keywords
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim() && currentCategory === 'all' && !selectedAisleFilter) return [];
    
    let matched = products;
    if (currentCategory !== 'all') {
      matched = matched.filter(p => p.mainGroup === currentCategory);
    }

    if (selectedAisleFilter) {
      const padStr = selectedAisleFilter.toUpperCase();
      matched = matched.filter(item => {
        const loc2 = item.location.toUpperCase();
        let itemPad = '';
        const match = loc2.match(/PAD\s*0*(\d+)/i) || loc2.match(/^0*(\d+)[LR]-/i);
        if (match) itemPad = parseInt(match[1], 10).toString();
        else if (loc2.includes('1L')) itemPad = '1L';
        else if (loc2.includes('0AW') || loc2.includes('0A')) itemPad = '0AW';
        return itemPad === padStr;
      });
    }

    if (!searchQuery.trim()) return matched;

    const lowerQuery = searchQuery.toLowerCase();
    const queryParts = lowerQuery.split(/\s+/).filter(Boolean);
    
    return matched
      .filter((p) => {
        const desc = p.description.toLowerCase();
        const sku = p.articleNumber.toLowerCase();
        const sub = (p.subGroup || "").toLowerCase();
        const code = (p.locationCode || "").toLowerCase();
        
        return queryParts.every(part => 
          desc.includes(part) || 
          sku.includes(part) || 
          sub.includes(part) || 
          code.includes(part)
        );
      })
      .map(p => {
        let score = 0;
        const desc = p.description.toLowerCase();
        const sku = p.articleNumber.toLowerCase();
        
        for (const part of queryParts) {
          if (sku === part) score += 100;
          else if (sku.includes(part)) score += 50;
          if (desc.startsWith(part)) score += 40;
          else if (desc.includes(part)) score += 20;
          if (p.subGroup?.toLowerCase().includes(part)) score += 5;
          if (p.locationCode?.toLowerCase().includes(part)) score += 5;
        }
        return { p, score };
      })
      .sort((a, b) => b.score - a.score)
      .map(item => item.p);
  }, [searchQuery, products, currentCategory, selectedAisleFilter]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, 50);
  }, [filteredProducts]);

  // Product location code mapper to find target coordinates
  const parseLocationStr = (loc: string): LocationInfo => {
    const padMatch = loc.match(/Pad\s+([A-Za-z0-9]+)/i);
    const side = loc.includes('Rechts') ? 'Rechts' : (loc.includes('Links') ? 'Links' : 'Both');
    const sectionMatch = loc.match(/Sectie\s+(\d+)/i);

    let pad = '0AW';
    if (padMatch) {
      pad = padMatch[1].toUpperCase();
    }
    return {
      pad: pad,
      side: side as 'Links' | 'Rechts' | 'Both',
      section: sectionMatch ? sectionMatch[1] : '1',
    };
  };

  const getSubTarget = (loc: string): string => {
    const locU = loc.toUpperCase();
    if (locU.includes('SERVICE') || locU.includes('BALIE')) return 'service';
    if (locU.includes('VERKOOP')) return 'sales1';
    if (locU.includes('KAS')) return 'kassa';
    if (locU.includes('ZAAG')) return 'sawmill';
    if (locU.includes('KOF')) return 'coffee';
    if (locU.includes('VERF') || locU.includes('VM')) return 'paint';
    return '';
  };

  // Print voucher ticket layout
  const triggerPrintTicket = (product: Product) => {
    const loc = parseLocationStr(product.location);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <body style="text-align:center;padding:30px;border:8px solid #005cb9;font-family:sans-serif;">
            <h2 style="color:#005cb9">BOUWMAAT AMSTEL XL</h2><hr style="border:1px solid #cbd5e1">
            <h2 style="margin:20px 0;">${product.description}</h2>
            <h1 style="font-size:4rem; margin:10px 0; color:#005cb9;">PAD ${loc.pad}</h1>
            <h2>${loc.side === 'Both' ? 'Centrum' : loc.side} - Sectie ${loc.section}</h2>
            <p style="color:#64748b; font-weight: bold; margin-top:30px;">Artikel Nr: ${product.articleNumber}</p>
            <script>window.print();window.close();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Staff help webhook alert simulator
  const requestAssistence = (product: Product) => {
    setHelperSentSkus(prev => {
      const next = new Set(prev);
      next.add(product.articleNumber);
      return next;
    });
    console.log(`[STAFF ALERT WEBHOOK]: Guest requested assistence finding "${product.description}" at Pad ${parseLocationStr(product.location).pad}, Sectie ${parseLocationStr(product.location).section}. Dispatching expert...`);
  };

  // Aisle Explorer resolver
  const getAisleProducts = (aisle: string): Product[] => {
    const padStr = aisle.toUpperCase();
    return products.filter(item => {
      const loc2 = item.location.toUpperCase();
      let itemPad = '';
      const match = loc2.match(/PAD\s*0*(\d+)/i) || loc2.match(/^0*(\d+)[LR]-/i);
      if (match) itemPad = parseInt(match[1], 10).toString();
      else if (loc2.includes('1L')) itemPad = '1L';
      else if (loc2.includes('0AW') || loc2.includes('0A')) itemPad = '0AW';
      return itemPad === padStr;
    }).sort((a,b) => a.description.localeCompare(b.description)).slice(0, 15);
  };

  // Toggling products inside visual shopping list
  const toggleCartItem = (p: Product) => {
    setShoppingCart(prev => {
      const isAdded = prev.find(item => item.articleNumber === p.articleNumber);
      if (isAdded) {
        return prev.filter(item => item.articleNumber !== p.articleNumber);
      } else {
        return [...prev, p];
      }
    });
  };

  // Multi-stop route calculation
  const calculateOptimizedPath = () => {
    if (shoppingCart.length === 0) return;
    setIsCartOpen(false);
    setIsMapExpanded(true);
    setIsMultiRouteActive(true);

    // Solve route sequence based on physical coordinates of racks on floor
    const stopsOrder = shoppingCart.map(item => {
      const loc = parseLocationStr(item.location);
      const isL = loc.side === 'Links';
      let score = 99;
      if (loc.pad === '1L') score = 0;
      else if (!isNaN(parseInt(loc.pad, 10))) score = parseInt(loc.pad, 10);
      else if (loc.pad === '0AW') score = 20;
      else if (loc.pad === 'SAW') score = 21;
      else if (loc.pad === 'KOFFIE') score = 22;
      else if (loc.pad === 'KAS') score = 23;
      return { item, pad: loc.pad, sec: loc.section, isL, score };
    });

    stopsOrder.sort((a,b) => a.score - b.score);

    // Build the SVG trace coords
    const grid = mapGridRef.current;
    if (!grid) return;
    const fh = grid.offsetHeight;
    const sPos = kioskX - 12;
    const sY = fh - 6;
    const mY = fh - (8/100*fh);
    let traceString = `M ${sPos},${sY} L ${sPos},${mY}`;

    stopsOrder.forEach(stop => {
      let cx = sPos;
      let targetB = '0%';
      const { pad, sec, isL } = stop;

      if (pad === '0AW') {
        const sVal = parseInt(sec, 10);
        cx = 40 + ((sVal - 1) / 16) * (grid.offsetWidth - 80);
        targetB = '90%';
      } else if (pad === 'KAS') {
        const kE = document.getElementById('cashierZone');
        cx = kE ? kE.offsetLeft - 8 : 400;
        targetB = '1%';
      } else if (pad === 'SAW') {
        const sE = document.getElementById('sawmillZone');
        cx = sE ? sE.offsetLeft - 8 : 600;
        targetB = '1%';
      } else if (pad === 'KOFFIE') {
        const cE = document.getElementById('coffeeCorner');
        cx = cE ? cE.offsetLeft - 8 : 800;
        targetB = '1%';
      } else if (!isNaN(parseInt(pad, 10)) || pad === '1L') {
        const { rackPad } = getMapTarget(pad, isL ? 'Links' : 'Rechts');
        const tEl = document.getElementById(`p-${rackPad}`);
        if (tEl) {
          const gap = 12;
          cx = isL ? tEl.offsetLeft + tEl.offsetWidth + gap : tEl.offsetLeft - gap;
          const s = parseInt(sec, 10);
          const percent = (pad === '1L' || pad === '17') ? (10+((s-1)/16)*75) : (s<=6 ? (10+((s-1)/5)*25) : (55+((s-7)/10)*30));
          targetB = percent + '%';
        }
      }

      const eY = fh - (parseFloat(targetB) / 100 * fh);
      traceString += ` L ${cx},${mY} L ${cx},${eY} L ${cx},${mY}`;
    });

    // Terminate exactly at exit door
    const exX = exitX;
    traceString += ` L ${exX},${mY} L ${exX},${sY}`;

    setSvgPath(traceString);
    setCharLeft(exX);
    setCharBottom('6px');
    setCharDir(1);
    setIsRunning(false);

    // Visually toggle active states of stops target
    stopsOrder.forEach(stop => {
      const { pad } = stop;
      if (pad !== '0AW' && isNaN(parseInt(pad, 10)) && pad !== '1L') {
        const spCell = document.getElementById(pad === 'KAS' ? 'cashierZone' : (pad === 'KOFFIE' ? 'coffeeCorner' : 'sawmillZone'));
        if (spCell) spCell.classList.add('active');
      } else {
        const { rackPad, rackSideClass } = getMapTarget(pad, stop.isL ? 'Links' : 'Rechts');
        const rEl = document.getElementById(`p-${rackPad}`);
        if (rEl) rEl.classList.add('active', rackSideClass);
        const bad = document.getElementById(`p-${pad}`);
        if (bad) bad.classList.add('active-num');
      }
    });
  };

  // Close explorer and multiroute active representations
  const closeExplorer = () => {
    setActiveAisleExplorer(null);
    setAisleSearchQuery('');
  };

  const resetAllFilters = () => {
    setSelectedProduct(null);
    setActiveMapTarget(null);
    setSearchQuery('');
    setGhostText('');
    setCurrentCategory('all');
    setSelectedAisleFilter(null);
    setIsSearching(false);
    setIsMultiRouteActive(false);
    closeExplorer();
    recalculatePositions();
  };

  const handleItemSelect = (product: Product) => {
    setSelectedProduct(product);
    setIsSearching(false);
    setIsMapExpanded(true); // Auto-expand map exactly like the reference HTML
    closeExplorer();

    const loc = parseLocationStr(product.location);
    const subTarget = getSubTarget(product.location);
    setActiveMapTarget({
      pad: loc.pad,
      sec: loc.section,
      side: loc.side === 'Both' ? 'Both' : loc.side,
      subTarget
    });
  };

  const t = i18nData[curLang] || i18nData['nl'];

  // Categories definition
  const allCategories = [
    "Bouwmaterialen", "Hout", "Gereedschap", "Bevestigingsmateriaal", "Verf", 
    "Sanitair", "Elektra", "Verwarming en klimaat", "Lijm, kit en pur",
    "Verlichting", "Hang- en sluitwerk", 
    "Keukens", "Persoonlijke beschermings", "Eigen gebruik"
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark-mode bg-slate-950' : 'bg-slate-50'} text-[#0f172a] font-sans overflow-hidden transition-all duration-300`}>
      
      {/* GLOWY INTRO SCREEN */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            onClick={() => setShowIntro(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 overflow-hidden cursor-pointer"
          >
            <div className="intro-mesh" />
            <div className="intro-bg-animated">
              <div className="intro-grid" />
              <div className="light-beam" />
              <div className="light-beam beam-2" />
              <div className="light-beam beam-3" />
              <div className="particles">
                <i style={{ left: '10%' }}></i>
                <i style={{ left: '25%' }}></i>
                <i style={{ left: '40%' }}></i>
                <i style={{ left: '55%' }}></i>
                <i style={{ left: '70%' }}></i>
              </div>
            </div>

            <div className="intro-lang-dropdown" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsIntroLangMenuOpen(prev => !prev);
                  setIsLanguageUserControlled(true);
                }}
                className="lang-toggle hover:scale-105 transition-all text-[0.8rem] px-4 py-2 rounded-full shadow-md"
              >
                {curLang === 'nl' && '🇳🇱 NL'}
                {curLang === 'en' && '🇬🇧 EN'}
                {curLang === 'uk' && '🇺🇦 UA'}
                {curLang === 'pl' && '🇵🇱 PL'}
                <span className="ml-1 text-[10px]">▼</span>
              </button>
              
              <AnimatePresence>
                {isIntroLangMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    className="lang-menu shadow-xl"
                  >
                    {['nl', 'en', 'uk', 'pl'].map(lng => (
                      <button
                        key={lng}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurLang(lng);
                          localStorage.setItem('bouwmaat_lang', lng);
                          setIsIntroLangMenuOpen(false);
                        }}
                        className={`lang-item ${curLang === lng ? 'active' : ''}`}
                      >
                        {lng === 'nl' && '🇳🇱 NL'}
                        {lng === 'en' && '🇬🇧 EN'}
                        {lng === 'uk' && '🇺🇦 UA'}
                        {lng === 'pl' && '🇵🇱 PL'}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="intro-card flex flex-col items-center justify-center text-center p-12 max-w-2xl cursor-default"
            >
              <div className="intro-badge">{t.introNav}</div>
              <h1 className="intro-title text-4xl sm:text-6xl font-black mb-4 tracking-tight">
                BOUWMAAT AMSTEL <span className="bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-fill-transparent text-transparent">XL</span>
              </h1>
              <div className="animated-slogan text-lg font-black mb-6 uppercase tracking-wider">{t.introSlogan}</div>
              <p className="intro-subtitle text-slate-500 font-medium leading-relaxed mb-8 max-w-md">{t.introP}</p>
              
              <button 
                onClick={() => setShowIntro(false)}
                className="intro-action-btn flex items-center justify-center gap-3 w-full font-black text-lg py-5 px-8 rounded-full text-white cursor-pointer"
              >
                <span>{t.introBtn}</span>
                <Play size={20} className="fill-current text-white stroke-2" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN APPLICATION VIEW */}
      <div className="w-full flex flex-col items-center px-4 py-3 max-w-[1240px] mx-auto h-screen relative">
        <header className="w-full flex justify-between items-center mb-3">
          <div className="logo flex items-end gap-[6px]">
            <div className="relative w-[26px] h-[26px]">
              <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
                <rect width="100" height="100" rx="20" fill="#005cb9"/>
              </svg>
              <img src="https://www.bouwmaat.nl/_nuxt/img/logo.156d07e.svg" alt="logo" className="w-[18px] h-[18px] absolute top-[4px] left-[4px]" referrerPolicy="no-referrer" />
            </div>
            <h1 className="flex items-center text-[1.2rem] font-[900] text-[#005cb9] dark:text-[#f8fafc] uppercase tracking-[-0.5px] m-0 line-height-[0.85] pb-[2px]">
              Amstel <span className="bg-[#005cb9] dark:bg-amber-500 text-white rounded-full w-[24px] h-[24px] text-[0.7rem] ml-[4px] inline-flex items-center justify-center font-black pb-[1px]">XL</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(prev => !prev)}
              className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full hover:scale-105 active:scale-95 transition-all text-slate-600 dark:text-slate-300"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Shopping List FAB */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(prev => !prev)}
              className="p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg relative cursor-pointer"
            >
              <ShoppingBag size={17} />
              {shoppingCart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                  {shoppingCart.length}
                </span>
              )}
            </motion.button>

            {/* App language switch */}
            <div className="lang-dropdown">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAppLangMenuOpen(prev => !prev);
                }}
                className="lang-toggle px-3 py-2 flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 rounded-xl font-extrabold text-xs bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
              >
                {curLang === 'nl' && '🇳🇱 NL'}
                {curLang === 'en' && '🇬🇧 EN'}
                {curLang === 'uk' && '🇺🇦 UA'}
                {curLang === 'pl' && '🇵🇱 PL'}
                <span className="text-[9px]">▼</span>
              </button>
              
              <AnimatePresence>
                {isAppLangMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.95 }}
                    className="lang-menu shadow-xl"
                  >
                    {['nl', 'en', 'uk', 'pl'].map(lng => (
                      <button
                        key={lng}
                        onClick={() => {
                          setCurLang(lng);
                          localStorage.setItem('bouwmaat_lang', lng);
                          setIsAppLangMenuOpen(false);
                        }}
                        className={`lang-item ${curLang === lng ? 'active' : ''}`}
                      >
                        {lng === 'nl' && '🇳🇱 NL'}
                        {lng === 'en' && '🇬🇧 EN'}
                        {lng === 'uk' && '🇺🇦 UA'}
                        {lng === 'pl' && '🇵🇱 PL'}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={resetAllFilters}
              className="px-4 py-2 border-2 border-blue-600 dark:border-blue-500 hover:bg-blue-600 hover:text-white rounded-xl font-black text-xs text-blue-600 dark:text-blue-400 cursor-pointer transitions"
            >
              {t.reset}
            </button>
          </div>
        </header>

        {/* Categories carousel chips */}
        <div className="w-full flex gap-2 overflow-x-auto py-1 scrap-scroll-hide scrollbar-none mask-fade-right flex-shrink-0">
          <button 
            onClick={() => setCurrentCategory('all')}
            className={`category-chip ${currentCategory === 'all' ? 'active' : ''}`}
          >
            {t.allCats}
          </button>
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setCurrentCategory(cat)}
              className={`category-chip ${currentCategory === cat ? 'active' : ''}`}
            >
              <span className="text-sm">{icons[cat] || '📦'}</span>
              <span>{(t.groups && t.groups[cat]) ? t.groups[cat] : cat}</span>
            </button>
          ))}
        </div>

        {/* Action search center wrapper */}
        <section className="w-full mt-3 flex gap-2 flex-shrink-0 relative">
          <div className="search-wrap">
            {/* Auto Ghost Suggestion Text */}
            <div id="searchGhost" className="text-slate-400 font-extrabold text-lg select-none whitespace-pre pointer-events-none">
              {ghostText && <p className="absolute pl-3.5 pt-3">{ghostText}</p>}
            </div>
            
            <Search className="absolute left-4 text-slate-400" size={18} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeydown}
              className="w-full h-full bg-transparent pl-12 pr-16 text-lg font-extrabold outline-none text-[#0f172a] dark:text-white dark:caret-white"
              placeholder={t.placeholder}
              autoComplete="off"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setGhostText('');
                  setSelectedProduct(null);
                  setIsSearching(false);
                }}
                className="absolute right-4 p-2 ring-transparent text-slate-400 hover:text-[#0f172a] dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </section>

        {/* CONTENT & SEARCH RESULTS LISTS */}
        <div className="w-full flex-1 flex flex-col min-h-0 mt-3 relative z-10">
          {!isSearching ? (
            /* Ambient Promotional Weekdeal Banner */
            <div className="flex-1 flex items-center justify-center p-2 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <img 
                src="https://cdn.bouwmaat.nl/api/images/bm_wk15-2026_homepage_banner_main.webp" 
                alt="Bouwmaat Actie Banner" 
                className="max-w-full max-h-full object-contain rounded-xl"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute top-4 left-4 bg-blue-600 text-white font-black text-xs px-3 py-1.5 rounded-lg shadow-md uppercase tracking-wider">
                Deals van de week
              </div>
            </div>
          ) : isFetching ? (
            <div className="flex-1 flex flex-col gap-3 p-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs font-black text-slate-500 mb-2.5 flex justify-between items-center px-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>{displayedProducts.length} {t.resFoundPlural}</span>
                  {selectedAisleFilter && (
                    <span className="bg-blue-600 dark:bg-blue-500 text-white font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 text-[10px]">
                      📍 {selectedAisleFilter === '0AW' ? t.backWallShort : `${t.padWord} ${selectedAisleFilter}`}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAisleFilter(null);
                        }}
                        className="hover:text-red-300 font-extrabold cursor-pointer ml-0.5 text-[9px]"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                </div>
                {filteredProducts.length > 50 && <span>Toont eerste 50</span>}
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 scrollbar-thin scrollbar-thumb-slate-200 pr-1 select-none">
                {displayedProducts.map(p => {
                  const loc = parseLocationStr(p.location);
                  const isSelected = selectedProduct?.articleNumber === p.articleNumber;
                  const isAddedToCart = shoppingCart.some(item => item.articleNumber === p.articleNumber);
                  
                  return (
                    <motion.div
                      key={p.articleNumber}
                      layout="position"
                      onClick={() => handleItemSelect(p)}
                      className={`result-item ${isSelected ? 'selected' : ''} border-2 hover:inner-shadow hover:scale-[1.01] transition-all`}
                    >
                      <div className="icon-wrap dark:bg-slate-800 flex items-center justify-center p-1.5">
                        <img
                          src={getImageUrl(p.articleNumber)}
                          data-sku={p.articleNumber}
                          alt={p.description}
                          onError={handleImgFallback}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      
                      <div className="info p-2.5 flex-1 min-w-0">
                        <h3 className="font-extrabold text-base leading-tight dark:text-white truncate">
                          {p.description}
                        </h3>
                        <div className="text-xs text-slate-400 font-bold mt-0.5">
                          {t.art} #{p.articleNumber}
                        </div>
                        <div className="flex gap-1.5 flex-wrap mt-2">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded text-[10px]">
                            {p.mainGroup}
                          </span>
                          {p.subGroup && (
                            <span className="bg-blue-50 dark:bg-sky-950/40 text-blue-700 dark:text-sky-300 font-semibold px-2 py-0.5 rounded text-[10px]">
                              {p.subGroup}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right aligned actions / product cart toggle */}
                      <div className="flex items-center gap-1.5 pr-2.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCartItem(p);
                          }}
                          className={`p-2 rounded-full cursor-pointer transition-all ${
                            isAddedToCart ? 'bg-amber-100 text-amber-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-amber-500'
                          }`}
                        >
                          <ShoppingBag size={16} />
                        </button>

                        <div className="w-20 bg-blue-600 text-white flex flex-col justify-center items-center rounded-xl p-1 text-center shrink-0 min-h-[72px]">
                          <span className="text-[9px] font-black opacity-80 uppercase leading-none">{t.pad}</span>
                          <b className="text-2xl font-black leading-none my-0.5">{loc.pad}</b>
                          <span className="text-[9px] font-black text-amber-300 leading-none truncate uppercase w-full">
                            {loc.side === 'Both' ? 'Centrum' : (loc.side === 'Links' ? t.left : t.right)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ISOMETRIC CUSTOM INTERACTIVE 3D MAP VIEWPORT */}
        <div className="map-wrapper flex justify-center items-center flex-shrink-0 min-h-[140px] mt-auto">
          <div className={`map-section relative transition-all duration-500 ${isMapExpanded ? 'map-expanded-overlay' : ''}`}>
            
            {/* Expanded Close Overlay Button */}
            {isMapExpanded && (
              <button 
                onClick={() => setIsMapExpanded(false)}
                className="btn-close-map absolute top-6 right-6 flex items-center justify-center font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xl cursor-pointer"
              >
                ✕
              </button>
            )}

            {/* Float glass Detail & Action card */}
            <AnimatePresence>
              {(isMapExpanded && selectedProduct) && (
                <motion.div 
                  initial={{ opacity: 0, y: -20, x: "-50%" }}
                  animate={{ opacity: 1, y: 0, x: "-50%" }}
                  exit={{ opacity: 0, y: -20, x: "-50%" }}
                  id="productDetailCard"
                  className="show"
                >
                  <div className="pd-header">
                    <div className="pd-icon group relative">
                      <img 
                        src={getImageUrl(selectedProduct.articleNumber)} 
                        data-sku={selectedProduct.articleNumber}
                        onError={handleImgFallback}
                        alt="Zoom Preview" 
                      />
                    </div>
                    <div className="pd-info">
                      <h3 className="pd-title truncate">{selectedProduct.description}</h3>
                      <div className="pd-art">{t.art} #{selectedProduct.articleNumber}</div>
                    </div>
                  </div>
                  <div className="pd-bottom">
                    <div className="pd-loc-banner">
                      📍 {selectedProduct.location}
                    </div>
                    <div className="pd-actions">
                      <button 
                        onClick={() => requestAssistence(selectedProduct)}
                        className={`pd-help-btn ${helperSentSkus.has(selectedProduct.articleNumber) ? 'sent' : ''}`}
                        title={t.askHelp}
                      >
                        {helperSentSkus.has(selectedProduct.articleNumber) ? (
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ) : (
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        )}
                      </button>

                      <button 
                        onClick={() => triggerPrintTicket(selectedProduct)}
                        className="pd-print-btn"
                        title={t.printBtn}
                      >
                        <Printer size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Aisle Explorer inside expanded custom map */}
            <AnimatePresence>
              {(isMapExpanded && activeAisleExplorer) && (
                <motion.div
                  initial={{ opacity: 0, y: -20, x: "-50%" }}
                  animate={{ opacity: 1, y: 0, x: "-50%" }}
                  exit={{ opacity: 0, y: -20, x: "-50%" }}
                  id="aisleExplorerCard"
                  className="show"
                >
                  <div className="ae-header">
                    <span>📍 {activeAisleExplorer === '0AW' ? t.backWallShort : `${t.padWord} ${activeAisleExplorer}`}</span>
                    <button onClick={closeExplorer} className="ae-close">✕</button>
                  </div>
                  
                  {/* Local aisle product filtering input */}
                  <div className="px-3.5 pb-2.5 pt-1.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <input
                      type="text"
                      value={aisleSearchQuery}
                      onChange={(e) => setAisleSearchQuery(e.target.value)}
                      placeholder={curLang === 'nl' ? 'Filter producten in dit pad...' : 'Filter products in this aisle...'}
                      className="w-full text-xs font-semibold px-3 py-2 bg-slate-100/60 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-700 dark:text-slate-300 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <ul className="ae-list select-none max-h-[220px] overflow-y-auto">
                    {(() => {
                      const allAisle = getAisleProducts(activeAisleExplorer);
                      const filtered = aisleSearchQuery.trim()
                        ? allAisle.filter(p => p.description.toLowerCase().includes(aisleSearchQuery.toLowerCase()) || p.articleNumber.includes(aisleSearchQuery))
                        : allAisle;
                      
                      return filtered.length > 0 ? (
                        filtered.map(p => (
                          <li 
                            key={p.articleNumber}
                            onClick={() => handleItemSelect(p)}
                            className="ae-item hover:scale-[1.01] hover:shadow transition-all"
                          >
                            <div className="ae-icon">
                              <img 
                                src={getImageUrl(p.articleNumber)}
                                data-sku={p.articleNumber}
                                onError={handleImgFallback}
                                alt=""
                              />
                            </div>
                            <div className="ae-item-info">
                              <div className="ae-item-title leading-snug">{p.description}</div>
                              <div className="ae-item-art">{t.art} #{p.articleNumber}</div>
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="ae-item justify-center text-slate-400 font-bold py-4">
                          {curLang === 'nl' ? 'Geen specifieke producten gevonden' : 'No specific products found'}
                        </li>
                      );
                    })()}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {/* DOUBLE TAP ACTION EXPLAINER BANNER (Click on map expands or double-clicking) */}
            <div 
              onDoubleClick={() => setIsMapExpanded(prev => !prev)}
              className="floor transition-all duration-300 relative"
              id="mapGrid"
              ref={mapGridRef}
              style={{
                perspective: '1800px',
                transformStyle: 'preserve-3d'
              }}
            >
              
              {/* BACK WALL REPRESENTATION */}
              <div 
                id="p-0AW"
                onClick={() => {
                  setActiveMapTarget({ pad: '0AW', sec: '8', side: 'Both' });
                  setSelectedAisleFilter('0AW');
                  setIsSearching(true);
                  if (isMapExpanded) setActiveAisleExplorer('0AW');
                }}
                className={`back-wall ${activeMapTarget?.pad === '0AW' ? 'active' : ''}`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="backwall-label">{t.backWallShort}</div>
                <div className="sec-container flex-row h-full w-full justify-evenly items-center px-2.5">
                  {Array.from({ length: 17 }).map((_, i) => (
                    <span 
                      key={i + 1}
                      data-sec={i + 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMapTarget({ pad: '0AW', sec: String(i + 1), side: 'Both' });
                      }}
                      style={{ transform: 'rotateX(-55deg) translateZ(10px) translateY(20px)', pointerEvents: 'auto', cursor: 'pointer' }}
                      className={activeMapTarget?.pad === '0AW' && activeMapTarget?.sec === String(i + 1) ? 'highlighted-sec' : ''}
                    >
                      {i + 1}
                    </span>
                  ))}
                </div>
              </div>

              {/* OUT OF SERVICE CASHIER ZONED DESKS */}
              <div 
                id="cashierZone"
              >
                <div 
                  id="desk-service" 
                  className="cashier-desk"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMapTarget({ pad: 'KAS', sec: null, side: 'Both', subTarget: 'service' });
                  }}
                >
                  <div className={`desk-label ${activeMapTarget?.pad === 'KAS' && activeMapTarget?.subTarget === 'service' ? 'active-label' : ''}`}>
                    {t.serviceDesk}
                  </div>
                </div>
                <div 
                  id="desk-sales1" 
                  className="cashier-desk"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMapTarget({ pad: 'KAS', sec: null, side: 'Both', subTarget: 'sales1' });
                  }}
                >
                  <div className={`desk-label ${activeMapTarget?.pad === 'KAS' && activeMapTarget?.subTarget === 'sales1' ? 'active-label' : ''}`}>
                    {t.salesDesk}
                  </div>
                </div>
                <div 
                  id="desk-kassa" 
                  className="cashier-desk"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMapTarget({ pad: 'KAS', sec: null, side: 'Both', subTarget: 'kassa' });
                  }}
                >
                  <div className={`desk-label ${activeMapTarget?.pad === 'KAS' && activeMapTarget?.subTarget === 'kassa' ? 'active-label' : ''}`}>
                    {t.kassa}
                  </div>
                </div>
              </div>

              {/* SAWMILL ZONE WITH COMPLETED ROTATOR SAW BLADE */}
              <div 
                id="sawmillZone"
                onClick={() => setActiveMapTarget({ pad: 'SAW', sec: null, side: 'Both', subTarget: 'sawmill' })}
                className="group transform-style-3d cursor-pointer"
              >
                <div className="saw-blade-container">
                  <div className={`saw-blade group-hover:spinning-saw ${activeMapTarget?.pad === 'SAW' ? 'spinning-saw' : ''}`} />
                </div>
                <div className={`desk-label ${activeMapTarget?.pad === 'SAW' ? 'active-label' : ''}`}>
                  {t.sawmill}
                </div>
              </div>

              {/* COMPACT SLIDING ENTRANCE SLIDERS DOORS */}
              <div 
                id="entranceDoor" 
                className="modern-door group"
                style={{ left: `${entranceX}px` }}
              >
                <div className="door-glass left group-hover:-translate-x-2 transition-transform duration-300" />
                <div className="door-glass right group-hover:translate-x-2 transition-transform duration-300" />
              </div>
              <div 
                id="entranceText" 
                className="entrance-label"
                style={{ left: `${entranceX}px`, bottom: '-5px' }}
              />

              {/* EXIT DOOR ALIGNED AND SYNCED */}
              <div 
                id="exitDoor" 
                className="modern-door exit-door group"
                style={{ left: `${exitX}px` }}
              >
                <div className="door-glass left group-hover:-translate-x-2 transition-transform duration-300" />
                <div className="door-glass right group-hover:translate-x-2 transition-transform duration-300" />
              </div>
              <div 
                id="exitText" 
                className="exit-label"
                style={{ left: `${exitX}px`, bottom: '-5px' }}
              />

              {/* COFFEE CORNER STANDS WITH COMPOSITE BLURS */}
              <div 
                id="coffeeCorner"
                onClick={() => setActiveMapTarget({ pad: 'KOFFIE', sec: null, side: 'Both', subTarget: 'coffee' })}
              >
                <div className="vending-machine">
                  <div className="vending-screen" />
                  <div className="vending-slot" />
                </div>
                <div className="coffee-cup animate-bounce">☕</div>
                <div className={`coffee-label ${activeMapTarget?.pad === 'KOFFIE' ? 'active-label' : ''}`}>
                  {t.coffeeCorner}
                </div>
              </div>

              {/* SVG Glowing walking line trace overlay */}
              <svg id="pathLayer" className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible translate-z-10 select-none">
                <path 
                  id="guideLine" 
                  d={svgPath} 
                  className="walking-line" 
                  style={{
                    strokeDasharray: isMultiRouteActive ? '10 15' : undefined,
                    strokeWidth: isMapExpanded ? 5 : 4
                  }} 
                />
              </svg>

              {/* THE 1L LEFT WALL AISLE */}
              <div 
                id="p-1L"
                onClick={() => {
                  setActiveMapTarget({ pad: '1L', sec: '8', side: 'Links' });
                  setSelectedAisleFilter('1L');
                  setIsSearching(true);
                  if (isMapExpanded) setActiveAisleExplorer('1L');
                }}
                className={`aisle left-wall-aisle ${activeMapTarget?.pad === '1L' ? 'active active-num' : ''}`}
                style={{ marginBottom: '-75px' }}
              >
                <div className={`aisle-part ${activeMapTarget?.pad === '1L' ? 'active-part' : ''}`}>
                  <div className="left-face" />
                  <div className="aisle-category-label label-bottom" data-map-label="Gipsplaten">
                    {t.mapLabels?.Gipsplaten || 'Gipsplaten'}
                  </div>
                  <div className="sec-container flex-col-reverse justify-evenly items-center p-1.5 h-full">
                    {Array.from({ length: 17 }).map((_, idx) => (
                      <span 
                        key={idx + 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMapTarget({ pad: '1L', sec: String(idx + 1), side: 'Links' });
                        }}
                        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                        className={activeMapTarget?.pad === '1L' && activeMapTarget?.sec === String(idx + 1) ? 'highlighted-sec' : ''}
                      >
                        {idx + 1}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* AISLES 1 TO 17 */}
              {Array.from({ length: 17 }).map((_, i) => {
                const num = (i + 1).toString();
                const hasPaint = num === '9';
                
                const isTargetPad = activeMapTarget?.pad === num;
                const isLocAisleNum = selectedProduct && parseLocationStr(selectedProduct.location).pad === num;
                
                const isNumActive = isTargetPad;
                const isBothActive = isTargetPad && activeMapTarget?.side === 'Both';
                const isLeftActive = isTargetPad && activeMapTarget?.side === 'Links';
                const isRightActive = isTargetPad && activeMapTarget?.side === 'Rechts';

                const catWordTop = backAisleLabels[num] || '';
                const catWordBottom = aisleCategories[num] || '';

                return (
                  <div 
                    key={num}
                    id={`p-${num}`}
                    data-num={num}
                    onClick={(e) => {
                      // Work out which side is tapped
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const calculatedSide = clickX < rect.width / 2 ? 'Links' : 'Rechts';
                      
                      setActiveMapTarget({
                        pad: num,
                        sec: calculatedSide === 'Links' ? '3' : '12',
                        side: calculatedSide
                      });

                      setSelectedAisleFilter(num);
                      setIsSearching(true);

                      if (isMapExpanded) {
                        setActiveAisleExplorer(num);
                      }
                    }}
                    className={`aisle ${num === '17' ? 'right-wall-aisle' : ''} ${isNumActive ? 'active-num' : ''} ${
                      isBothActive ? 'active' : (isLeftActive ? 'active active-side-left' : (isRightActive ? 'active active-side-right' : ''))
                    }`}
                  >
                    {/* Top half rack side */}
                    <div className={`aisle-part top ${isTargetPad ? 'active-part' : ''}`}>
                      <div className="left-face" />
                      {catWordTop && (
                        <div className="aisle-category-label label-top" data-map-label={catWordTop}>
                          {t.mapLabels?.[catWordTop] || catWordTop}
                        </div>
                      )}
                      <div className="sec-container flex-col-reverse justify-evenly items-center p-1.5 h-full">
                        {Array.from({ length: 11 }).map((_, sIdx) => {
                          const sNo = (sIdx + 7).toString();
                          return (
                            <span 
                              key={sNo} 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMapTarget({
                                  pad: num,
                                  sec: sNo,
                                  side: activeMapTarget?.side || 'Links'
                                });
                              }}
                              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                              className={isTargetPad && activeMapTarget?.sec === sNo ? 'highlighted-sec' : ''}
                            >
                              {sNo}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom half rack side */}
                    <div className={`aisle-part bottom ${isTargetPad ? 'active-part' : ''}`}>
                      <div className="left-face" />
                      {catWordBottom && (
                        <div className="aisle-category-label label-bottom" data-map-cat={catWordBottom}>
                          {t.groups?.[catWordBottom] || catWordBottom}
                        </div>
                      )}
                      <div className="sec-container flex-col-reverse justify-evenly items-center p-1.5 h-full">
                        {Array.from({ length: 6 }).map((_, sIdx) => {
                          const sNo = (sIdx + 1).toString();
                          return (
                            <span 
                              key={sNo} 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMapTarget({
                                  pad: num,
                                  sec: sNo,
                                  side: activeMapTarget?.side || 'Links'
                                });
                              }}
                              style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                              className={isTargetPad && activeMapTarget?.sec === sNo ? 'highlighted-sec' : ''}
                            >
                              {sNo}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Paint mixing table inside pad 9 */}
                    {hasPaint && (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMapTarget({ pad: '9', sec: null, side: 'Links', subTarget: 'paint' });
                        }}
                        className="paint-table group"
                      >
                        <div className={`desk-label ${activeMapTarget?.pad === '9' && activeMapTarget?.subTarget === 'paint' ? 'active-label' : ''}`}>
                          {t.paintDesk}
                        </div>
                      </div>
                    )}

                    {/* Walkway badge containing Aisle number */}
                    <div className="aisle-num">
                      <span className="pad-prefix uppercase leading-none">{t.padWord}</span>
                      <b className="text-[14px] font-black leading-none">{num}</b>
                    </div>
                  </div>
                );
              })}

              {/* Active touchscreen blinking Kiosk */}
              <div 
                id="kioskZone" 
                style={{ left: `${kioskX}px` }}
              >
                <div className="kiosk-pin">
                  <div className="kiosk-pin-dot" />
                </div>
                <div className="kiosk-machine">
                  <div className="kiosk-screen" />
                </div>
              </div>

              {/* Dynamic user walk avatar character */}
              <div 
                id="mainChar"
                className={`user z-30 transition-all select-none pointer-events-none absolute ${isRunning ? 'running' : ''} ${isInteracting ? 'interacting' : ''}`}
                style={{
                  left: `${charLeft}px`,
                  bottom: charBottom,
                  width: '18px',
                  transitionDuration: isRunning ? '0ms' : '400ms',
                  display: showIntro ? 'none' : 'block',
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'bottom center',
                  transform: `translateX(-50%) rotateX(${isMapExpanded ? -42 : -55}deg) translateZ(${isMapExpanded ? 30 : 20}px) scale(${isMapExpanded ? 1.6 : 1})`,
                  '--char-dir': charDir === -1 ? '-1' : '1',
                  '--char-rx': `${isMapExpanded ? -42 : -55}deg`,
                  '--char-tz': `${isMapExpanded ? 30 : 25}px`,
                  '--char-scale': `${isMapExpanded ? 1.6 : 1}`
                } as React.CSSProperties}
              >
                <svg viewBox="0 0 64 100" style={{ transform: `scaleX(var(--char-dir))`, filter: 'drop-shadow(-4px 8px 4px rgba(0,0,0,0.4))' }}>
                  <path d="M22 18 Q10 40 18 55 Q32 30 42 18" fill="#4a3000" />
                  <circle cx="32" cy="22" r="14" fill="#ffcdb2" />
                  <path d="M18 22 Q32 8 46 22 Q32 12 18 22" fill="#3a2500" />
                  <path d="M22 36 L42 36 Q48 50 44 65 L20 65 Q16 50 22 36" fill="#005cb9" /> 
                  <path className="arm-left" d="M22 38 Q12 55 18 62" stroke="#ffcdb2" strokeWidth="5" strokeLinecap="round" fill="none" />
                  <path className="arm-right" d="M42 38 Q52 55 46 62" stroke="#ffcdb2" strokeWidth="5" strokeLinecap="round" fill="none" />
                  <path d="M26 65 L26 88" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
                  <path d="M38 65 L38 88" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
                </svg>
              </div>

            </div>
          </div>
        </div>

        {/* SIDE BAR / CART PANEL PANEL OVERLAY */}
        <AnimatePresence>
          {isCartOpen && (
            <>
              {/* Back Drop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCartOpen(false)}
                className="fixed inset-0 bg-black z-40"
              />
              {/* Cart Drawer */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col p-5"
              >
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="text-blue-600 dark:text-blue-400" />
                    <h2 className="text-lg font-black dark:text-white uppercase">{t.cartTitle}</h2>
                  </div>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 border border-slate-200 dark:border-slate-800 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 font-extrabold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Selected Shopping list */}
                <div className="flex-1 overflow-y-auto py-4 space-y-3">
                  {shoppingCart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 font-black">
                      <ShoppingBag size={48} className="mb-2 opacity-50" />
                      <p>{t.emptyList}</p>
                    </div>
                  ) : (
                    shoppingCart.map(item => (
                      <div 
                        key={item.articleNumber}
                        className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl relative flex justify-between items-start border border-slate-100 dark:border-slate-800"
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <h4 className="font-extrabold text-[#0f172a] dark:text-white text-sm leading-snug truncate">
                            {item.description}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                            📍 {item.location}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleCartItem(item)}
                          className="text-slate-400 hover:text-red-500 font-bold p-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Route build triggers */}
                {shoppingCart.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={calculateOptimizedPath}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg hover:scale-[1.01] active:scale-95 transition-all text-sm uppercase tracking-wider cursor-pointer"
                    >
                      {t.routeButton}
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* PRINT SLIP STYLES FOR PRINTER EMULATION */}
        <div id="printArea" />

        <footer className="w-full py-1 text-center text-[9px] text-slate-400 border-t border-slate-200 dark:border-slate-800 mt-1 flex-shrink-0 flex items-center justify-center gap-1.5">
          <span className="bg-blue-600/90 text-white font-black px-1.5 py-0.5 rounded uppercase text-[7px]">BETA v1.5</span>
          <div>&copy; 2026 <span className="font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">AISLE WISE&trade;</span></div>
          <span>•</span>
          <div>All Rights Reserved</div>
        </footer>
      </div>
    </div>
  );
}
