import { useEffect, useRef, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export function TournamentHistory() {
  const [tableWidth, setTableWidth] = useState(0)
  const tableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateTableWidth = () => {
      if (tableRef.current) {
        setTableWidth(tableRef.current.offsetWidth)
      }
    }

    updateTableWidth()
    window.addEventListener('resize', updateTableWidth)
    return () => window.removeEventListener('resize', updateTableWidth)
  }, [])

  const tournaments = [
    {
      name: "Lawn Tenis Ramos I",
      winner: "Rodolfo",
      points: 250,
      date: "01/11/2024",
      location: "Buenos Aires",
      category: "Open",
      prize: "$10,000",
    },
    {
      name: "La Cautiva I",
      winner: "Rodolfo",
      points: 500,
      date: "18/10/2024",
      location: "Córdoba",
      category: "Masters",
      prize: "$25,000",
    },
    {
      name: "Ganaderos I",
      winner: "Roman",
      points: 250,
      date: "N/A",
      location: "Rosario",
      category: "Challenger",
      prize: "$5,000",
    },
    {
      name: "Hidden Court III",
      winner: "Fernando",
      points: 250,
      date: "N/A",
      location: "Mendoza",
      category: "Open",
      prize: "$8,000",
    },
    {
      name: "Hidden Court II",
      winner: "Fernando",
      points: 250,
      date: "05/09/2024",
      location: "Mar del Plata",
      category: "Invitational",
      prize: "$15,000",
    },
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl sm:text-4xl">Historial de torneos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto" ref={tableRef}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold sticky left-0 z-20 bg-background">Nombre</TableHead>
                <TableHead className="font-bold sticky left-[var(--column-width)] z-20 bg-background">Ganador</TableHead>
                <TableHead className="font-bold text-right sticky left-[calc(var(--column-width)*2)] z-20 bg-background">Puntos</TableHead>
                <TableHead className="font-bold">Fecha</TableHead>
                <TableHead className="font-bold">Ubicación</TableHead>
                <TableHead className="font-bold">Categoría</TableHead>
                <TableHead className="font-bold">Premio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tournaments.map((tournament, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium sticky left-0 z-10 bg-background">{tournament.name}</TableCell>
                  <TableCell className="sticky left-[var(--column-width)] z-10 bg-background">{tournament.winner}</TableCell>
                  <TableCell className="text-right sticky left-[calc(var(--column-width)*2)] z-10 bg-background">{tournament.points}</TableCell>
                  <TableCell>{tournament.date}</TableCell>
                  <TableCell>{tournament.location}</TableCell>
                  <TableCell>{tournament.category}</TableCell>
                  <TableCell>{tournament.prize}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}