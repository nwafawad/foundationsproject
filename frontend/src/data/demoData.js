// ═══════════════════════════════════════════
// RECYX Demo Data - 20+ Listings, 16 Technicians, Users, Offers, Notifications
// ═══════════════════════════════════════════

export const USERS = [
  {id:1,name:"RECYX Admin",email:"admin@recyx.rw",pw:"Admin@123",role:"admin",sector:"Kacyiru, Gasabo",verified:true,avatar:"RA",phone:"+250 788 000 000"},
  {id:2,name:"Marie Uwase",email:"marie@email.com",pw:"Marie@123",role:"citizen",sector:"Kimironko, Gasabo",verified:true,avatar:"MU",phone:"+250 788 111 111"},
  {id:3,name:"Jean-Pierre H.",email:"jp@email.com",pw:"Jean@1234",role:"technician",sector:"Remera, Gasabo",verified:true,avatar:"JP",phone:"+250 788 222 222",spec:"Smartphones & Tablets",rating:4.8,jobs:127,exp:6},
  {id:4,name:"Enviroserve Rwanda",email:"enviro@recyx.rw",pw:"Enviro@123",role:"recycler",sector:"Gikondo, Kicukiro",verified:true,avatar:"ER",phone:"+250 788 333 333",company:"Enviroserve Rwanda Ltd"},
  {id:5,name:"Joseph Mugabo",email:"joseph@email.com",pw:"Joseph@123",role:"buyer",sector:"Muhima, Nyarugenge",verified:true,avatar:"JM",phone:"+250 788 444 444"},
  {id:6,name:"Alice Mukamana",email:"alice@email.com",pw:"Alice@1234",role:"technician",sector:"Niboye, Kicukiro",verified:true,avatar:"AM",phone:"+250 788 555 555",spec:"Laptops & Computers",rating:4.6,jobs:89,exp:4},
  {id:7,name:"Eric Nshimiyimana",email:"eric@email.com",pw:"Eric@12345",role:"technician",sector:"Nyamirambo, Nyarugenge",verified:true,avatar:"EN",phone:"+250 788 666 666",spec:"Home Appliances",rating:4.9,jobs:203,exp:8},
  {id:8,name:"Ecoplastic Ltd",email:"eco@email.com",pw:"Eco@12345",role:"recycler",sector:"Masaka, Kicukiro",verified:true,avatar:"EP",phone:"+250 788 777 777",company:"Ecoplastic Ltd"},
  // Pending accounts (for admin demo)
  {id:100,name:"Bernard Twagiramungu",email:"bernard@email.com",pw:"Bernard@1",role:"technician",sector:"Gatsata, Gasabo",verified:false,avatar:"BT",spec:"Solar Panels & Inverters"},
  {id:101,name:"Claudine Nyirahabimana",email:"claudine@green.rw",pw:"Claudine1!",role:"recycler",sector:"Kanombe, Kicukiro",verified:false,avatar:"CN",company:"GreenRwanda Recycling"},
  {id:102,name:"Emmanuel Rugamba",email:"emmanuel@email.com",pw:"Emmanuel1!",role:"technician",sector:"Kimisagara, Nyarugenge",verified:false,avatar:"ER2",spec:"Printers & Copiers"},
];

