# FareRail

*A Web-Based LRT, MRT, and PNR Fare Calculator*

---

# 1. Project Overview

**FareRail** is a web application that calculates train fares for:

* LRT
* MRT
* PNR

The system allows users to:

* Select transport type
* Choose origin and destination stations
* Select passenger category (Adult, Student, Senior)
* Instantly calculate the correct fare

The application is designed with a clean separation between frontend and backend services.

---

# 2. Technology Stack

## Frontend

* **Next.js**
* **Tailwind CSS**
* Hosted on **Vercel**

## Backend

* **FastAPI**
* Hosted on **PythonAnywhere**

## Database

* **MySQL**
* Hosted on PythonAnywhere (built-in MySQL service)

---

# 3. System Architecture

```
User (Browser)
      ↓
Next.js Frontend (Vercel)
      ↓ HTTPS API Calls
FastAPI Backend (PythonAnywhere)
      ↓
MySQL Database (PythonAnywhere)
```

### Architecture Principles

* Frontend handles UI only.
* Backend handles business logic and fare computation.
* Database stores stations, fares, and discount data.
* Money calculations are done strictly on the backend.

---

# 4. Core Features

## 4.1 Fare Calculation

* Distance-based fare computation (LRT/MRT)
* Rule-based fare computation (PNR)
* Automatic discount application (Student/Senior)

## 4.2 Station Selection

* Dynamic station loading per transport type
* Prevent selecting the same origin and destination

## 4.3 Passenger Categories

* Adult
* Student (20% discount)
* Senior Citizen (20% discount)

## 4.4 Error Handling

* Invalid station selection
* Missing inputs
* Backend failure handling
* CORS configuration between Vercel and PythonAnywhere

---

# 5. Database Design

## 5.1 stations

Stores all train stations.

Fields:

* id (Primary Key)
* name
* transport_type (LRT, MRT, PNR)
* station_order (Used for distance calculation)

---

## 5.2 fares

Stores the exact station-to-station fare matrix provided by the DOTr/LTFRB.

Fields:

* id
* origin_station_id
* destination_station_id
* regular_fare

*(Note: Storing the exact matrix handles all arbitrary zone-based rules or edge cases without relying on a rigid formula.)*

---

## 5.3 discounts

Stores discount rates.

Fields:

* id
* passenger_type
* discount_rate

---

# 6. API Design

## GET /stations

Returns stations filtered by transport type.

Query Parameter:

* transport

Response:

* List of station objects

---

## POST /calculate_fare

Calculates total fare.

Request Body:

```
{
  "transport": "LRT",
  "origin": "Baclaran",
  "destination": "EDSA",
  "passenger_type": "student"
}
```

Response:

```
{
  "fare": 20.00,
  "distance": 1
}
```

---

# 7. Fare Calculation Logic

For LRT/MRT/PNR:

1. Query the `fares` table using `origin_station_id` and `destination_station_id`.
   ```sql
   SELECT regular_fare FROM fares 
   WHERE origin_station_id = ? AND destination_station_id = ?
   ```
2. Apply passenger discount (if applicable):

   ```python
   fare = regular_fare * (1 - discount_rate)
   ```
3. Round to 2 decimal places.

---

# 8. Deployment Plan

## Frontend Deployment (Vercel)

1. Push Next.js project to GitHub.
2. Connect repository to Vercel.
3. Configure environment variable:

   ```
   NEXT_PUBLIC_API_URL=https://yourusername.pythonanywhere.com
   ```

## Backend Deployment (PythonAnywhere)

1. Upload FastAPI project.
2. Configure WSGI file.
3. Install dependencies.
4. Connect to MySQL.
5. Enable CORS for Vercel domain.

---

# 9. Security Considerations

* Store database credentials in environment variables.
* Enable CORS only for production frontend domain.
* Validate all incoming request data.
* Prevent SQL injection via ORM (SQLAlchemy).
* Never compute fare on frontend.

---

# 10. Future Enhancements

* Admin dashboard to update fares
* Support multi-line transfers (LRT ↔ MRT)
* Real-time route visualization
* Fare history logging
* Mobile responsive enhancements
* PWA support

---

# 11. Development Phases

### Phase 1

* Database schema creation
* Basic FastAPI endpoints
* Static station data

### Phase 2

* Next.js frontend UI
* API integration
* Fare computation testing

### Phase 3

* Deployment to Vercel and PythonAnywhere
* CORS and production configuration
* Performance testing

### Phase 4

* UX improvements
* Error handling refinement
* Documentation finalization

---

# 12. Project Goal

FareRail aims to provide:

* Accurate fare calculation
* Clean and responsive user experience
* Scalable backend architecture
* Fully free hosting deployment
* Strong portfolio-quality implementation

