import { useState } from 'react'
import './App.css'
import api from './api/axiosConfig'
import { useEffect } from 'react'

function App() {
  const [respuesta, setRespuesta] = useState('')

  useEffect(() => {
    api.get('/ping')
      .then(res => setRespuesta(res.data))
      .catch(() => setRespuesta('Error al conectar con la API'))
  }, [])

  return <h1> Backend: {respuesta}</h1>
}

export default App
