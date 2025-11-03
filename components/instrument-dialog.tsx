"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface InstrumentDialogProps {
  open: boolean
  instrument?: any
  onClose: (refresh: boolean) => void
}

export function InstrumentDialog({ open, instrument, onClose }: InstrumentDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    type: "",
    serialNumber: "",
    measurementQuantity: "",
    minRange: "",
    maxRange: "",
    unit: "",
    cmc: "",
    drift: "",
    calibrationUncertainty: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (instrument) {
      const firstMq = instrument.measurementQuantities?.[0]
      const firstRange = firstMq?.ranges?.[0]
      setFormData({
        name: instrument.name || "",
        brand: instrument.brand || "",
        type: instrument.type || "",
        serialNumber: instrument.serialNumber || "",
        measurementQuantity: firstMq?.name || "",
        minRange: firstRange?.minRange || "",
        maxRange: firstRange?.maxRange || "",
        unit: firstRange?.unit || "",
        cmc: firstRange?.cmc?.toString() || "",
        drift: firstRange?.drift?.toString() || "",
        calibrationUncertainty: firstRange?.calibrationUncertainty?.toString() || "",
      })
    } else {
      setFormData({
        name: "",
        brand: "",
        type: "",
        serialNumber: "",
        measurementQuantity: "",
        minRange: "",
        maxRange: "",
        unit: "",
        cmc: "",
        drift: "",
        calibrationUncertainty: "",
      })
    }
  }, [instrument])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        name: formData.name,
        brand: formData.brand,
        type: formData.type,
        serialNumber: formData.serialNumber,
        measurementQuantities: [
          {
            name: formData.measurementQuantity,
            ranges: [
              {
                minRange: formData.minRange,
                maxRange: formData.maxRange,
                unit: formData.unit,
                cmc: parseFloat(formData.cmc),
                drift: parseFloat(formData.drift),
                calibrationUncertainty: parseFloat(formData.calibrationUncertainty),
              },
            ],
          },
        ],
      }

      const response = await fetch("/api/instruments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        onClose(true)
      }
    } catch (error) {
      console.error("Error saving instrument:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {instrument ? "Edit Instrumen" : "Tambah Instrumen Baru"}
          </DialogTitle>
          <DialogDescription>
            Isi informasi instrumen dan spesifikasi pengukurannya
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Instrumen</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Merek</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipe/Model</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-4">Besaran Ukur</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="measurementQuantity">Nama Besaran</Label>
                <Input
                  id="measurementQuantity"
                  placeholder="Contoh: DC Voltmeter"
                  value={formData.measurementQuantity}
                  onChange={(e) => setFormData({ ...formData, measurementQuantity: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minRange">Rentang Min</Label>
                  <Input
                    id="minRange"
                    placeholder="0.01"
                    value={formData.minRange}
                    onChange={(e) => setFormData({ ...formData, minRange: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxRange">Rentang Max</Label>
                  <Input
                    id="maxRange"
                    placeholder="202"
                    value={formData.maxRange}
                    onChange={(e) => setFormData({ ...formData, maxRange: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Satuan</Label>
                  <Input
                    id="unit"
                    placeholder="mV"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cmc">CMC</Label>
                  <Input
                    id="cmc"
                    type="number"
                    step="any"
                    placeholder="0.085"
                    value={formData.cmc}
                    onChange={(e) => setFormData({ ...formData, cmc: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="drift">Drift</Label>
                  <Input
                    id="drift"
                    type="number"
                    step="any"
                    placeholder="0.0001"
                    value={formData.drift}
                    onChange={(e) => setFormData({ ...formData, drift: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calibrationUncertainty">Ketidakpastian Kalibrasi</Label>
                  <Input
                    id="calibrationUncertainty"
                    type="number"
                    step="any"
                    placeholder="0.00001"
                    value={formData.calibrationUncertainty}
                    onChange={(e) => setFormData({ ...formData, calibrationUncertainty: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
