from database import engine, SessionLocal
import models


# Full LRT-1 station list (25 stations)
# Order matches official LRMC fare matrix columns/rows
LRT1_STATIONS = [
    "Dr. Santos", "Ninoy Aquino Avenue", "PITX", "MIA Road",
    "Redemptorist-Aseana", "Baclaran", "EDSA", "Libertad",
    "Gil Puyat", "Vito Cruz", "Quirino", "Pedro Gil",
    "UN Avenue", "Central", "Carriedo", "D. Jose",
    "Bambang", "Tayuman", "Blumentritt", "Abad Santos",
    "R. Papa", "5th Avenue", "Monumento", "Balintawak",
    "Fernando Poe Jr."
]

# Official LRT-1 SJT fare matrix (Effective April 2, 2025)
# Source: LRMC official Single Journey Fare Matrix image
SJT_MATRIX = [
#   DrS  NAA  PTX  MIA  R-A  Bac  EDS  Lib   GP   VC  Qui   PG   UN  Cen  Car   DJ  Bam  Tay  Blu   AS   RP  5th  Mon  Bal  FPJ
    [  0,  20,  20,  25,  25,  30,  30,  30,  30,  35,  35,  35,  35,  40,  40,  40,  40,  40,  45,  45,  45,  45,  50,  50,  55],  # Dr. Santos
    [ 20,   0,  20,  20,  25,  25,  25,  30,  30,  30,  30,  35,  35,  35,  35,  40,  40,  40,  40,  40,  45,  45,  45,  50,  50],  # NAA
    [ 20,  20,   0,  20,  20,  25,  25,  25,  25,  30,  30,  30,  30,  35,  35,  35,  35,  40,  40,  40,  40,  40,  45,  45,  50],  # PITX
    [ 25,  20,  20,   0,  20,  20,  20,  25,  25,  25,  30,  30,  30,  35,  35,  35,  35,  35,  40,  40,  40,  40,  45,  45,  50],  # MIA Road
    [ 25,  25,  20,  20,   0,  20,  20,  20,  25,  25,  25,  30,  30,  30,  35,  35,  35,  35,  35,  35,  40,  40,  40,  45,  45],  # R-A
    [ 30,  25,  25,  20,  20,   0,  20,  20,  20,  25,  25,  25,  25,  30,  30,  30,  30,  30,  35,  35,  35,  35,  40,  40,  45],  # Baclaran
    [ 30,  25,  25,  20,  20,  20,   0,  20,  20,  20,  25,  25,  25,  30,  30,  30,  30,  30,  30,  35,  35,  35,  40,  40,  40],  # EDSA
    [ 30,  30,  25,  25,  20,  20,  20,   0,  20,  20,  20,  25,  25,  25,  30,  30,  30,  30,  30,  35,  35,  35,  35,  40,  40],  # Libertad
    [ 30,  30,  25,  25,  25,  20,  20,  20,   0,  20,  20,  20,  25,  25,  25,  30,  30,  30,  30,  30,  30,  35,  35,  40,  40],  # Gil Puyat
    [ 35,  30,  30,  25,  25,  25,  20,  20,  20,   0,  20,  20,  20,  25,  25,  25,  25,  30,  30,  30,  30,  30,  35,  35,  40],  # Vito Cruz
    [ 35,  30,  30,  30,  25,  25,  25,  20,  20,  20,   0,  20,  20,  20,  25,  25,  25,  25,  30,  30,  30,  30,  35,  35,  40],  # Quirino
    [ 35,  35,  30,  30,  30,  25,  25,  25,  20,  20,  20,   0,  20,  20,  20,  25,  25,  25,  25,  30,  30,  30,  30,  35,  35],  # Pedro Gil
    [ 35,  35,  30,  30,  30,  25,  25,  25,  25,  20,  20,  20,   0,  20,  20,  20,  25,  25,  25,  25,  25,  30,  30,  35,  35],  # UN Avenue
    [ 40,  35,  35,  35,  30,  30,  30,  25,  25,  25,  20,  20,  20,   0,  20,  20,  20,  20,  25,  25,  25,  25,  30,  30,  35],  # Central
    [ 40,  35,  35,  35,  35,  30,  30,  30,  25,  25,  25,  20,  20,  20,   0,  20,  20,  20,  20,  25,  25,  25,  25,  30,  30],  # Carriedo
    [ 40,  40,  35,  35,  35,  30,  30,  30,  30,  25,  25,  25,  20,  20,  20,   0,  20,  20,  20,  20,  25,  25,  25,  30,  30],  # D. Jose
    [ 40,  40,  35,  35,  35,  30,  30,  30,  30,  25,  25,  25,  25,  20,  20,  20,   0,  20,  20,  20,  20,  25,  25,  30,  30],  # Bambang
    [ 40,  40,  40,  35,  35,  30,  30,  30,  30,  30,  25,  25,  25,  20,  20,  20,  20,   0,  20,  20,  20,  20,  25,  25,  30],  # Tayuman
    [ 45,  40,  40,  40,  35,  35,  30,  30,  30,  30,  30,  25,  25,  25,  20,  20,  20,  20,   0,  20,  20,  20,  25,  25,  30],  # Blumentritt
    [ 45,  40,  40,  40,  35,  35,  35,  35,  30,  30,  30,  30,  25,  25,  25,  20,  20,  20,  20,   0,  20,  20,  20,  25,  30],  # Abad Santos
    [ 45,  45,  40,  40,  40,  35,  35,  35,  30,  30,  30,  30,  25,  25,  25,  25,  20,  20,  20,  20,   0,  20,  20,  25,  25],  # R. Papa
    [ 45,  45,  40,  40,  40,  35,  35,  35,  35,  30,  30,  30,  30,  25,  25,  25,  25,  20,  20,  20,  20,   0,  20,  20,  25],  # 5th Avenue
    [ 50,  45,  45,  45,  40,  40,  40,  35,  35,  35,  35,  30,  30,  30,  25,  25,  25,  25,  25,  20,  20,  20,   0,  20,  25],  # Monumento
    [ 50,  50,  45,  45,  45,  40,  40,  40,  40,  35,  35,  35,  35,  30,  30,  30,  30,  25,  25,  25,  25,  20,  20,   0,  20],  # Balintawak
    [ 55,  50,  50,  50,  45,  45,  40,  40,  40,  40,  40,  35,  35,  35,  30,  30,  30,  30,  30,  30,  25,  25,  25,  20,   0],  # FPJ
]

