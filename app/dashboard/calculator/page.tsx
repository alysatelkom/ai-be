"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Save } from "lucide-react"
import { useRouter } from "next/navigation"

interface Component {
  id: string
  name: string
  unit: string
  uncertainty: number
  distribution: "Normal" | "Rectangular" | "Type A"
  divisor: number
  ni: number
}

const distributionDivisors = {
  "Normal": 2,
  "Rectangular": 1.732,
  "Type A": 1,
}

const defaultComponents = [
  { name: "Sertifikat Kalibrasi Standar", unit: "mV", uncertainty: 0.0001, distribution: "Normal" as const },
  { name: "Drift", unit: "mV", uncertainty: 0.0001, distribution: "Rectangular" as const },
  { name: "Resolusi / Readability", unit: "mV", uncertainty: 0.001, distribution: "Rectangular" as const },
  { name: "Repeatability", unit: "mV", uncertainty: 0.002, distribution: "Type A" as const },
]

export default function CalculatorPage() {
  const router = useRouter()
  const [instruments, setInstruments] = useState<any[]>([])
  const [selectedInstrument, setSelectedInstrument] = useState("")
  const [selectedQuantity, setSelectedQuantity] = useState("")
  const [selectedRange, setSelectedRange] = useState("")
  const [showCalculator, setShowCalculator] = useState(false)
  const [components, setComponents] = useState<Component[]>([])
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)

  const quantities = selectedInstrument
    ? instruments.find((i) => i.id === selectedInstrument)?.measurementQuantities || []
    : []

  const ranges = selectedQuantity
    ? quantities.find((q: any) => q.id === selectedQuantity)?.ranges || []
    : []

  const currentRange = ranges.find((r: any) => r.id === selectedRange)
  const currentQuantity = quantities.find((q: any) => q.id === selectedQuantity)
  const currentInstrument = instruments.find((i) => i.id === selectedInstrument)

  useEffect(() => {
    fetch("/api/instruments")
      .then((res) => res.json())
      .then((data) => setInstruments(data))
      .catch((err) => console.error(err))
  }, [])

  const handleShow = () => {
    if (!selectedRange) return

    const initialComponents = defaultComponents.map((comp, idx) => ({
      id: `comp-${idx}`,
      ...comp,
      divisor: distributionDivisors[comp.distribution],
      ni: 1,
    }))

    setComponents(initialComponents)
    setShowCalculator(true)
    setEditMode(false)
  }

  const addComponent = () => {
    const newComponent: Component = {
      id: `comp-${Date.now()}`,
      name: "Komponen Baru",
      unit: currentRange?.unit || "mV",
      uncertainty: 0,
      distribution: "Rectangular",
      divisor: distributionDivisors["Rectangular"],
      ni: 1,
    }
    setComponents([...components, newComponent])
  }

  const removeComponent = (id: string) => {
    setComponents(components.filter((c) => c.id !== id))
  }

  const updateComponent = (id: string, field: string, value: any) => {
    setComponents(components.map((c) => {
      if (c.id === id) {
        const updated = { ...c, [field]: value }
        if (field === "distribution") {
          updated.divisor = distributionDivisors[value as keyof typeof distributionDivisors]
        }
        return updated
      }
      return c
    }))
  }

  // Calculations
  const calculateUi = (u: number, divisor: number) => u / divisor
  const calculateUiCi = (ui: number, ci: number = 1) => ui * ci
  const calculateUiCiSquared = (uici: number) => Math.pow(uici, 2)
  const calculateUiCi4OverNi = (uici: number, ni: number) => Math.pow(uici, 4) / ni

  const sumUiCiSquared = components.reduce((sum, comp) => {
    const ui = calculateUi(comp.uncertainty, comp.divisor)
    const uici = calculateUiCi(ui)
    return sum + calculateUiCiSquared(uici)
  }, 0)

  const sumUiCi4OverNi = components.reduce((sum, comp) => {
    const ui = calculateUi(comp.uncertainty, comp.divisor)
    const uici = calculateUiCi(ui)
    return sum + calculateUiCi4OverNi(uici, comp.ni)
  }, 0)

  const uc = Math.sqrt(sumUiCiSquared)
  const veff = Math.pow(uc, 4) / Math.sqrt(sumUiCi4OverNi)
  const k = 2
  const U = k * uc
  const cmc = currentRange?.cmc || 0
  const finalUncertainty = Math.max(U, cmc)

  const handleSaveCalculation = async () => {
    setSaving(true)
    try {
      const payload = {
        instrumentName: currentInstrument?.name,
        measuredQuantity: currentQuantity?.measuredQuantity,
        instrumentType: currentQuantity?.instrumentType,
        measurementRange: `${currentRange?.minRange} ~ ${currentRange?.maxRange} ${currentRange?.unit}`,
        components: JSON.stringify(components),
        results: JSON.stringify({
          sumUiCiSquared,
          sumUiCi4OverNi,
          uc,
          veff,
          k,
          U,
          cmc,
          finalUncertainty,
          unit: currentRange?.unit,
        }),
      }

      const response = await fetch("/api/calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        alert("Perhitungan berhasil disimpan!")
      }
    } catch (error) {
      console.error("Error saving calculation:", error)
      alert("Gagal menyimpan perhitungan")
    } finally {
      setSaving(false)
    }
  }

  if (!showCalculator) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Kalkulator Budget Ketidakpastian</h1>
          <p className="text-muted-foreground mt-2">
            Pilih instrumen dan rentang ukur untuk memulai
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pilih Konfigurasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Instrumen</Label>
              <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih instrumen" />
                </SelectTrigger>
                <SelectContent>
                  {instruments.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id}>
                      {inst.name} - {inst.brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedInstrument && (
              <div className="space-y-2">
                <Label>Besaran yang diukur</Label>
                <Select value={selectedQuantity} onValueChange={setSelectedQuantity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih besaran yang diukur" />
                  </SelectTrigger>
                  <SelectContent>
                    {quantities.map((q: any) => (
                      <SelectItem key={q.id} value={q.id}>
                        {q.measuredQuantity} ({q.instrumentType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedQuantity && (
              <div className="space-y-2">
                <Label>Rentang Ukur</Label>
                <Select value={selectedRange} onValueChange={setSelectedRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih rentang ukur" />
                  </SelectTrigger>
                  <SelectContent>
                    {ranges.map((r: any) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.minRange} ~ {r.maxRange} {r.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              onClick={handleShow}
              disabled={!selectedRange}
              className="w-full"
            >
              Tampilkan Kalkulator
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Perhitungan Budget Ketidakpastian</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant={editMode ? "default" : "outline"}
            onClick={() => setEditMode(!editMode)}
          >
            <Edit className="h-4 w-4 mr-2" />
            {editMode ? "Mode Lihat" : "Mode Edit"}
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard/calculator/history")}>
            Riwayat
          </Button>
          <Button onClick={handleSaveCalculation} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
          <Button variant="outline" onClick={() => setShowCalculator(false)}>
            Kembali
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PERHITUNGAN BUDGET KETIDAKPASTIAN</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Besaran yang diukur:</strong> {currentQuantity?.measuredQuantity}
            </div>
            <div>
              <strong>Jenis alat yang dikalibrasi:</strong> {currentQuantity?.instrumentType}
            </div>
            <div>
              <strong>Standar yang digunakan:</strong> {currentInstrument?.name} ({currentInstrument?.brand} {currentInstrument?.type})
            </div>
            <div>
              <strong>Rentang ukur:</strong> {currentRange?.minRange} ~ {currentRange?.maxRange} {currentRange?.unit}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="bg-muted p-4 rounded-md">
              <strong className="block mb-2">Model Matematis Pengukuran:</strong>
              <p className="font-mono text-sm">Koreksi = N<sub>STD</sub> - N<sub>UUT</sub></p>
              <p className="text-xs text-muted-foreground mt-2">
                dimana:<br />
                N<sub>STD</sub> = Nilai keluaran dari Kalibrator (Standar) setelah koreksi<br />
                N<sub>UUT</sub> = Nilai yang ditampilkan oleh Unit Under Test (UUT)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Komponen Ketidakpastian</CardTitle>
            {editMode && (
              <Button size="sm" onClick={addComponent}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Komponen
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Komponen</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead>Distribusi</TableHead>
                  <TableHead>U</TableHead>
                  <TableHead>Pembagi</TableHead>
                  <TableHead>n<sub>i</sub></TableHead>
                  <TableHead>U<sub>i</sub></TableHead>
                  <TableHead>C<sub>i</sub></TableHead>
                  <TableHead>U<sub>i</sub>C<sub>i</sub></TableHead>
                  <TableHead>(U<sub>i</sub>C<sub>i</sub>)<sup>2</sup></TableHead>
                  <TableHead>(U<sub>i</sub>C<sub>i</sub>)<sup>4</sup>/n<sub>i</sub></TableHead>
                  {editMode && <TableHead>Aksi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {components.map((comp) => {
                  const ui = calculateUi(comp.uncertainty, comp.divisor)
                  const uici = calculateUiCi(ui)
                  const uiciSquared = calculateUiCiSquared(uici)
                  const uici4OverNi = calculateUiCi4OverNi(uici, comp.ni)

                  return (
                    <TableRow key={comp.id}>
                      <TableCell>
                        {editMode ? (
                          <Input
                            value={comp.name}
                            onChange={(e) => updateComponent(comp.id, "name", e.target.value)}
                            className="min-w-[200px]"
                          />
                        ) : (
                          comp.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editMode ? (
                          <Input
                            value={comp.unit}
                            onChange={(e) => updateComponent(comp.id, "unit", e.target.value)}
                            className="w-20"
                          />
                        ) : (
                          comp.unit
                        )}
                      </TableCell>
                      <TableCell>
                        {editMode ? (
                          <Select
                            value={comp.distribution}
                            onValueChange={(v) => updateComponent(comp.id, "distribution", v)}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Normal">Normal</SelectItem>
                              <SelectItem value="Rectangular">Rectangular</SelectItem>
                              <SelectItem value="Type A">Type A</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          comp.distribution
                        )}
                      </TableCell>
                      <TableCell>
                        {editMode ? (
                          <Input
                            type="number"
                            step="any"
                            value={comp.uncertainty}
                            onChange={(e) => updateComponent(comp.id, "uncertainty", parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                        ) : (
                          comp.uncertainty.toExponential(4)
                        )}
                      </TableCell>
                      <TableCell className="text-center">{comp.divisor.toFixed(3)}</TableCell>
                      <TableCell className="text-center">{comp.ni}</TableCell>
                      <TableCell className="text-center">{ui.toExponential(4)}</TableCell>
                      <TableCell className="text-center">1</TableCell>
                      <TableCell className="text-center">{uici.toExponential(4)}</TableCell>
                      <TableCell className="text-center">{uiciSquared.toExponential(4)}</TableCell>
                      <TableCell className="text-center">{uici4OverNi.toExponential(4)}</TableCell>
                      {editMode && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeComponent(comp.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Hasil Perhitungan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-primary pl-4">
              <div className="text-sm text-muted-foreground mb-1">Σ(U<sub>i</sub>C<sub>i</sub>)<sup>2</sup></div>
              <div className="text-lg font-mono font-semibold">{sumUiCiSquared.toExponential(4)}</div>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <div className="text-sm text-muted-foreground mb-1">Σ((U<sub>i</sub>C<sub>i</sub>)<sup>4</sup>/n<sub>i</sub>)</div>
              <div className="text-lg font-mono font-semibold">{sumUiCi4OverNi.toExponential(4)}</div>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <div className="text-sm text-muted-foreground mb-1">Ketidakpastian Standar Gabungan (u<sub>c</sub>)</div>
              <div className="text-lg font-mono font-semibold">{uc.toExponential(4)}</div>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <div className="text-sm text-muted-foreground mb-1">Derajat Kebebasan Efektif (v<sub>eff</sub>)</div>
              <div className="text-lg font-mono font-semibold">{veff.toFixed(2)}</div>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <div className="text-sm text-muted-foreground mb-1">Faktor Cakupan (k)</div>
              <div className="text-lg font-mono font-semibold">{k}</div>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <div className="text-sm text-muted-foreground mb-1">Ketidakpastian Diperluas (U)</div>
              <div className="text-lg font-mono font-semibold">{U.toExponential(4)} {currentRange?.unit}</div>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <div className="text-sm text-muted-foreground mb-1">CMC</div>
              <div className="text-lg font-mono font-semibold">{cmc.toExponential(4)} {currentRange?.unit}</div>
            </div>
            <div className="border-l-4 border-primary pl-4 md:col-span-2 bg-primary/5 p-4 -ml-4 -mb-4 rounded">
              <div className="text-sm text-muted-foreground mb-1">Ketidakpastian Akhir</div>
              <div className="text-2xl font-mono font-bold">{finalUncertainty.toExponential(4)} {currentRange?.unit}</div>
              <div className="text-xs text-muted-foreground mt-1">U<sub>final</sub> = max(U, CMC)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