export const TECHNICIANS = [
  {id:3,name:"Jean-Pierre Habimana",avatar:"JP",spec:"Smartphones & Tablets",sector:"Remera, Gasabo",rating:4.8,jobs:127,exp:6,phone:"+250 788 222 222"},
  {id:6,name:"Alice Mukamana",avatar:"AM",spec:"Laptops & Computers",sector:"Niboye, Kicukiro",rating:4.6,jobs:89,exp:4,phone:"+250 788 555 555"},
  {id:7,name:"Eric Nshimiyimana",avatar:"EN",spec:"Home Appliances",sector:"Nyamirambo, Nyarugenge",rating:4.9,jobs:203,exp:8,phone:"+250 788 666 666"},
  {id:9,name:"Grace Uwimana",avatar:"GU",spec:"TVs & Monitors",sector:"Gisozi, Gasabo",rating:4.3,jobs:45,exp:3,phone:"+250 788 888 888"},
  {id:10,name:"Patrick Bizimungu",avatar:"PB",spec:"Smartphones & Tablets",sector:"Maraba, Huye",rating:4.7,jobs:78,exp:5,phone:"+250 788 999 888"},
  {id:11,name:"Diane Ingabire",avatar:"DI",spec:"Laptops & Computers",sector:"Muhoza, Musanze",rating:4.5,jobs:62,exp:4,phone:"+250 788 112 233"},
  {id:12,name:"Fabrice Mugisha",avatar:"FM",spec:"Printers & Copiers",sector:"Kimisagara, Nyarugenge",rating:4.4,jobs:56,exp:3,phone:"+250 788 223 344"},
  {id:13,name:"Clarisse Uwamahoro",avatar:"CU",spec:"Smartphones & Tablets",sector:"Kacyiru, Gasabo",rating:4.7,jobs:93,exp:5,phone:"+250 788 334 455"},
  {id:14,name:"Innocent Habimana",avatar:"IH",spec:"Solar Panels & Inverters",sector:"Gisenyi, Rubavu",rating:4.8,jobs:41,exp:7,phone:"+250 788 445 566"},
  {id:15,name:"Josiane Mukeshimana",avatar:"JM2",spec:"Home Appliances",sector:"Nyamata, Bugesera",rating:4.2,jobs:34,exp:2,phone:"+250 788 556 677"},
  {id:16,name:"Emmanuel Nsanzimana",avatar:"EN2",spec:"TVs & Monitors",sector:"Kabacuzi, Muhanga",rating:4.6,jobs:71,exp:4,phone:"+250 788 667 788"},
  {id:17,name:"Sandrine Nikuze",avatar:"SN",spec:"Laptops & Computers",sector:"Rubengera, Karongi",rating:4.5,jobs:48,exp:3,phone:"+250 788 778 899"},
  {id:18,name:"Olivier Niyonzima",avatar:"ON",spec:"Smartphones & Tablets",sector:"Kabarondo, Kayonza",rating:4.3,jobs:37,exp:3,phone:"+250 788 889 900"},
  {id:19,name:"Aline Mukamurenzi",avatar:"AM2",spec:"Printers & Copiers",sector:"Gahini, Kayonza",rating:4.1,jobs:22,exp:2,phone:"+250 788 900 011"},
  {id:20,name:"Theogene Ndagijimana",avatar:"TN",spec:"Home Appliances",sector:"Kinigi, Musanze",rating:4.9,jobs:115,exp:9,phone:"+250 788 011 122"},
  {id:21,name:"Vestine Nyiransabimana",avatar:"VN",spec:"Solar Panels & Inverters",sector:"Kibungo, Ngoma",rating:4.4,jobs:29,exp:3,phone:"+250 788 122 233"},
];

