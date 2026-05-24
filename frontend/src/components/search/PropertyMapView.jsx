import { useState } from 'react';
import { MapPin, X, Star, ChevronRight } from 'lucide-react';

// Simple map visualization without external API
// Shows properties as pins on a grid layout
export default function PropertyMapView({ properties, onSelect }) {
  const [selected, setSelected] = useState(null);

  if (!properties || properties.length === 0) {
    return (
      <div className="card p-12 text-center">
        <MapPin className="h-12 w-12 text-gray-200 mx-auto mb-4" />
        <p className="text-gray-500">No properties to show on map</p>
      </div>
    );
  }

  // Create a simple coordinate-based layout
  const positioned = properties.map((p, i) => {
    const coords = p.location?.coordinates?.coordinates;
    const lat = coords ? coords[1] : 17 + (i * 0.8) % 4;
    const lng = coords ? coords[0] : 78 + (i * 1.2) % 6;
    const x   = ((lng - 76) / 6) * 100;
    const y   = ((20 - lat) / 4) * 100;
    return {
      ...p,
      x: Math.max(5, Math.min(90, x)),
      y: Math.max(5, Math.min(85, y)),
    };
  });

  return (
    <div className="card overflow-hidden">
      {/* Map area */}
      <div
        className="relative bg-gradient-to-br from-green-50 via-blue-50 to-green-100"
        style={{ height: '480px' }}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)',
            backgroundSize:  '50px 50px',
          }}
        />

        {/* City label */}
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm">
          📍 Hyderabad, Telangana
        </div>

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-white/90 rounded-lg p-2 text-xs text-gray-500 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-3 w-3 bg-primary-600 rounded-full" />
            Available
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 bg-gray-400 rounded-full" />
            Selected
          </div>
        </div>

        {/* Property pins */}
        {positioned.map(property => (
          <button
            key={property._id}
            onClick={() => setSelected(selected?._id === property._id ? null : property)}
            style={{ left: `${property.x}%`, top: `${property.y}%` }}
            className="absolute transform -translate-x-1/2 -translate-y-full group"
          >
            {/* Price bubble */}
            <div className={`px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-lg transition-all border-2 ${
              selected?._id === property._id
                ? 'bg-primary-700 text-white border-primary-800 scale-110'
                : 'bg-white text-gray-900 border-gray-200 hover:border-primary-400 hover:scale-105'
            }`}>
              ₹{((property.availableRoomTypes?.[0]?.basePrice || 5000) / 1000).toFixed(0)}K
            </div>
            {/* Pin tail */}
            <div className={`w-2 h-2 mx-auto rotate-45 border-r-2 border-b-2 -mt-1 ${
              selected?._id === property._id
                ? 'bg-primary-700 border-primary-800'
                : 'bg-white border-gray-200'
            }`} />
            {/* Hover tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
              <div className="bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">
                {property.name}
              </div>
            </div>
          </button>
        ))}

        {/* Selected property card overlay */}
        {selected && (
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-xl p-4 border">
            <div className="flex items-start gap-3">
              {/* Image */}
              <div className="h-16 w-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {selected.images?.[0]?.url ? (
                  <img
                    src={selected.images[0].url}
                    alt={selected.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-gray-300" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {selected.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i <= selected.starRating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-200 fill-gray-100'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selected.location?.city}, {selected.location?.state}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-gray-400 hover:text-gray-600 ml-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-shrink-0 text-right">
                <div className="font-bold text-gray-900 text-sm">
                  ₹{(selected.availableRoomTypes?.[0]?.basePrice || 5000).toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">/night</div>
                <button
                  onClick={() => onSelect(selected)}
                  className="mt-2 flex items-center gap-1 text-xs text-primary-700 font-semibold hover:text-primary-800"
                >
                  View <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}