import React, { useEffect } from 'react'
import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  AdvancedMarkerProps,
  APIProvider,
  InfoWindow,
  Map,
  Pin,
  useAdvancedMarkerRef,
  CollisionBehavior,
  Marker
} from '@vis.gl/react-google-maps'
import { useState, useCallback } from 'react'
import DrawerContent from './DrawerContent'

import './App.css'
import { getData } from './data'
import './style.css'

export type AnchorPointName = keyof typeof AdvancedMarkerAnchorPoint

// A common pattern for applying z-indexes is to sort the markers
// by latitude and apply a default z-index according to the index position
// This usually is the most pleasing visually. Markers that are more "south"
// thus appear in front.

const rawData = localStorage.getItem('markers')

const data = rawData ? JSON.parse(rawData) : getData()

const Z_INDEX_SELECTED = data.length
const Z_INDEX_HOVER = data.length + 1

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string

function App() {
  const [markers, setMarkers] = useState([])
  const [isOpenDrawer, setIsOpenDrawer] = useState(false)
  const [currentPosition, setCurrentPosition] = useState({
    lat: 19.34081839132314,
    lng: -99.07496606381869
  })

  const [hoverId, setHoverId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [infowindowOpen, setInfowindowOpen] = useState(true)
  const [markerRef, marker] = useAdvancedMarkerRef()

  const [selectedMarker, setSelectedMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null)
  const [infoWindowShown, setInfoWindowShown] = useState(false)

  const onMouseEnter = useCallback((id: string | null) => setHoverId(id), [])
  const onMouseLeave = useCallback(() => setHoverId(null), [])
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number
    lng: number
  } | null>(null)

  const onMarkerClick = useCallback(
    (id: string, marker?: google.maps.marker.AdvancedMarkerElement) => {
      setSelectedId(id)

      if (marker) {
        setSelectedMarker(marker)
        setInfoWindowShown(true) // Always show info window when clicking a marker
      }

      // Find the marker data
      const markerData = markers.find((m) => m.id === id)
      if (markerData) {
        setInfoWindowShown(true)
      }
    },
    [markers] // Add markers to dependencies
  )

  const onMapClick = useCallback((e) => {
    setSelectedId(null)
    setSelectedMarker(null)
    setInfoWindowShown(false)
    setMarkerPosition({
      lat: e.detail.latLng.lat,
      lng: e.detail.latLng.lng
    })
    setInfowindowOpen(true)
  }, [])

  const handleInfowindowCloseClick = useCallback(
    () => setInfoWindowShown(false),
    []
  )

  useEffect(() => {
    const data = localStorage.getItem('markers')

    if (data) {
      setMarkers(JSON.parse(data))
    }
  }, [])

  return (
    <section className="relative h-[100dvh]">
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['marker']}>
        <Map
          style={{ width: '100vw', height: '95%' }}
          mapId={'bf51a910020fa25a'}
          defaultZoom={12}
          defaultCenter={currentPosition}
          gestureHandling={'greedy'}
          onClick={onMapClick}
          clickableIcons={false}
        >
          {markers.map(({ id, zIndex: zIndexDefault, position, type }) => {
            let zIndex = zIndexDefault

            if (hoverId === id) {
              zIndex = Z_INDEX_HOVER
            }

            if (selectedId === id) {
              zIndex = Z_INDEX_SELECTED
            }

            if (type === 'html') {
              return (
                <React.Fragment key={id}>
                  <AdvancedMarkerWithRef
                    position={position}
                    zIndex={zIndex}
                    anchorPoint={AdvancedMarkerAnchorPoint.BOTTOM}
                    className="custom-marker"
                    style={{
                      transform: `scale(${
                        [hoverId, selectedId].includes(id) ? 1.3 : 1
                      })`,
                      transformOrigin:
                        AdvancedMarkerAnchorPoint.BOTTOM.join(' ')
                    }}
                    onMarkerClick={(
                      marker: google.maps.marker.AdvancedMarkerElement
                    ) => onMarkerClick(id, marker)}
                    onMouseEnter={() => onMouseEnter(id)}
                    collisionBehavior={
                      CollisionBehavior.OPTIONAL_AND_HIDES_LOWER_PRIORITY
                    }
                    onMouseLeave={onMouseLeave}
                  >
                    <img
                      className={`custom-html-content ${
                        selectedId === id ? 'selected' : ''
                      }`}
                      src={
                        markers.find((marker) => marker.id === id)?.images?.[0]
                      }
                    />
                  </AdvancedMarkerWithRef>

                  {/* anchor point visualization marker */}
                  <AdvancedMarkerWithRef
                    onMarkerClick={(
                      marker: google.maps.marker.AdvancedMarkerElement
                    ) => onMarkerClick(id, marker)}
                    zIndex={zIndex + 1}
                    onMouseEnter={() => onMouseEnter(id)}
                    onMouseLeave={onMouseLeave}
                    anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
                    position={position}
                  >
                    <div className="visualization-marker2" />
                  </AdvancedMarkerWithRef>
                </React.Fragment>
              )
            }
          })}
          {infoWindowShown && selectedMarker && selectedId && (
            <InfoWindow
              className="info-window"
              anchor={selectedMarker}
              pixelOffset={[0, -2]}
              onCloseClick={handleInfowindowCloseClick}
            >
              {(() => {
                const markerSelected = markers.find(
                  (marker: { id: string }) => marker.id === selectedId
                )
                return markerSelected ? (
                  <div className="info-content-marker">
                    {markerSelected.images &&
                      markerSelected.images.length > 0 && (
                        <div>
                          <img
                            src={markerSelected.images[0]}
                            alt={markerSelected.name}
                            className="image-info"
                          />
                        </div>
                      )}
                    <div>
                      <h2 className="title-info">{markerSelected.name}</h2>
                      <p className="text-black">{markerSelected.description}</p>
                    </div>
                  </div>
                ) : null
              })()}
            </InfoWindow>
          )}

          {markerPosition && (
            <AdvancedMarker position={markerPosition} ref={markerRef}>
              <Pin
                background={'#22ccff'}
                borderColor={'#1e89a1'}
                glyphColor={'#0f677a'}
              />
              {infowindowOpen && (
                <InfoWindow
                  anchor={marker}
                  maxWidth={200}
                  onCloseClick={() => setInfowindowOpen(false)}
                >
                  <button onClick={() => setIsOpenDrawer(true)}>
                    Guardar Ubicación
                  </button>
                </InfoWindow>
              )}
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>
      <DrawerContent
        markers={markers}
        setMarkers={setMarkers}
        isOpen={isOpenDrawer}
        setIsOpen={setIsOpenDrawer}
        marker={markerPosition}
        setmarker={setMarkerPosition}
      />
    </section>
  )
}

export const AdvancedMarkerWithRef = (
  props: AdvancedMarkerProps & {
    onMarkerClick: (marker: google.maps.marker.AdvancedMarkerElement) => void
  }
) => {
  const { children, onMarkerClick, ...advancedMarkerProps } = props
  const [markerRef, marker] = useAdvancedMarkerRef()

  return (
    <AdvancedMarker
      onClick={() => {
        if (marker) {
          onMarkerClick(marker)
        }
      }}
      ref={markerRef}
      {...advancedMarkerProps}
    >
      {children}
    </AdvancedMarker>
  )
}

export default App
{
  /* <CustomMapControl
          controlPosition={ControlPosition.TOP_LEFT}
          selectedAutocompleteMode={selectedAutocompleteMode}
          onPlaceSelect={setSelectedPlace}
        /> */
}
