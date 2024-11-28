import { Drawer } from 'vaul'
import { useState } from 'react'
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { useEffect } from 'react';


export default function DrawerContent ({ isOpen, setIsOpen, marker, setmarker, markers, setMarkers }) {

  const [images, setImages] = useState(null)
  const [vertodos, setVertodos] = useState(false)


  const handleImageChange = (e) => {
    const files = e.target.files
    const images = Array.from(files)
    //convertir las imagenes a base64
    setImages(images)
  }
  useEffect(() => {
    if (!markers) {
      const storedMarkers = JSON.parse(localStorage.getItem("markers")) || [];
      setMarkers(storedMarkers);
    }
  }, [markers, setMarkers]);

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    //mostrar los datos del formulario
    const data = new FormData(e.target)
    const images = Array.from(data.getAll('image'))
    //convertir las imagenes a base64
    let imagesBase64 = []
    if (images) {
      imagesBase64 = await Promise.all(images.map(getBase64));
    }
    //guardar datos en el localstorage
    const markers = JSON.parse(localStorage.getItem('markers')) || []

    const uid = crypto.randomUUID()
    markers.push({
      id: uid,
      name: data.get('name'),
      description: data.get('description'),
      type: 'html',
      zIndex: markers.length + 1,
      position: { lat: marker.lat, lng: marker.lng },
      //guardar las imagenes en el localstorage como base64
      images: imagesBase64
    })
    setMarkers(markers)
    localStorage.setItem('markers', JSON.stringify(markers))
    setmarker(null)
  }
  const deleteMarker = () => {
    setmarker(null)
    setImages(null)
  }
  const deleteLocation = (id) => {
    // Filtrar los marcadores para excluir el marcador eliminado
    const updatedMarkers = markers.filter(marker => marker.id !== id);

    // Actualizar el estado con los marcadores restantes
    setMarkers(updatedMarkers);

    // Actualizar el localStorage con los marcadores actualizados
    localStorage.setItem('markers', JSON.stringify(updatedMarkers));
  };

  return (
    <>

      <Drawer.Root open={isOpen} onOpenChange={setIsOpen} >
        <Drawer.Trigger className=" absolute z-0 bottom-0 flex h-10 w-full flex-shrink-0 items-center justify-center gap-2 overflow-hidden bg-white px-4 text-sm font-medium shadow-sm transition-all hover:bg-[#FAFAFA] dark:bg-[#161615] dark:hover:bg-[#1A1A19] dark:text-white">
          Mis Ubicaciones
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed sticky inset-0 bg-black/40" />
          <Drawer.Content className="bg-gray-100 flex flex-col rounded-t-[10px] h-[85%] mt-24 fixed bottom-0 left-0 right-0 outline-none">
            <div className="p-4 bg-white rounded-t-[10px] flex-1 overflow-y-auto">
              <div
                aria-hidden
                className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8"
              />
              {!vertodos ? (
                <div className="max-w-md mx-auto">
                  {marker && (
                    <form className="mb-4 space-y-2" onSubmit={handleSubmit}>
                      <Drawer.Title className="font-medium mb-4 text-gray-900 flex justify-between">
                        Guardar Ubicación <button className="bg-red-500 p-1" onClick={deleteMarker}> Cancelar </button>
                      </Drawer.Title>
                      <input
                        type="text"
                        name='name'
                        placeholder="Nombre"
                        className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-[10px] text-sm text-gray-900"
                      />
                      <input
                        type="text"
                        name='description'
                        placeholder="Descripción"
                        className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-[10px] text-sm text-gray-900"
                      />
                      <input
                        type="file"
                        name='image'
                        accept='image/*'
                        multiple
                        onChange={handleImageChange}
                        className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-[10px] text-sm text-gray-900"
                      />
                      {images && (
                        <div className="flex gap-2.5">
                          {images.map((image, index) => (
                            <img
                              key={index}
                              src={URL.createObjectURL(image)}
                              alt=""
                              className="w-12 h-12 object-cover rounded-[10px]"
                            />
                          ))}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full mt-4 px-4 py-2.5 bg-[#0c79fe] text-white rounded-[10px] text-sm font-medium"
                      >
                        Guardar
                      </button>
                    </form>
                  )}
                  <Drawer.Title className="font-medium mb-4 text-gray-900">
                    Sugerencias
                  </Drawer.Title>
                  <div className="h-[73px] px-4 bg-white border w-full rounded-[10px] justify-start items-center gap-3 inline-flex">
                    <div className="w-[30px] h-[30px] px-0.5 py-1 bg-[#0c79fe] rounded-[15px] flex-col justify-center items-center gap-2.5 inline-flex">
                      <div className="text-center text-[#f7f7f6] text-sm ">􀙙</div>
                    </div>
                    <div className="grow shrink basis-0 flex-col justify-start items-start gap-[3px] inline-flex">
                      <p className="text-center text-black text-[17px] ">
                        Estacionamiento
                      </p>
                      <p className="self-stretch h-[18px] text-[#868782] text-[15px] font-normal ">
                        290 m aqui, cerca de ti
                      </p>
                    </div>
                  </div>

                  <Drawer.Title className="font-medium my-4 text-gray-900 ">
                    Favoritos
                  </Drawer.Title>
                  <div className=" p-4 rounded-[10px] justify-start items-start gap-[22px] inline-flex">
                    <div className="flex-col justify-start items-center gap-1.5 inline-flex">
                      <div className="w-[60px] h-[60px] bg-[#ebebeb] rounded-[30px] flex-col justify-center items-center gap-2.5 flex">
                        <div className="text-center text-[#0c79fe] text-3xl font-normal ">
                          􀎟
                        </div>
                      </div>
                      <div className="flex-col justify-start items-center flex">
                        <p className="text-center text-black text-[15px] ">
                          Casa
                        </p>
                        <p className="text-center text-[#6c6c6c] text-[13px] ">
                          Añadir
                        </p>
                      </div>
                    </div>
                    <div className="flex-col justify-start items-center gap-1.5 inline-flex">
                      <div className="w-[60px] h-[60px] bg-[#ebebeb] rounded-[30px] flex-col justify-center items-center gap-2.5 flex">
                        <div className="text-center text-[#0c79fe] text-[28px] font-normal ">
                          t
                        </div>
                      </div>
                      <div className="flex-col justify-start items-center flex">
                        <p className="text-center text-black text-[15px] ">
                          Trabajo
                        </p>
                        <p className="text-center text-[#6c6c6c] text-[13px] ">
                          Añadir
                        </p>
                      </div>
                    </div>
                    <div className="flex-col justify-start items-center gap-1.5 inline-flex">
                      <div className="w-[60px] h-[60px] p-2.5 bg-[#ebebeb] rounded-[30px] justify-center items-center gap-2.5 inline-flex">
                        <p className="text-black">+</p>
                      </div>
                      <div className="flex-col justify-start items-center flex">
                        <div className="text-center text-black text-[15px] ">
                          Añadir
                        </div>
                      </div>
                    </div>
                  </div>
                  <Drawer.Title className="font-medium my-4 text-gray-900 flex justify-between items-center">
                    Guardados <button className="bg-transparent p-1" onClick={() => setVertodos(true)}> Ver todos </button>
                  </Drawer.Title>
                  {markers ? (
                    markers.map((marker, index) => (
                      <div
                        key={index}
                        className="flex gap-4 items-center border-b p-4  border-gray-200 hover:bg-gray-100"
                      >
                        <div className="flex gap-2.5">
                          {(marker.images || []).map((image, imgIndex) => (
                            <img
                              key={imgIndex}
                              src={image}
                              alt=""
                              className="w-12 h-12 object-cover rounded-[10px]"
                            />
                          ))}
                        </div>
                        <div>
                          <p className="text-black text-[15px] font-medium">{marker.name}</p>
                          <p className="text-[#6c6c6c] text-[13px]">{marker.description}</p>
                          <p className="text-[#6c6c6c] text-[13px] font-medium">
                            {marker.position.lat}, {marker.position.lng}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>No hay marcadores guardados</div>
                  )}


                </div>) : (<div>
                  <div className="flex gap-5 items-center">
                    <button onClick={() => setVertodos(false)} className='bg-transparent'>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="black">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <Drawer.Title className="font-medium my-4 text-gray-900">
                      Guardados
                    </Drawer.Title>
                  </div>

                  {JSON.parse(localStorage.getItem('markers'))?.map((marker, index) => (
                    <div
                      key={index}
                      className="flex gap-4 items-center border-b p-4  border-gray-200 hover:bg-gray-100"
                    >

                      <div className="flex  gap-2.5">

                        {marker.images && (() => {
                          const images = marker.images.map((image) => ({
                            original: image,
                            thumbnail: image,
                          }));
                          return <ImageGallery additionalClass={"image-skip"} className="lg:max-w-[260px]" showPlayButton={false} showThumbnails={false} items={images} />;
                        })()}


                      </div>
                      <div>
                        <p className="text-black text-[15px] font-medium">
                          {marker.name}
                        </p>
                        <p className="text-[#6c6c6c] text-[13px] ">
                          {marker.description}
                        </p>
                        <p className="text-[#6c6c6c] text-[13px] font-medium">
                          {marker.position.lat}, {marker.position.lng}
                        </p>
                        <div className=' mt-2 space-x-2'>
                          <button onClick={() => deleteLocation(marker.id)}>Eliminar</button>
                          <button >Modificar</button>
                        </div>


                      </div>
                    </div>

                  ))}
                </div>)}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  )
}
