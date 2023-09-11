import { useState } from "react"

function NavLink({to, children}) {
  return <a href={to} className={`mx-4`}>
      {children}
  </a>
}

export default function Navbar() {
    
  const [open, setOpen] = useState(false)
  return (
      <nav className="flex filter drop-shadow-md bg-white px-4 py-4 h-20 items-center">
          <div className="w-3/12 flex items-center">
              <a className="text-2xl font-semibold" href="/">LOGO</a>
          </div>
          <div className="w-9/12 flex justify-end items-center">

              <div className="z-50 flex relative w-8 h-8 flex-col justify-between items-center md:hidden" onClick={() => {
                  setOpen(!open)
              }}>
                  {/* hamburger button */}
                  <span className={`h-1 w-full bg-black rounded-lg transform transition duration-300 ease-in-out ${open ? "rotate-45 translate-y-3.5" : ""}`} />
                  <span className={`h-1 w-full bg-black rounded-lg transition-all duration-300 ease-in-out ${open ? "w-0" : "w-full"}`} />
                  <span className={`h-1 w-full bg-black rounded-lg transform transition duration-300 ease-in-out ${open ? "-rotate-45 -translate-y-3.5" : ""}`} />
              </div>

              <div className="hidden md:flex">
                  <NavLink to="/tournaments">
                      Torneos
                  </NavLink>
                  <NavLink to="/players">
                      Jugadores
                  </NavLink>
              </div>
          </div>
      </nav>
  )
}