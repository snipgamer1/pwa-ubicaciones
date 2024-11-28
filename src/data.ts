interface MarkerData {
  id: string
  position: google.maps.LatLngLiteral
  type: 'html'
  zIndex: number
  name: string
  description: string
}

export function getData() {
  const data: MarkerData[] = []

  // create 10 random markers
  for (let index = 0; index < 5; index++) {
    data.push({
      id: String(index),
      position: {
        lat: rnd(19.34081839132314, 19.5081839132314),
        lng: rnd(-99.07496606381869, -99.27496606381869)
      },
      zIndex: index,
      type: 'html',
      name: `Place ${index}`,
      description: `Description for place ${index}`
    })
  }

  localStorage.setItem('markers', JSON.stringify(data))

  return data
}

function rnd(min: number, max: number) {
  return Math.random() * (max - min) + min
}