export const LISTINGS = [
  {id:1,sellerId:2,material:"electronics",qty:25,condition:"repairable",title:"Office Desktop Computers (5 units)",description:"Old Dell Optiplex desktops and keyboards from corporate office clearout. All power on but run slow - perfect for refurbishing or parts. Includes 3 monitors.",sector:"Kimironko, Gasabo",status:"available",price:75000,date:"2026-03-01",views:148,favorites:12,image:"https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=500&h=350&fit=crop"},
  {id:2,sellerId:2,material:"plastic",qty:150,condition:"scrap",title:"PET Bottles Collection - 150kg Sorted",description:"Clean PET bottles collected over 3 months from Kimironko market. Sorted by color (clear, green, blue). Compressed and bagged.",sector:"Kimironko, Gasabo",status:"available",price:22500,date:"2026-03-03",views:312,favorites:28,image:"https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=500&h=350&fit=crop"},
  {id:3,sellerId:5,material:"metal",qty:80,condition:"scrap",title:"Aluminium Scrap from Construction Site",description:"Window frames, door handles, and metal offcuts from completed construction project. Mixed aluminium and steel, ~80kg.",sector:"Muhima, Nyarugenge",status:"available",price:48000,date:"2026-02-28",views:167,favorites:9,image:"https://tse3.mm.bing.net/th/id/OIP.nK579PDOfKE8Hh9Ae1FOYwHaGL?rs=1&pid=ImgDetMain&o=7&rm=3"},
  {id:4,sellerId:2,material:"electronics",qty:12,condition:"functional",title:"Samsung Galaxy Phones (12 units)",description:"Working Galaxy J5 and A10 series. All batteries hold charge 6+ hours. Some light screen scratches. Great for bulk resale.",sector:"Remera, Gasabo",status:"available",price:180000,date:"2026-03-05",views:503,favorites:47,image:"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=350&fit=crop"},
  {id:5,sellerId:5,material:"glass",qty:200,condition:"scrap",title:"Restaurant Glass Bottles - Sorted & Cleaned",description:"200kg of glass bottles from 3 restaurants. Sorted by color. Washed and labels removed.",sector:"Gikondo, Kicukiro",status:"pending_review",price:30000,date:"2026-03-06",views:0,favorites:0,image:"https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=500&h=350&fit=crop"},
  {id:6,sellerId:2,material:"paper",qty:300,condition:"scrap",title:"Office Paper & Cardboard - 300kg Bulk",description:"Mixed office A4, newspapers, magazines, flattened cardboard. Stored dry indoors.",sector:"Kacyiru, Gasabo",status:"available",price:15000,date:"2026-03-04",views:89,favorites:5,image:"https://images.unsplash.com/photo-1568667256549-094345857637?w=500&h=350&fit=crop"},
  {id:7,sellerId:8,material:"plastic",qty:500,condition:"scrap",title:"Industrial HDPE Containers - 500kg",description:"Large HDPE industrial containers and drums. Previously food-grade. Clean condition.",sector:"Masaka, Kicukiro",status:"available",price:75000,date:"2026-03-08",views:78,favorites:11,image:"https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500&h=350&fit=crop"},
  {id:8,sellerId:4,material:"electronics",qty:50,condition:"scrap",title:"Circuit Boards & E-Waste Components",description:"Mixed circuit boards, cables, electronic components. Contains recoverable precious metals.",sector:"Gikondo, Kicukiro",status:"available",price:120000,date:"2026-03-07",views:234,favorites:19,image:"https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=350&fit=crop"},
  {id:9,sellerId:2,material:"metal",qty:120,condition:"scrap",title:"Copper Wire Scrap - 120kg",description:"Stripped copper wire from electrical installations. High-grade, minimal insulation.",sector:"Gisozi, Gasabo",status:"available",price:240000,date:"2026-03-09",views:421,favorites:35,image:"https://images.unsplash.com/photo-1567393528677-d6adae7d4a0a?w=500&h=350&fit=crop"},
  {id:10,sellerId:5,material:"electronics",qty:8,condition:"functional",title:"HP LaserJet Printers (8 units)",description:"Working HP LaserJet Pro printers. All print correctly. Includes partial toner.",sector:"Muhima, Nyarugenge",status:"available",price:320000,date:"2026-03-10",views:156,favorites:14,image:"https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500&h=350&fit=crop"},
  {id:11,sellerId:4,material:"plastic",qty:250,condition:"scrap",title:"Mixed Plastic Waste - Warehouse Clearout",description:"Assorted plastic packaging, containers, film. Unsorted but clean. ~250kg.",sector:"Gikondo, Kicukiro",status:"available",price:20000,date:"2026-03-08",views:67,favorites:4,image:"https://images.unsplash.com/photo-1591193686104-fddba4d0e4d8?w=500&h=350&fit=crop"},
  {id:12,sellerId:2,material:"electronics",qty:20,condition:"repairable",title:"Laptop Lot - Mixed Brands (20 units)",description:"Dell, HP, Lenovo laptops from school IT upgrade. Most boot but need battery/screen work.",sector:"Kimironko, Gasabo",status:"available",price:400000,date:"2026-03-11",views:678,favorites:52,image:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=350&fit=crop"},
  {id:13,sellerId:8,material:"metal",qty:200,condition:"scrap",title:"Steel Beams & Rebar - Construction",description:"Leftover steel I-beams and rebar from completed building. Various sizes.",sector:"Nyarugunga, Kicukiro",status:"available",price:180000,date:"2026-03-07",views:93,favorites:8,image:"https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&h=350&fit=crop"},
  {id:14,sellerId:5,material:"paper",qty:150,condition:"scrap",title:"Newspaper & Magazine Collection - 150kg",description:"Bundled newspapers and magazines from offices. Sorted in 10kg bundles. Clean.",sector:"Gitega, Nyarugenge",status:"available",price:12000,date:"2026-03-06",views:43,favorites:2,image:"https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=500&h=350&fit=crop"},
  {id:15,sellerId:2,material:"electronics",qty:30,condition:"scrap",title:"CRT Monitors & Old TVs (30 units)",description:"Old CRT monitors and TVs. Non-functional. Contain recyclable glass, copper, metals.",sector:"Remera, Gasabo",status:"available",price:45000,date:"2026-03-12",views:112,favorites:6,image:"https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&h=350&fit=crop"},
  {id:16,sellerId:4,material:"glass",qty:300,condition:"scrap",title:"Industrial Glass Panes - Damaged",description:"Broken/cracked glass panes from commercial renovation. 300kg. Sorted by thickness.",sector:"Gatenga, Kicukiro",status:"available",price:25000,date:"2026-03-09",views:38,favorites:3,image:"https://media.istockphoto.com/id/1412395712/photo/broken-industrial-reinforced-glass-window.jpg?s=170667a&w=0&k=20&c=RhNKgNeXpyEgts-PBFd99VfWuucks8nv0HDKACUTi0s="},
  {id:17,sellerId:5,material:"mixed",qty:400,condition:"scrap",title:"Office Clearout - Mixed Materials 400kg",description:"Complete office clearout: furniture parts, electronics, paper, plastics. Unsorted.",sector:"Muhima, Nyarugenge",status:"available",price:35000,date:"2026-03-10",views:187,favorites:15,image:"https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500&h=350&fit=crop"},
  {id:18,sellerId:8,material:"plastic",qty:80,condition:"functional",title:"Used Water Tanks (5 units) - 1000L each",description:"Used HDPE water tanks. 1000L each. Minor scratches, no leaks. Rainwater harvesting.",sector:"Masaka, Kicukiro",status:"available",price:150000,date:"2026-03-11",views:256,favorites:22,image:"https://tse4.mm.bing.net/th/id/OIP.lY_-hfIzWYociTYF5TviIQHaFj?rs=1&pid=ImgDetMain&o=7&rm=3"},
  {id:19,sellerId:2,material:"electronics",qty:15,condition:"functional",title:"iPad Mini Collection (15 units)",description:"iPad Mini 2nd/3rd gen. All working, some cracked screens. Batteries 4+ hours.",sector:"Kacyiru, Gasabo",status:"available",price:450000,date:"2026-03-13",views:834,favorites:68,image:"https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=350&fit=crop"},
  {id:20,sellerId:4,material:"metal",qty:50,condition:"scrap",title:"Aluminium Cans - 50kg Crushed",description:"Crushed aluminium beverage cans from events and restaurants. Clean, compressed.",sector:"Gikondo, Kicukiro",status:"available",price:35000,date:"2026-03-12",views:145,favorites:10,image:"https://tse2.mm.bing.net/th/id/OIP.Zb4ifpcIzcxtu0U8fbdVWAHaE7?rs=1&pid=ImgDetMain&o=7&rm=3"},
  {id:21,sellerId:5,material:"electronics",qty:6,condition:"functional",title:"Office Projectors (6 units) - Working",description:"Epson and BenQ projectors. All project clearly. With cables and remotes.",sector:"Muhima, Nyarugenge",status:"available",price:360000,date:"2026-03-14",views:198,favorites:16,image:"https://www.nashua.co.za/wp-content/uploads/2023/11/pan-shot-empty-office-with-projector-middle-conference-desk-1349x900.jpg"},
  {id:22,sellerId:2,material:"paper",qty:500,condition:"scrap",title:"Cardboard Boxes - 500kg Flattened",description:"Large flattened cardboard shipping boxes from warehouse. Clean, dry, on pallets.",sector:"Kimironko, Gasabo",status:"available",price:25000,date:"2026-03-13",views:76,favorites:7,image:"https://tse1.explicit.bing.net/th/id/OIP.Y6UN1Hq1w96CDUNh95UFhAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"},
];

export const OFFERS = [
  {id:1,listingId:1,buyerId:4,buyerName:"Enviroserve Rwanda",amount:60000,status:"pending",date:"2026-03-07",message:"We can collect within 24hrs. 60,000 RWF."},
  {id:2,listingId:1,buyerId:5,buyerName:"Joseph Mugabo",amount:70000,status:"pending",date:"2026-03-07",message:"Good units for refurbishing. 70,000 RWF."},
  {id:3,listingId:2,buyerId:4,buyerName:"Enviroserve Rwanda",amount:18000,status:"countered",date:"2026-03-05",message:"Standard PET rate. Can pick up tomorrow.",counterAmount:22000,counterMessage:"Price firm - already sorted by color and cleaned."},
  {id:4,listingId:3,buyerId:4,buyerName:"Enviroserve Rwanda",amount:45000,status:"accepted",date:"2026-03-03",message:"45,000 fair for the aluminium?",txStatus:"in_transit"},
  {id:5,listingId:4,buyerId:5,buyerName:"Joseph Mugabo",amount:150000,status:"countered",date:"2026-03-08",message:"150,000 for all 12 phones.",counterAmount:170000,counterMessage:"Working phones, good batteries. 170,000 is my best."},
  {id:6,listingId:8,buyerId:5,buyerName:"Joseph Mugabo",amount:100000,status:"pending",date:"2026-03-09",message:"Interested in circuit boards. 100,000."},
  {id:7,listingId:7,buyerId:4,buyerName:"Enviroserve Rwanda",amount:65000,status:"accepted",date:"2026-03-09",message:"Good HDPE stock. 65,000?",txStatus:"completed",paid:true},
  {id:8,listingId:9,buyerId:4,buyerName:"Enviroserve Rwanda",amount:200000,status:"pending",date:"2026-03-10",message:"Premium copper. We offer 200,000 RWF."},
  {id:9,listingId:12,buyerId:5,buyerName:"Joseph Mugabo",amount:350000,status:"pending",date:"2026-03-12",message:"I'll take all 20 laptops for 350,000."},
];

export const NOTIFICATIONS = [
  {id:1,userId:2,message:"New offer: 70,000 RWF on Desktop Computers from Joseph Mugabo",read:false,date:"2026-03-07",type:"offer",listingId:1},
  {id:2,userId:2,message:"New offer: 60,000 RWF on Desktop Computers from Enviroserve",read:false,date:"2026-03-07",type:"offer",listingId:1},
  {id:3,userId:4,message:"Counter-offer received: 22,000 RWF on PET Bottles",read:false,date:"2026-03-06",type:"counter",listingId:2},
  {id:4,userId:1,message:"New technician: Bernard Twagiramungu - requires your approval",read:false,date:"2026-03-09",type:"admin"},
  {id:5,userId:1,message:"New recycler: GreenRwanda Recycling - requires your approval",read:false,date:"2026-03-08",type:"admin"},
  {id:6,userId:1,message:"Listing pending: Restaurant Glass Bottles (200kg)",read:false,date:"2026-03-06",type:"admin"},
  {id:7,userId:5,message:"Your offer of 45,000 RWF on Aluminium Scrap was accepted! Set up payment.",read:false,date:"2026-03-04",type:"payment",listingId:3},
  {id:8,userId:5,message:"Transaction completed: HDPE Containers - 65,000 RWF",read:true,date:"2026-03-10",type:"completed"},
  {id:9,userId:2,message:"Counter-offer: 170,000 RWF for Samsung Galaxy Phones",read:false,date:"2026-03-08",type:"counter",listingId:4},
  {id:10,userId:2,message:"New offer: 200,000 RWF on Copper Wire from Enviroserve",read:false,date:"2026-03-10",type:"offer",listingId:9},
];

export const TESTIMONIALS = [
  {name:"Ange Mutesi",role:"Citizen, Kimironko",text:"I found a verified technician for my broken laptop in minutes. The rating system gave me total confidence - my laptop works perfectly now!",rating:5,lang:"en"},
  {name:"Green Solutions Ltd",role:"Recycler, Kicukiro",text:"We source 60% of our raw materials through RECYX now. The sector-based search and product images save us hours of scouting every week.",rating:4,lang:"en"},
  {name:"Claude Ndayisaba",role:"Waste Collector, Gasabo",text:"RECYX connected me with recyclers I never knew existed. I sold 300kg of plastic in one week. The counter-offer feature helped me negotiate a fair price.",rating:5,lang:"en"},
  {name:"Pacifique Mugabo",role:"Umutekinsiye, Remera",text:"RECYX yarampaye uburyo bwo kubona abakiriya benshi. Ubu ngira abakiriya bashya buri cyumweru binyuze ku rubuga. Sisitemu y'amanota ituma abantu banyizera kandi bakamenya ko ari jye bakeneye.",rating:5,lang:"rw"},
  {name:"Esperance Uwimana",role:"Umuturage, Nyamirambo",text:"Nashakaga umuntu wo gusana telefoni yanjye kandi sinari nzi aho nzajya. RECYX yaranyeretse abatekinsiye bemejwe hafi yanjye - nasubije telefoni yanjye mu minota 30 gusa! Igiciro cyari gikwiye cyane.",rating:5,lang:"rw"},
  {name:"Vestine Nyiransabimana",role:"Umucuruzi w'Imyanda, Ngoma",text:"Mbere ya RECYX nari nsiba igihe kinini nshaka abashoramari b'ibikoresho by'imyanda. Ubu nabonye ababigura mu minota mike. Igiciro gisubirwamo ni ikintu gishimishije - nshobora kunegosia igiciro kuri buri kintu.",rating:4,lang:"rw"},
];

export const MAP_FACILITIES = [
  {id:1,name:"Enviroserve Rwanda",type:"recycler",lat:-1.935,lng:30.082,materials:"Electronics, Metal",sector:"Gikondo, Kicukiro"},
  {id:2,name:"Ecoplastic Ltd",type:"recycler",lat:-1.968,lng:30.105,materials:"Plastic, PET",sector:"Masaka, Kicukiro"},
  {id:3,name:"Kigali Tech Repairs",type:"repair",lat:-1.950,lng:30.060,sector:"Kimisagara, Nyarugenge"},
  {id:4,name:"Rwanda Metal Works",type:"recycler",lat:-1.943,lng:30.092,materials:"Metal, Aluminium",sector:"Remera, Gasabo"},
  {id:5,name:"MTN Service Centre",type:"repair",lat:-1.955,lng:30.075,sector:"Muhima, Nyarugenge"},
  {id:6,name:"Green Collection Hub",type:"collection",lat:-1.962,lng:30.118,sector:"Kanombe, Kicukiro"},
  {id:7,name:"Papyrus Paper Recycling",type:"recycler",lat:-1.938,lng:30.100,materials:"Paper, Cardboard",sector:"Kimironko, Gasabo"},
  {id:8,name:"Kimironko Collection Point",type:"collection",lat:-1.940,lng:30.110,sector:"Kimironko, Gasabo"},
  {id:9,name:"Samsung Authorized Service",type:"repair",lat:-1.948,lng:30.064,sector:"Muhima, Nyarugenge"},
  {id:10,name:"Kigali Glass Recyclers",type:"recycler",lat:-1.960,lng:30.088,materials:"Glass",sector:"Gatenga, Kicukiro"},
  {id:11,name:"Rubavu E-Waste Centre",type:"recycler",lat:-1.680,lng:29.320,materials:"Electronics",sector:"Gisenyi, Rubavu"},
  {id:12,name:"Huye Repair Hub",type:"repair",lat:-2.590,lng:29.740,sector:"Tumba, Huye"},
  {id:13,name:"Musanze Green Centre",type:"recycler",lat:-1.500,lng:29.630,materials:"Electronics, Plastic",sector:"Muhoza, Musanze"},
  {id:14,name:"Nyamirambo Fix-It Shop",type:"repair",lat:-1.975,lng:30.045,sector:"Nyamirambo, Nyarugenge"},
  {id:15,name:"Gisozi Recycling Depot",type:"collection",lat:-1.920,lng:30.065,sector:"Gisozi, Gasabo"},
];

// Tag colors
export const MATERIAL_COLORS = {electronics:["#ede9fe","#7c3aed"],plastic:["#fce7f3","#db2777"],metal:["#f1f5f9","#475569"],paper:["#fef3c7","#b45309"],glass:["#e0f2fe","#0369a1"],mixed:["#f3e8ff","#9333ea"]};
export const STATUS_COLORS = {available:["#dcfce7","#16a34a"],pending:["#fef3c7","#b45309"],pending_review:["#fef3c7","#b45309"],accepted:["#dcfce7","#16a34a"],countered:["#e0f2fe","#0369a1"],rejected:["#fee2e2","#ef4444"],in_transit:["#dbeafe","#1d4ed8"],completed:["#d1fae5","#047857"]};

// Default verification code for demo (not shown on UI)
export const DEFAULT_VERIFICATION_CODE = "000000";