# Official LRT-1 SVC/Beep Card fare matrix (Effective April 2, 2025)
# Source: LRMC official Stored Value Fare Matrix image
SVC_MATRIX = [
#   DrS  NAA  PTX  MIA  R-A  Bac  EDS  Lib   GP   VC  Qui   PG   UN  Cen  Car   DJ  Bam  Tay  Blu   AS   RP  5th  Mon  Bal  FPJ
    [ 16,  19,  20,  22,  23,  26,  27,  28,  29,  31,  32,  33,  34,  36,  37,  38,  39,  40,  41,  42,  43,  45,  46,  49,  52],  # Dr. Santos
    [ 19,  16,  18,  20,  21,  23,  24,  26,  27,  28,  29,  31,  32,  33,  35,  36,  37,  38,  40,  41,  42,  44,  44,  47,  50],  # NAA
    [ 20,  18,  16,  18,  19,  22,  22,  24,  25,  27,  28,  29,  30,  32,  33,  34,  35,  36,  37,  38,  39,  40,  42,  45,  48],  # PITX
    [ 22,  20,  18,  16,  17,  20,  20,  22,  23,  25,  26,  27,  28,  30,  31,  32,  33,  34,  35,  37,  38,  40,  43,  46,  48],  # MIA Road
    [ 23,  21,  19,  17,  16,  18,  19,  21,  22,  23,  25,  26,  27,  29,  30,  31,  32,  33,  34,  35,  36,  37,  40,  43,  45],  # R-A
    [ 26,  23,  22,  20,  18,  16,  17,  19,  20,  21,  22,  24,  25,  27,  28,  29,  30,  31,  33,  34,  35,  37,  40,  43,  43],  # Baclaran
    [ 27,  24,  22,  20,  19,  17,  16,  18,  19,  20,  22,  23,  24,  26,  27,  28,  29,  30,  31,  32,  32,  33,  37,  39,  42],  # EDSA
    [ 28,  26,  24,  22,  21,  19,  18,  16,  17,  19,  20,  21,  23,  24,  25,  26,  27,  28,  29,  30,  31,  32,  33,  37,  39],  # Libertad
    [ 29,  27,  25,  23,  22,  20,  19,  17,  16,  18,  19,  20,  21,  23,  24,  25,  26,  27,  28,  29,  30,  32,  33,  37,  38],  # Gil Puyat
    [ 31,  28,  27,  25,  23,  21,  20,  19,  18,  16,  17,  19,  20,  21,  23,  24,  25,  26,  28,  29,  30,  31,  34,  37,  38],  # Vito Cruz
    [ 32,  29,  28,  26,  25,  22,  22,  20,  19,  17,  16,  17,  19,  20,  21,  22,  23,  24,  25,  27,  28,  29,  31,  34,  37],  # Quirino
    [ 33,  31,  29,  27,  26,  24,  23,  21,  20,  19,  17,  16,  17,  19,  20,  21,  22,  23,  24,  25,  27,  28,  30,  32,  34],  # Pedro Gil
    [ 34,  32,  30,  28,  27,  25,  24,  23,  21,  20,  19,  17,  16,  18,  19,  20,  21,  22,  23,  24,  25,  27,  28,  30,  33],  # UN Avenue
    [ 36,  33,  32,  30,  29,  27,  26,  24,  23,  21,  20,  19,  18,  16,  17,  18,  19,  20,  21,  23,  24,  25,  27,  29,  31],  # Central
    [ 37,  35,  33,  31,  30,  28,  27,  25,  24,  23,  21,  20,  19,  17,  16,  17,  18,  19,  20,  21,  22,  24,  25,  27,  30],  # Carriedo
    [ 38,  36,  34,  32,  31,  29,  28,  26,  25,  24,  22,  21,  20,  18,  17,  16,  17,  18,  19,  20,  21,  23,  24,  26,  29],  # D. Jose
    [ 39,  37,  35,  33,  32,  30,  29,  27,  26,  25,  23,  22,  21,  19,  18,  17,  16,  17,  18,  19,  20,  22,  23,  25,  28],  # Bambang
    [ 40,  38,  36,  34,  33,  31,  30,  28,  27,  26,  24,  23,  22,  20,  19,  18,  17,  16,  17,  18,  20,  21,  23,  24,  27],  # Tayuman
    [ 41,  40,  37,  35,  34,  33,  31,  29,  28,  28,  25,  24,  23,  21,  20,  19,  18,  17,  16,  17,  19,  20,  22,  22,  26],  # Blumentritt
    [ 42,  41,  38,  37,  35,  34,  32,  30,  29,  29,  27,  25,  24,  23,  21,  20,  19,  18,  17,  16,  17,  18,  20,  21,  24],  # Abad Santos
    [ 43,  42,  39,  38,  36,  35,  32,  31,  30,  30,  28,  27,  25,  24,  22,  21,  20,  20,  19,  17,  16,  17,  19,  19,  22],  # R. Papa
    [ 45,  44,  40,  40,  37,  37,  33,  32,  32,  31,  29,  28,  27,  25,  24,  23,  22,  21,  20,  18,  17,  16,  18,  16,  19],  # 5th Avenue
    [ 46,  44,  42,  43,  40,  40,  37,  33,  33,  34,  31,  30,  28,  27,  25,  24,  23,  23,  22,  20,  19,  18,  16,  20,  22],  # Monumento
    [ 49,  47,  45,  46,  43,  43,  39,  37,  37,  37,  34,  32,  30,  29,  27,  26,  25,  24,  22,  21,  19,  16,  20,  16,  19],  # Balintawak
    [ 52,  50,  48,  48,  45,  43,  42,  39,  38,  38,  37,  34,  33,  31,  30,  29,  28,  27,  26,  24,  22,  19,  22,  19,  16],  # FPJ
]

