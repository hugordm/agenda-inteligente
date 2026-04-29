import { useState } from 'react'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const token = localStorage.getItem('token')
    const usuarioSalvo = localStorage.getItem('usuario')
    if (token && usuarioSalvo) {
      try {
        return JSON.parse(usuarioSalvo)
      } catch {
        localStorage.removeItem('usuario')
      }
    }
    return null
  })

  const carregando = false

  function login(token, dadosUsuario) {
    localStorage.setItem('token', token)
    localStorage.setItem('usuario', JSON.stringify(dadosUsuario))
    setUsuario(dadosUsuario)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, carregando }}>
      {children}
    </AuthContext.Provider>
  )
}