"""Seed demo data on startup if the database is empty.

This runs every time the app starts. It checks whether an admin user exists;
if not, it inserts demo users, technician/recycler profiles, and waste listings.
This ensures the app works on Render's free tier where SQLite is wiped on restart.

SEED DATA SOURCE: Frontend demoData.js - preserving all 22 listings, 16 technicians,
15 facilities with exact same field values to maintain UI consistency.
"""

from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import (
    User, TechnicianProfile, RecyclerProfile, WasteListing,
    UserRole, VerificationStatus, MaterialType, WasteCondition, ListingStatus,
    Facility, Notification, ServiceRequest, ServiceRequestStatus,
)
from app.middleware.auth import hash_password


def seed_demo_data(db: Session) -> None:
    """Insert demo data only if the database is empty."""
    if db.query(User).first() is not None:
        return  # already seeded

    # ═══════════════════════════════════════════════════════════════════════
    # USERS - Based on frontend demoData.js USERS array
    # ═══════════════════════════════════════════════════════════════════════

    admin = User(
        full_name="RECYX Admin",
        email="admin@recyx.rw",
        password_hash=hash_password("Admin@123"),
        role=UserRole.admin,
        phone="+250 788 000 000",
        district="Kacyiru, Gasabo",
        is_verified=True,
        verification_status=VerificationStatus.approved,
        created_at=datetime(2026, 1, 1),
    )

    marie = User(
        full_name="Marie Uwase",
        email="marie@email.com",
        password_hash=hash_password("Marie@123"),
        role=UserRole.citizen,
        phone="+250 788 111 111",
        district="Kimironko, Gasabo",
        is_verified=True,
        verification_status=VerificationStatus.approved,
        created_at=datetime(2026, 1, 5),
    )

    jean_pierre = User(
        full_name="Jean-Pierre Habimana",
        email="jp@email.com",
        password_hash=hash_password("Jean@1234"),
        role=UserRole.technician,
        phone="+250 788 222 222",
        district="Remera, Gasabo",
        is_verified=True,
        verification_status=VerificationStatus.approved,
        created_at=datetime(2026, 1, 10),
    )

    enviroserve = User(
        full_name="Enviroserve Rwanda",
        email="enviro@recyx.rw",
        password_hash=hash_password("Enviro@123"),
        role=UserRole.recycler,
        phone="+250 788 333 333",
        district="Gikondo, Kicukiro",
        is_verified=True,
        verification_status=VerificationStatus.approved,
        created_at=datetime(2026, 1, 12),
    )

    joseph = User(
        full_name="Joseph Mugabo",
        email="joseph@email.com",
        password_hash=hash_password("Joseph@123"),
        role=UserRole.buyer,
        phone="+250 788 444 444",
        district="Muhima, Nyarugenge",
        is_verified=True,
        verification_status=VerificationStatus.approved,
        created_at=datetime(2026, 1, 15),
    )

    alice_tech = User(
        full_name="Alice Mukamana",
        email="alice@email.com",
        password_hash=hash_password("Alice@1234"),
        role=UserRole.technician,
        phone="+250 788 555 555",
        district="Niboye, Kicukiro",
        is_verified=True,
        verification_status=VerificationStatus.approved,
        created_at=datetime(2026, 1, 20),
    )

    eric = User(
        full_name="Eric Nshimiyimana",
        email="eric@email.com",
        password_hash=hash_password("Eric@12345"),
        role=UserRole.technician,
        phone="+250 788 666 666",
        district="Nyamirambo, Nyarugenge",
        is_verified=True,
        verification_status=VerificationStatus.approved,
        created_at=datetime(2026, 1, 22),
    )

    ecoplastic = User(
        full_name="Ecoplastic Ltd",
        email="eco@email.com",
        password_hash=hash_password("Eco@12345"),
        role=UserRole.recycler,
        phone="+250 788 777 777",
        district="Masaka, Kicukiro",
        is_verified=True,
        verification_status=VerificationStatus.approved,
        created_at=datetime(2026, 1, 25),
    )

    # Pending accounts (for admin demo)
    bernard = User(
        full_name="Bernard Twagiramungu",
        email="bernard@email.com",
        password_hash=hash_password("Bernard@1"),
        role=UserRole.technician,
        phone="+250 788 888 888",
        district="Gatsata, Gasabo",
        is_verified=False,
        verification_status=VerificationStatus.pending,
        created_at=datetime(2026, 2, 1),
    )

    claudine = User(
        full_name="Claudine Nyirahabimana",
        email="claudine@green.rw",
        password_hash=hash_password("Claudine1!"),
        role=UserRole.recycler,
        phone="+250 788 999 999",
        district="Kanombe, Kicukiro",
        is_verified=False,
        verification_status=VerificationStatus.pending,
        created_at=datetime(2026, 2, 5),
    )

    emmanuel = User(
        full_name="Emmanuel Rugamba",
        email="emmanuel@email.com",
        password_hash=hash_password("Emmanuel1!"),
        role=UserRole.technician,
        phone="+250 788 000 111",
        district="Kimisagara, Nyarugenge",
        is_verified=False,
        verification_status=VerificationStatus.pending,
        created_at=datetime(2026, 2, 10),
    )

    db.add_all([admin, marie, jean_pierre, enviroserve, joseph,
               alice_tech, eric, ecoplastic, bernard, claudine, emmanuel])
    db.flush()

    # ═══════════════════════════════════════════════════════════════════════
    # TECHNICIAN PROFILES - Based on frontend demoData.js TECHNICIANS array
    # ═══════════════════════════════════════════════════════════════════════

    technicians_data = [
        {"user_id": jean_pierre.user_id, "spec": "Smartphones & Tablets",
            "rating": 4.8, "jobs": 127, "exp": 6, "district": "Remera, Gasabo"},
        {"user_id": alice_tech.user_id, "spec": "Laptops & Computers",
            "rating": 4.6, "jobs": 89, "exp": 4, "district": "Niboye, Kicukiro"},
        {"user_id": eric.user_id, "spec": "Home Appliances", "rating": 4.9,
            "jobs": 203, "exp": 8, "district": "Nyamirambo, Nyarugenge"},
        {"user_id": 100, "spec": "TVs & Monitors", "rating": 4.3, "jobs": 45,
            "exp": 3, "district": "Gisozi, Gasabo"},  # Grace Uwimana
        {"user_id": 101, "spec": "Smartphones & Tablets", "rating": 4.7,
            "jobs": 78, "exp": 5, "district": "Maraba, Huye"},  # Patrick Bizimungu
        {"user_id": 102, "spec": "Laptops & Computers", "rating": 4.5,
            "jobs": 62, "exp": 4, "district": "Muhoza, Musanze"},  # Diane Ingabire
        {"user_id": 103, "spec": "Printers & Copiers", "rating": 4.4, "jobs": 56,
            "exp": 3, "district": "Kimisagara, Nyarugenge"},  # Fabrice Mugisha
        {"user_id": 104, "spec": "Smartphones & Tablets", "rating": 4.7, "jobs": 93,
            "exp": 5, "district": "Kacyiru, Gasabo"},  # Clarisse Uwamahoro
        {"user_id": 105, "spec": "Solar Panels & Inverters", "rating": 4.8,
            "jobs": 41, "exp": 7, "district": "Gisenyi, Rubavu"},  # Innocent Habimana
        {"user_id": 106, "spec": "Home Appliances", "rating": 4.2, "jobs": 34,
            "exp": 2, "district": "Nyamata, Bugesera"},  # Josiane Mukeshimana
        {"user_id": 107, "spec": "TVs & Monitors", "rating": 4.6, "jobs": 71,
            "exp": 4, "district": "Kabacuzi, Muhanga"},  # Emmanuel Nsanzimana
        {"user_id": 108, "spec": "Laptops & Computers", "rating": 4.5, "jobs": 48,
            "exp": 3, "district": "Rubengera, Karongi"},  # Sandrine Nikuze
        {"user_id": 109, "spec": "Smartphones & Tablets", "rating": 4.3, "jobs": 37,
            "exp": 3, "district": "Kabarondo, Kayonza"},  # Olivier Niyonzima
        {"user_id": 110, "spec": "Printers & Copiers", "rating": 4.1, "jobs": 22,
            "exp": 2, "district": "Gahini, Kayonza"},  # Aline Mukamurenzi
        {"user_id": 111, "spec": "Home Appliances", "rating": 4.9, "jobs": 115,
            "exp": 9, "district": "Kinigi, Musanze"},  # Theogene Ndagijimana
        {"user_id": 112, "spec": "Solar Panels & Inverters", "rating": 4.4, "jobs": 29,
            "exp": 3, "district": "Kibungo, Ngoma"},  # Vestine Nyiransabimana
    ]

    technician_names = {
        100: "Grace Uwimana",
        101: "Patrick Bizimungu",
        102: "Diane Ingabire",
        103: "Fabrice Mugisha",
        104: "Clarisse Uwamahoro",
        105: "Innocent Habimana",
        106: "Josiane Mukeshimana",
        107: "Emmanuel Nsanzimana",
        108: "Sandrine Nikuze",
        109: "Olivier Niyonzima",
        110: "Aline Mukamurenzi",
        111: "Theogene Ndagijimana",
        112: "Vestine Nyiransabimana",
    }

    technician_phones = {
        100: "+250 788 888 888",
        101: "+250 788 999 888",
        102: "+250 788 112 233",
        103: "+250 788 223 344",
        104: "+250 788 334 455",
        105: "+250 788 445 566",
        106: "+250 788 556 677",
        107: "+250 788 667 788",
        108: "+250 788 778 899",
        109: "+250 788 889 900",
        110: "+250 788 900 011",
        111: "+250 788 011 122",
        112: "+250 788 122 233",
    }

    # First create users for technicians that don't exist yet
    for i in range(100, 113):
        existing = db.query(User).filter(User.user_id == i).first()
        if not existing:
            tech_name = technician_names.get(i, f"Technician {i}")
            tech_user = User(
                user_id=i,
                full_name=tech_name,
                email=f"tech{i}@email.com",
                password_hash=hash_password(f"Tech{i}@123"),
                role=UserRole.technician,
                phone=technician_phones.get(i, "+250 788 000 000"),
                district=next(
                    (t["district"] for t in technicians_data if t["user_id"] == i), "Kigali"),
                is_verified=True,
                verification_status=VerificationStatus.approved,
                created_at=datetime(2026, 1, 1),
            )
            db.add(tech_user)

    db.flush()

    # Now create technician profiles
    for tech_data in technicians_data:
        # Use the actual user_id from db if it was created above
        user_id = tech_data["user_id"]

        # Try to find the user
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            # Skip if no user found
            continue

        # Get name from the user's full_name
        full_name = user.full_name
        avatar = ''.join([n[0] for n in full_name.split()[:2]]).upper()

        tech_profile = TechnicianProfile(
            user_id=user_id,
            specialisation=tech_data["spec"],
            years_experience=tech_data["exp"],
            verification_status=VerificationStatus.approved,
            average_rating=tech_data["rating"],
            total_jobs=tech_data["jobs"],
            location_lat=-1.940 + (hash(str(user_id)) % 100) / 1000,
            location_lng=30.060 + (hash(str(user_id)) % 100) / 1000,
        )
        db.add(tech_profile)

    # ═══════════════════════════════════════════════════════════════════════
    # RECYCLER PROFILES - Based on demoData.js
    # ═══════════════════════════════════════════════════════════════════════

    recyclers_data = [
        {"user_id": enviroserve.user_id, "company": "Enviroserve Rwanda",
            "materials": "Electronics, Metal", "district": "Gikondo, Kicukiro", "lat": -1.935, "lng": 30.082},
        {"user_id": ecoplastic.user_id, "company": "Ecoplastic Ltd", "materials": "Plastic, PET",
            "district": "Masaka, Kicukiro", "lat": -1.968, "lng": 30.105},
    ]

    for rec_data in recyclers_data:
        recycler_profile = RecyclerProfile(
            user_id=rec_data["user_id"],
            company_name=rec_data["company"],
            accepted_materials=rec_data["materials"],
            capacity_kg_per_month=5000,
            district=rec_data["district"],
            operating_hours="Mon–Fri 08:00–17:00",
            location_lat=rec_data["lat"],
            location_lng=rec_data["lng"],
        )
        db.add(recycler_profile)

    db.flush()

    # ═══════════════════════════════════════════════════════════════════════
    # WASTE LISTINGS - Based on frontend demoData.js LISTINGS array (22 items)
    # ═══════════════════════════════════════════════════════════════════════

    listings_data = [
        {"seller_id": 2, "material": "electronics", "qty": 25, "condition": "repairable", "title": "Office Desktop Computers (5 units)", "description": "Old Dell Optiplex desktops and keyboards from corporate office clearout. All power on but run slow - perfect for refurbishing or parts. Includes 3 monitors.",
         "sector": "Kimironko, Gasabo", "status": "available", "price": 75000, "date": "2026-03-01", "views": 148, "favorites": 12, "image": "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=500&h=350&fit=crop"},
        {"seller_id": 2, "material": "plastic", "qty": 150, "condition": "scrap", "title": "PET Bottles Collection - 150kg Sorted",
            "description": "Clean PET bottles collected over 3 months from Kimironko market. Sorted by color (clear, green, blue). Compressed and bagged.", "sector": "Kimironko, Gasabo", "status": "available", "price": 22500, "date": "2026-03-03", "views": 312, "favorites": 28, "image": "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=500&h=350&fit=crop"},
        {"seller_id": 5, "material": "metal", "qty": 80, "condition": "scrap", "title": "Aluminium Scrap from Construction Site", "description": "Window frames, door handles, and metal offcuts from completed construction project. Mixed aluminium and steel, ~80kg.",
            "sector": "Muhima, Nyarugenge", "status": "available", "price": 48000, "date": "2026-02-28", "views": 167, "favorites": 9, "image": "https://tse3.mm.bing.net/th/id/OIP.nK579PDOfKE8Hh9Ae1FOYwHaGL?rs=1&pid=ImgDetMain&o=7&rm=3"},
        {"seller_id": 2, "material": "electronics", "qty": 12, "condition": "functional", "title": "Samsung Galaxy Phones (12 units)", "description": "Working Galaxy J5 and A10 series. All batteries hold charge 6+ hours. Some light screen scratches. Great for bulk resale.",
         "sector": "Remera, Gasabo", "status": "available", "price": 180000, "date": "2026-03-05", "views": 503, "favorites": 47, "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=350&fit=crop"},
        {"seller_id": 5, "material": "glass", "qty": 200, "condition": "scrap", "title": "Restaurant Glass Bottles - Sorted & Cleaned", "description": "200kg of glass bottles from 3 restaurants. Sorted by color. Washed and labels removed.",
            "sector": "Gikondo, Kicukiro", "status": "pending_review", "price": 30000, "date": "2026-03-06", "views": 0, "favorites": 0, "image": "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=500&h=350&fit=crop"},
        {"seller_id": 2, "material": "paper", "qty": 300, "condition": "scrap", "title": "Office Paper & Cardboard - 300kg Bulk", "description": "Mixed office A4, newspapers, magazines, flattened cardboard. Stored dry indoors.",
            "sector": "Kacyiru, Gasabo", "status": "available", "price": 15000, "date": "2026-03-04", "views": 89, "favorites": 5, "image": "https://images.unsplash.com/photo-1568667256549-094345857637?w=500&h=350&fit=crop"},
        {"seller_id": 8, "material": "plastic", "qty": 500, "condition": "scrap", "title": "Industrial HDPE Containers - 500kg", "description": "Large HDPE industrial containers and drums. Previously food-grade. Clean condition.",
            "sector": "Masaka, Kicukiro", "status": "available", "price": 75000, "date": "2026-03-08", "views": 78, "favorites": 11, "image": "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500&h=350&fit=crop"},
        {"seller_id": 4, "material": "electronics", "qty": 50, "condition": "scrap", "title": "Circuit Boards & E-Waste Components", "description": "Mixed circuit boards, cables, electronic components. Contains recoverable precious metals.",
            "sector": "Gikondo, Kicukiro", "status": "available", "price": 120000, "date": "2026-03-07", "views": 234, "favorites": 19, "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=350&fit=crop"},
        {"seller_id": 2, "material": "metal", "qty": 120, "condition": "scrap", "title": "Copper Wire Scrap - 120kg", "description": "Stripped copper wire from electrical installations. High-grade, minimal insulation.",
            "sector": "Gisozi, Gasabo", "status": "available", "price": 240000, "date": "2026-03-09", "views": 421, "favorites": 35, "image": "https://images.unsplash.com/photo-1567393528677-d6adae7d4a0a?w=500&h=350&fit=crop"},
        {"seller_id": 5, "material": "electronics", "qty": 8, "condition": "functional", "title": "HP LaserJet Printers (8 units)", "description": "Working HP LaserJet Pro printers. All print correctly. Includes partial toner.",
         "sector": "Muhima, Nyarugenge", "status": "available", "price": 320000, "date": "2026-03-10", "views": 156, "favorites": 14, "image": "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500&h=350&fit=crop"},
        {"seller_id": 4, "material": "plastic", "qty": 250, "condition": "scrap", "title": "Mixed Plastic Waste - Warehouse Clearout", "description": "Assorted plastic packaging, containers, film. Unsorted but clean. ~250kg.",
            "sector": "Gikondo, Kicukiro", "status": "available", "price": 20000, "date": "2026-03-08", "views": 67, "favorites": 4, "image": "https://images.unsplash.com/photo-1591193686104-fddba4d0e4d8?w=500&h=350&fit=crop"},
        {"seller_id": 2, "material": "electronics", "qty": 20, "condition": "repairable", "title": "Laptop Lot - Mixed Brands (20 units)", "description": "Dell, HP, Lenovo laptops from school IT upgrade. Most boot but need battery/screen work.",
         "sector": "Kimironko, Gasabo", "status": "available", "price": 400000, "date": "2026-03-11", "views": 678, "favorites": 52, "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=350&fit=crop"},
        {"seller_id": 8, "material": "metal", "qty": 200, "condition": "scrap", "title": "Steel Beams & Rebar - Construction", "description": "Leftover steel I-beams and rebar from completed building. Various sizes.",
            "sector": "Nyarugunga, Kicukiro", "status": "available", "price": 180000, "date": "2026-03-07", "views": 93, "favorites": 8, "image": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&h=350&fit=crop"},
        {"seller_id": 5, "material": "paper", "qty": 150, "condition": "scrap", "title": "Newspaper & Magazine Collection - 150kg", "description": "Bundled newspapers and magazines from offices. Sorted in 10kg bundles. Clean.",
            "sector": "Gitega, Nyarugenge", "status": "available", "price": 12000, "date": "2026-03-06", "views": 43, "favorites": 2, "image": "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=500&h=350&fit=crop"},
        {"seller_id": 2, "material": "electronics", "qty": 30, "condition": "scrap", "title": "CRT Monitors & Old TVs (30 units)", "description": "Old CRT monitors and TVs. Non-functional. Contain recyclable glass, copper, metals.",
         "sector": "Remera, Gasabo", "status": "available", "price": 45000, "date": "2026-03-12", "views": 112, "favorites": 6, "image": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&h=350&fit=crop"},
        {"seller_id": 4, "material": "glass", "qty": 300, "condition": "scrap", "title": "Industrial Glass Panes - Damaged", "description": "Broken/cracked glass panes from commercial renovation. 300kg. Sorted by thickness.", "sector": "Gatenga, Kicukiro",
            "status": "available", "price": 25000, "date": "2026-03-09", "views": 38, "favorites": 3, "image": "https://media.istockphoto.com/id/1412395712/photo/broken-industrial-reinforced-glass-window.jpg?s=170667a&w=0&k=20&c=RhNKgNeXpyEgts-PBFd99VfWuucks8nv0HDKACUTi0s="},
        {"seller_id": 5, "material": "mixed", "qty": 400, "condition": "scrap", "title": "Office Clearout - Mixed Materials 400kg", "description": "Complete office clearout: furniture parts, electronics, paper, plastics. Unsorted.",
            "sector": "Muhima, Nyarugenge", "status": "available", "price": 35000, "date": "2026-03-10", "views": 187, "favorites": 15, "image": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500&h=350&fit=crop"},
        {"seller_id": 8, "material": "plastic", "qty": 80, "condition": "functional", "title": "Used Water Tanks (5 units) - 1000L each", "description": "Used HDPE water tanks. 1000L each. Minor scratches, no leaks. Rainwater harvesting.",
         "sector": "Masaka, Kicukiro", "status": "available", "price": 150000, "date": "2026-03-11", "views": 256, "favorites": 22, "image": "https://tse4.mm.bing.net/th/id/OIP.lY_-hfIzWYociTYF5TviIQHaFj?rs=1&pid=ImgDetMain&o=7&rm=3"},
        {"seller_id": 2, "material": "electronics", "qty": 15, "condition": "functional", "title": "iPad Mini Collection (15 units)", "description": "iPad Mini 2nd/3rd gen. All working, some cracked screens. Batteries 4+ hours.",
         "sector": "Kacyiru, Gasabo", "status": "available", "price": 450000, "date": "2026-03-13", "views": 834, "favorites": 68, "image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=350&fit=crop"},
        {"seller_id": 4, "material": "metal", "qty": 50, "condition": "scrap", "title": "Aluminium Cans - 50kg Crushed", "description": "Crushed aluminium beverage cans from events and restaurants. Clean, compressed.",
            "sector": "Gikondo, Kicukiro", "status": "available", "price": 35000, "date": "2026-03-12", "views": 145, "favorites": 10, "image": "https://tse2.mm.bing.net/th/id/OIP.Zb4ifpcIzcxtu0U8fbdVWAHaE7?rs=1&pid=ImgDetMain&o=7&rm=3"},
        {"seller_id": 5, "material": "electronics", "qty": 6, "condition": "functional", "title": "Office Projectors (6 units) - Working", "description": "Epson and BenQ projectors. All project clearly. With cables and remotes.", "sector": "Muhima, Nyarugenge",
         "status": "available", "price": 360000, "date": "2026-03-14", "views": 198, "favorites": 16, "image": "https://www.nashua.co.za/wp-content/uploads/2023/11/pan-shot-empty-office-with-projector-middle-conference-desk-1349x900.jpg"},
        {"seller_id": 2, "material": "paper", "qty": 500, "condition": "scrap", "title": "Cardboard Boxes - 500kg Flattened", "description": "Large flattened cardboard shipping boxes from warehouse. Clean, dry, on pallets.",
            "sector": "Kimironko, Gasabo", "status": "available", "price": 25000, "date": "2026-03-13", "views": 76, "favorites": 7, "image": "https://tse1.explicit.bing.net/th/id/OIP.Y6UN1Hq1w96CDUNh95UFhAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"},
    ]

    # Map material strings to MaterialType enum
    material_map = {
        "electronics": MaterialType.electronics,
        "plastic": MaterialType.plastic,
        "metal": MaterialType.metal,
        "paper": MaterialType.paper,
        "glass": MaterialType.glass,
        "mixed": MaterialType.mixed,
    }

    # Map condition strings to WasteCondition enum
    condition_map = {
        "functional": WasteCondition.functional,
        "repairable": WasteCondition.repairable,
        "scrap": WasteCondition.scrap,
    }

    # Map status strings to ListingStatus enum
    status_map = {
        "available": ListingStatus.available,
        "pending_review": ListingStatus.pending_review,
        "pending": ListingStatus.pending_review,
    }

    for lst in listings_data:
        # Parse the date
        try:
            created_date = datetime.strptime(lst["date"], "%Y-%m-%d")
        except:
            created_date = datetime(2026, 3, 1)

        listing = WasteListing(
            posted_by=lst["seller_id"],
            material_type=material_map.get(
                lst["material"], MaterialType.other),
            quantity_kg=lst["qty"],
            condition=condition_map.get(
                lst["condition"], WasteCondition.scrap),
            title=lst["title"],
            description=lst["description"],
            district=lst["sector"].split(
                ", ")[-1] if ", " in lst["sector"] else lst["sector"],
            sector=lst["sector"],
            status=status_map.get(lst["status"], ListingStatus.available),
            price=lst["price"],
            views=lst["views"],
            favorites=lst["favorites"],
            image=lst["image"],
            created_at=created_date,
            payment_method="mtn",
            payment_number="+250 788 000 000",
        )
        db.add(listing)

    db.flush()

    # ═══════════════════════════════════════════════════════════════════════
    # FACILITIES - Based on frontend demoData.js MAP_FACILITIES array (15)
    # ═══════════════════════════════════════════════════════════════════════

    facilities_data = [
        {"name": "Enviroserve Rwanda", "type": "recycler", "lat": -1.935, "lng": 30.082,
            "materials": "Electronics, Metal", "sector": "Gikondo, Kicukiro"},
        {"name": "Ecoplastic Ltd", "type": "recycler", "lat": -1.968,
            "lng": 30.105, "materials": "Plastic, PET", "sector": "Masaka, Kicukiro"},
        {"name": "Kigali Tech Repairs", "type": "repair", "lat": -1.950,
            "lng": 30.060, "materials": None, "sector": "Kimisagara, Nyarugenge"},
        {"name": "Rwanda Metal Works", "type": "recycler", "lat": -1.943,
            "lng": 30.092, "materials": "Metal, Aluminium", "sector": "Remera, Gasabo"},
        {"name": "MTN Service Centre", "type": "repair", "lat": -1.955,
            "lng": 30.075, "materials": None, "sector": "Muhima, Nyarugenge"},
        {"name": "Green Collection Hub", "type": "collection", "lat": -1.962,
            "lng": 30.118, "materials": None, "sector": "Kanombe, Kicukiro"},
        {"name": "Papyrus Paper Recycling", "type": "recycler", "lat": -1.938,
            "lng": 30.100, "materials": "Paper, Cardboard", "sector": "Kimironko, Gasabo"},
        {"name": "Kimironko Collection Point", "type": "collection", "lat": -
            1.940, "lng": 30.110, "materials": None, "sector": "Kimironko, Gasabo"},
        {"name": "Samsung Authorized Service", "type": "repair", "lat": -1.948,
            "lng": 30.064, "materials": None, "sector": "Muhima, Nyarugenge"},
        {"name": "Kigali Glass Recyclers", "type": "recycler", "lat": -1.960,
            "lng": 30.088, "materials": "Glass", "sector": "Gatenga, Kicukiro"},
        {"name": "Rubavu E-Waste Centre", "type": "recycler", "lat": -1.680,
            "lng": 29.320, "materials": "Electronics", "sector": "Gisenyi, Rubavu"},
        {"name": "Huye Repair Hub", "type": "repair", "lat": -2.590,
            "lng": 29.740, "materials": None, "sector": "Tumba, Huye"},
        {"name": "Musanze Green Centre", "type": "recycler", "lat": -1.500, "lng": 29.630,
            "materials": "Electronics, Plastic", "sector": "Muhoza, Musanze"},
        {"name": "Nyamirambo Fix-It Shop", "type": "repair", "lat": -1.975,
            "lng": 30.045, "materials": None, "sector": "Nyamirambo, Nyarugenge"},
        {"name": "Gisozi Recycling Depot", "type": "collection", "lat": -
            1.920, "lng": 30.065, "materials": None, "sector": "Gisozi, Gasabo"},
    ]

    for fac in facilities_data:
        facility = Facility(
            name=fac["name"],
            facility_type=fac["type"],
            latitude=fac["lat"],
            longitude=fac["lng"],
            materials=fac["materials"],
            sector=fac["sector"],
        )
        db.add(facility)

    db.flush()

    # ═══════════════════════════════════════════════════════════════════════
    # NOTIFICATIONS - Based on frontend demoData.js NOTIFICATIONS array
    # ═══════════════════════════════════════════════════════════════════════

    notifications_data = [
        {"user_id": 2, "message": "New offer: 70,000 RWF on Desktop Computers from Joseph Mugabo",
            "read": False, "date": "2026-03-07", "type": "offer", "listing_id": 1},
        {"user_id": 2, "message": "New offer: 60,000 RWF on Desktop Computers from Enviroserve",
            "read": False, "date": "2026-03-07", "type": "offer", "listing_id": 1},
        {"user_id": 4, "message": "Counter-offer received: 22,000 RWF on PET Bottles",
            "read": False, "date": "2026-03-06", "type": "counter", "listing_id": 2},
        {"user_id": 1, "message": "New technician: Bernard Twagiramungu - requires your approval",
            "read": False, "date": "2026-03-09", "type": "admin"},
        {"user_id": 1, "message": "New recycler: GreenRwanda Recycling - requires your approval",
            "read": False, "date": "2026-03-08", "type": "admin"},
        {"user_id": 1,
            "message": "Listing pending: Restaurant Glass Bottles (200kg)", "read": False, "date": "2026-03-06", "type": "admin"},
        {"user_id": 5, "message": "Your offer of 45,000 RWF on Aluminium Scrap was accepted! Set up payment.",
            "read": False, "date": "2026-03-04", "type": "payment", "listing_id": 3},
        {"user_id": 5, "message": "Transaction completed: HDPE Containers - 65,000 RWF",
            "read": True, "date": "2026-03-10", "type": "completed"},
        {"user_id": 2, "message": "Counter-offer: 170,000 RWF for Samsung Galaxy Phones",
            "read": False, "date": "2026-03-08", "type": "counter", "listing_id": 4},
        {"user_id": 2, "message": "New offer: 200,000 RWF on Copper Wire from Enviroserve",
            "read": False, "date": "2026-03-10", "type": "offer", "listing_id": 9},
    ]

    for notif in notifications_data:
        try:
            created_date = datetime.strptime(notif["date"], "%Y-%m-%d")
        except:
            created_date = datetime(2026, 3, 1)

        notification = Notification(
            user_id=notif["user_id"],
            type=notif["type"],
            message=notif["message"],
            is_read=notif["read"],
            created_at=created_date,
        )
        db.add(notification)

    db.flush()

    # ═══════════════════════════════════════════════════════════════════════
    # SERVICE REQUESTS - Based on frontend mockService.js DEMO_SERVICE_REQUESTS
    # ═══════════════════════════════════════════════════════════════════════

    service_requests_data = [
        {"tech_id": 3, "user_id": 2, "user_name": "Marie Uwase", "device": "Smartphone", "problem": "Screen cracked and touch not working",
            "date": "2026-03-15", "time": "10:00", "status": "pending", "contact": "+250 788 111 111"},
        {"tech_id": 7, "user_id": 5, "user_name": "Joseph Mugabo", "device": "Home Appliance", "problem": "Washing machine not draining",
            "date": "2026-03-16", "time": "14:00", "status": "confirmed", "contact": "+250 788 444 444"},
        {"tech_id": 6, "user_id": 2, "user_name": "Marie Uwase", "device": "Laptop", "problem": "Won't boot, BIOS error",
            "date": "2026-03-14", "time": "09:00", "status": "completed", "contact": "+250 788 111 111"},
    ]

    for req in service_requests_data:
        try:
            scheduled = datetime.strptime(req["date"], "%Y-%m-%d")
        except:
            scheduled = datetime(2026, 3, 15)

        service_req = ServiceRequest(
            citizen_id=req["user_id"],
            technician_id=req["tech_id"],
            device_type=req["device"],
            issue_description=req["problem"],
            status=ServiceRequestStatus.pending,
            scheduled_date=scheduled,
        )
        db.add(service_req)

    db.commit()
    print(
        f"✓ Seeded demo data: {db.query(User).count()} users, {db.query(WasteListing).count()} listings, {db.query(Facility).count()} facilities")
