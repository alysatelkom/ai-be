"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2 } from "lucide-react"
import { InstrumentDialog } from "@/components/instrument-dialog"

export default function InstrumentsPage() {
  const [instruments, setInstruments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedInstrument, setSelectedInstrument] = useState<any>(null)

  const loadInstruments = async () => {
    try {
      const response = await fetch("/api/instruments")
      if (response.ok) {
        const data = await response.json()
        setInstruments(data)
      }
    } catch (error) {
      console.error("Error loading instruments:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInstruments()
  }, [])

  const handleEdit = (instrument: any) => {
    setSelectedInstrument(instrument)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setSelectedInstrument(null)
    setDialogOpen(true)
  }

  const handleDialogClose = (refresh: boolean) => {
    setDialogOpen(false)
    setSelectedInstrument(null)
    if (refresh) {
      loadInstruments()
    }
  }

  if (loading) {
    return <div className="text-center py-10">Memuat...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Database Instrumen</h1>
          <p className="text-muted-foreground mt-2">
            Kelola instrumen pengukuran Anda
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Instrumen
        </Button>
      </div>

      {instruments.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-muted-foreground">
              <p>Belum ada instrumen.</p>
              <p className="mt-2">Klik tombol "Tambah Instrumen" untuk memulai.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Instrumen</TableHead>
                <TableHead>Merek</TableHead>
                <TableHead>Tipe/Model</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Jenis alat yang dikalibrasi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instruments.map((instrument) => (
                <TableRow key={instrument.id}>
                  <TableCell className="font-medium">{instrument.name}</TableCell>
                  <TableCell>{instrument.brand}</TableCell>
                  <TableCell>{instrument.type}</TableCell>
                  <TableCell>{instrument.serialNumber}</TableCell>
                  <TableCell>
                    {instrument.measurementQuantities
                      .map((mq: any) => mq.instrumentType)
                      .join(", ")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(instrument)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <InstrumentDialog
        open={dialogOpen}
        instrument={selectedInstrument}
        onClose={handleDialogClose}
      />
    </div>
  )
}