# ====================== LRT-2 (13 stations) ======================
LRT2_STATIONS = [
    "Recto", "Legarda", "Pureza", "V. Mapa", "J. Ruiz",
    "Gilmore", "Betty Go", "Cubao", "Anonas", "Katipunan",
    "Santolan", "Marikina", "Antipolo"
]

# Official LRT-2 SJT fare matrix (Effective August 2, 2023)
SJT_LRT2 = [
#   Rec Leg Pur VMa JRu Gil BGo Cub Ano Kat San Mar Ant
    [ 0, 15, 20, 20, 20, 25, 25, 25, 25, 30, 30, 35, 35],  # Recto
    [15,  0, 15, 20, 20, 20, 25, 25, 25, 25, 30, 30, 35],  # Legarda
    [20, 15,  0, 15, 20, 20, 20, 20, 25, 25, 30, 30, 30],  # Pureza
    [20, 20, 15,  0, 15, 20, 20, 20, 20, 25, 25, 30, 30],  # V. Mapa
    [20, 20, 20, 15,  0, 15, 20, 20, 20, 20, 25, 25, 30],  # J. Ruiz
    [25, 20, 20, 20, 15,  0, 15, 20, 20, 20, 25, 25, 30],  # Gilmore
    [25, 25, 20, 20, 20, 15,  0, 15, 20, 20, 20, 25, 25],  # Betty Go
    [25, 25, 20, 20, 20, 20, 15,  0, 15, 20, 20, 25, 25],  # Cubao
    [25, 25, 25, 20, 20, 20, 20, 15,  0, 15, 20, 20, 25],  # Anonas
    [30, 25, 25, 25, 20, 20, 20, 20, 15,  0, 20, 20, 25],  # Katipunan
    [30, 30, 30, 25, 25, 25, 20, 20, 20, 20,  0, 15, 20],  # Santolan
    [35, 30, 30, 30, 25, 25, 25, 25, 20, 20, 15,  0, 20],  # Marikina
    [35, 35, 30, 30, 30, 30, 25, 25, 25, 25, 20, 20,  0],  # Antipolo
]

