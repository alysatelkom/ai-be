"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, SortAsc, SortDesc } from "lucide-react"
import Link from "next/link"

export default function HistoryPage() {
  const [calculations, setCalculations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterText, setFilterText] = useState("")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const loadCalculations = async () => {
    try {
      const params = new URLSearchParams({
        sortBy,
        sortOrder,
        ...(filterText && { instrument: filterText }),
      })
      const response = await fetch(`/api/calculations?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCalculations(data)
      }
    } catch (error) {
      console.error("Error loading calculations:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCalculations()
  }, [sortBy, sortOrder])

  const handleFilter = () => {
    loadCalculations()
  }

  const toggleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const toggleRowExpansion = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  if (loading) {
    return <div className="text-center py-10">Memuat...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Riwayat Perhitungan</h1>
          <p className="text-muted-foreground mt-2">
            Semua perhitungan yang telah disimpan
          </p>
        </div>
        <Link href="/dashboard/calculator">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Kalkulator
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="filter">Filter berdasarkan Instrumen</Label>
              <Input
                id="filter"
                placeholder="Cari nama instrumen..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFilter()}
              />
            </div>
            <div className="w-48">
              <Label htmlFor="sortBy">Urutkan berdasarkan</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sortBy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Tanggal</SelectItem>
                  <SelectItem value="instrumentName">Nama Instrumen</SelectItem>
                  <SelectItem value="measuredQuantity">Besaran</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={toggleSort} variant="outline">
              {sortOrder === "desc" ? (
                <SortDesc className="h-4 w-4 mr-2" />
              ) : (
                <SortAsc className="h-4 w-4 mr-2" />
              )}
              {sortOrder === "desc" ? "Terbaru" : "Terlama"}
            </Button>
            <Button onClick={handleFilter}>
              <Search className="h-4 w-4 mr-2" />
              Cari
            </Button>
          </div>
        </CardContent>
      </Card>

      {calculations.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-muted-foreground">
              <p>Belum ada riwayat perhitungan.</p>
              <p className="mt-2">Simpan perhitungan dari kalkulator untuk melihatnya di sini.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal & Waktu</TableHead>
                <TableHead>Nama Instrumen</TableHead>
                <TableHead>Besaran yang diukur</TableHead>
                <TableHead>Jenis alat yang dikalibrasi</TableHead>
                <TableHead>Rentang Ukur</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calculations.map((calc) => {
                const results = JSON.parse(calc.results)
                const components = JSON.parse(calc.components)
                const isExpanded = expandedRow === calc.id

                return (
                  <>
                    <TableRow key={calc.id} className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRowExpansion(calc.id)}>
                      <TableCell className="font-medium">{formatDate(calc.createdAt)}</TableCell>
                      <TableCell>{calc.instrumentName}</TableCell>
                      <TableCell>{calc.measuredQuantity}</TableCell>
                      <TableCell>{calc.instrumentType}</TableCell>
                      <TableCell>{calc.measurementRange}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleRowExpansion(calc.id)
                          }}
                        >
                          {isExpanded ? "Tutup" : "Detail"}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-muted/30">
                          <div className="p-4 space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Komponen Ketidakpastian</h4>
                              <div className="space-y-1 text-sm">
                                {components.map((comp: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center py-1 border-b border-border/50">
                                    <span>{comp.name}</span>
                                    <span className="font-mono">
                                      {comp.uncertainty.toExponential(4)} {comp.unit} ({comp.distribution})
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Hasil Perhitungan</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <div className="text-muted-foreground">u<sub>c</sub></div>
                                  <div className="font-mono font-semibold">{results.uc.toExponential(4)}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">v<sub>eff</sub></div>
                                  <div className="font-mono font-semibold">{results.veff.toFixed(2)}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">k</div>
                                  <div className="font-mono font-semibold">{results.k}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">U</div>
                                  <div className="font-mono font-semibold">{results.U.toExponential(4)} {results.unit}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">CMC</div>
                                  <div className="font-mono font-semibold">{results.cmc.toExponential(4)} {results.unit}</div>
                                </div>
                                <div className="md:col-span-3 bg-primary/10 p-3 rounded">
                                  <div className="text-muted-foreground">Ketidakpastian Akhir</div>
                                  <div className="font-mono font-bold text-lg">{results.finalUncertainty.toExponential(4)} {results.unit}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
