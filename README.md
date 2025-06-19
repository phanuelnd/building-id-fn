# Building ID Registry System

A comprehensive building registry system for Rwanda's Ministry of Infrastructure (MININFRA), featuring advanced map search capabilities with Google Maps integration.

## Features

### 🗺️ Enhanced Map Search
- **Interactive Google Maps Integration**: Full satellite and road map views with zoom controls
- **Real-time Building Search**: Search buildings by unique Rwanda Building ID format
- **Building Footprint Visualization**: Display actual building polygons on the map
- **Rich Building Information**: Comprehensive administrative and geographic details
- **Share & Export**: Share building locations and download detailed information

### 🏗️ Building Information Display
- Administrative location hierarchy (Province → District → Sector → Cell → Village)
- Precise geographic coordinates with copy-to-clipboard functionality
- Building status indicators (Built, Under Construction, Planned)
- Data source and timestamp information
- Interactive map controls and navigation

### 🎨 Modern UX/UI
- Responsive design with Tailwind CSS
- Smooth animations and transitions
- Real-time format validation for Building IDs
- Sample ID suggestions for testing
- Loading states and error handling
- Mobile-optimized interface

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- pnpm package manager
- Google Maps API Key

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Google Maps API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API (optional)
4. Create an API key with appropriate restrictions
5. Update environment files:

**For Development (`src/app/environments/environment.development.ts`):**
```typescript
export const environment: Environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api',
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY_HERE', // Replace with your key
};
```

**For Production (`src/app/environments/environment.ts`):**
```typescript
export const environment: Environment = {
  production: true,
  apiBaseUrl: 'https://your-production-api.com/api',
  googleMapsApiKey: 'YOUR_PRODUCTION_GOOGLE_MAPS_API_KEY_HERE', // Replace with your key
};
```

### 3. API Backend Setup
Ensure your backend API supports the following endpoint:
```
GET /api/buildings/building_id/{buildingId}
```

Expected response format:
```json
{
  "id": 4,
  "building_id": "RW-KGL-S0190114990-E3012962286",
  "status": "BUILT",
  "footprint": {
    "type": "Polygon",
    "coordinates": [[[30.129655837, -1.901142864], ...]]
  },
  "longitude": 30.12962286,
  "latitude": -1.9011499,
  "province": "City of Kigali",
  "sector": "Bumbogo",
  "district": "Gasabo",
  "cell": "Ngara",
  "village": "Gisasa",
  "data_source": "GEOSPATIAL_FOOTPRINT_FROM_RSA",
  "created_at": "2025-06-05T22:07:42.094Z",
  "updated_at": "2025-06-05T22:07:42.094Z"
}
```

### 4. Development Server
```bash
pnpm start
```
Visit `http://localhost:4200`

### 5. Build for Production
```bash
pnpm build
```

## Building ID Format

The system expects Rwanda Building IDs in the format:
```
RW-[3-letter-province]-S[10-digits]-E[10-digits]
```

**Examples:**
- `RW-KGL-S0190114990-E3012962286` (Kigali)
- `RW-WES-S0180123456-E3023456789` (Western Province)
- `RW-NOR-S0175987654-E3034567890` (Northern Province)

## Usage

### Public Map Search
1. Navigate to the home page
2. Enter a valid Building ID in the search field
3. Click "Search" to locate the building on the interactive map
4. Explore building details in the information panel
5. Use map controls to switch between map/satellite views
6. Share location or download building details

### Administrative Features
- Access the administrative dashboard via "Access Administrative Dashboard"
- Comprehensive building management interface
- Advanced filtering and search capabilities

## Architecture

### Frontend Components
- **MapSearchComponent**: Enhanced search interface with validation
- **PublicMapViewComponent**: Interactive Google Maps with building visualization
- **BuildingsService**: API integration and data management
- **Building Model**: TypeScript interfaces for type safety

### Key Technologies
- **Angular 19**: Modern web framework
- **Google Maps JavaScript API**: Interactive mapping
- **Tailwind CSS**: Utility-first styling
- **RxJS**: Reactive programming
- **TypeScript**: Type-safe development

## Development

### File Structure
```
src/app/
├── public/
│   ├── map-search.component.ts       # Enhanced search interface
│   └── public-map-view.component.ts  # Interactive map view
├── services/
│   └── buildings.service.ts          # API integration
├── models/
│   └── building.model.ts             # Data models
└── environments/
    ├── environment.ts                # Production config
    └── environment.development.ts    # Development config
```

### Key Features Implementation
- **Real-time Validation**: Regex-based Building ID format checking
- **Google Maps Integration**: Dynamic script loading with error handling
- **Building Footprint**: GeoJSON polygon rendering on maps
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Error Handling**: Comprehensive error states and user feedback

## Deployment

### Docker Deployment
```bash
docker build -t building-registry .
docker run -p 80:80 building-registry
```

### Environment Variables
Set the following in your deployment environment:
- `GOOGLE_MAPS_API_KEY`: Your Google Maps API key
- `API_BASE_URL`: Backend API URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper TypeScript types
4. Add tests for new functionality
5. Submit a pull request

## License

This project is developed for the Ministry of Infrastructure, Rwanda.

## Support

For technical support or feature requests, please contact the development team or create an issue in the repository.