# Official LRT-2 SVC/Beep Card fare matrix (Effective August 2, 2023)
SVC_LRT2 = [
#   Rec Leg Pur VMa JRu Gil BGo Cub Ano Kat San Mar Ant
    [ 0, 15, 16, 18, 19, 21, 22, 23, 25, 26, 28, 31, 33],  # Recto
    [15,  0, 15, 17, 18, 19, 21, 22, 24, 25, 27, 29, 32],  # Legarda
    [16, 15,  0, 15, 16, 18, 19, 20, 22, 23, 26, 28, 30],  # Pureza
    [18, 17, 15,  0, 15, 16, 17, 19, 20, 22, 24, 26, 29],  # V. Mapa
    [19, 18, 16, 15,  0, 15, 16, 17, 19, 20, 22, 24, 27],  # J. Ruiz
    [21, 19, 18, 16, 15,  0, 15, 16, 18, 19, 21, 23, 26],  # Gilmore
    [22, 21, 19, 17, 16, 15,  0, 15, 16, 18, 20, 22, 25],  # Betty Go
    [23, 22, 20, 19, 17, 16, 15,  0, 15, 16, 19, 21, 23],  # Cubao
    [25, 24, 22, 20, 19, 18, 16, 15,  0, 15, 17, 19, 22],  # Anonas
    [26, 25, 23, 22, 20, 19, 18, 16, 15,  0, 16, 18, 21],  # Katipunan
    [28, 27, 26, 24, 22, 21, 20, 19, 17, 16,  0, 15, 18],  # Santolan
    [31, 29, 28, 26, 24, 23, 22, 21, 19, 18, 15,  0, 16],  # Marikina
    [33, 32, 30, 29, 27, 26, 25, 23, 22, 21, 18, 16,  0],  # Antipolo
]


def seed_line(db, station_names, transport_type, sjt_matrix, svc_matrix):
    """Seed stations and fares for a single transport line."""
    station_objects = []
    for idx, name in enumerate(station_names):
        s = models.Station(name=name, transport_type=transport_type, station_order=idx)
        db.add(s)
        station_objects.append(s)
    db.flush()

    n = len(station_names)
    count = 0
    for i in range(n):
        for j in range(n):
            if i == j:
                continue
            sjt = sjt_matrix[i][j]
            svc = svc_matrix[i][j]
            if sjt > 0 and svc > 0:
                db.add(models.Fare(
                    origin_station_id=station_objects[i].id,
                    destination_station_id=station_objects[j].id,
                    sjt_fare=float(sjt),
                    svc_fare=float(svc),
                ))
                count += 1

    return len(station_names), count


# ====================== MRT-3 (13 stations) ======================
MRT3_STATIONS = [
    "North Avenue", "Quezon Avenue", "Kamuning", "Cubao",
    "Santolan-Annapolis", "Ortigas", "Shaw Boulevard", "Boni",
    "Guadalupe", "Buendia", "Ayala", "Magallanes", "Taft Avenue"
]


def _mrt3_sjt(d):
    """MRT-3 SJT fare by station distance."""
    if d <= 2: return 13
    if d <= 4: return 16
    if d <= 7: return 20
    if d <= 10: return 24
    return 28


def _mrt3_svc(d):
    """MRT-3 SVC/Beep fare by station distance."""
    if d <= 2: return 10
    if d <= 4: return 13
    if d <= 7: return 16
    if d <= 10: return 19
    return 22


_n3 = len(MRT3_STATIONS)
SJT_MRT3 = [[0 if i == j else _mrt3_sjt(abs(i - j)) for j in range(_n3)] for i in range(_n3)]
SVC_MRT3 = [[0 if i == j else _mrt3_svc(abs(i - j)) for j in range(_n3)] for i in range(_n3)]


def seed():
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # --- Seed Discounts (50% for students, seniors, PWDs per PBBM policy) ---
    discounts_data = [
        {"passenger_type": "student", "discount_rate": 0.50},
        {"passenger_type": "senior", "discount_rate": 0.50},
        {"passenger_type": "pwd", "discount_rate": 0.50},
    ]
    db.add_all([models.Discount(**d) for d in discounts_data])
    db.commit()

    # --- Seed LRT-1 ---
    s1, f1 = seed_line(db, LRT1_STATIONS, "LRT1", SJT_MATRIX, SVC_MATRIX)
    db.commit()
    print(f"LRT1: {s1} stations, {f1} fare entries")

    # --- Seed LRT-2 ---
    s2, f2 = seed_line(db, LRT2_STATIONS, "LRT2", SJT_LRT2, SVC_LRT2)
    db.commit()
    print(f"LRT2: {s2} stations, {f2} fare entries")

    # --- Seed MRT-3 ---
    s3, f3 = seed_line(db, MRT3_STATIONS, "MRT3", SJT_MRT3, SVC_MRT3)
    db.commit()
    print(f"MRT3: {s3} stations, {f3} fare entries")

    db.close()
    total_s = s1 + s2 + s3
    total_f = f1 + f2 + f3
    print(f"Done! Total: {total_s} stations, {total_f} fare entries")


if __name__ == "__main__":
    seed()
