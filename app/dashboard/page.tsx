import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, Database } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Selamat Datang</h1>
        <p className="text-muted-foreground mt-2">
          Pilih fitur yang ingin Anda gunakan
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-6 w-6" />
              <CardTitle>Database Instrumen</CardTitle>
            </div>
            <CardDescription>
              Kelola data instrumen pengukuran Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Tambah, edit, dan hapus instrumen beserta spesifikasi pengukurannya termasuk
              rentang ukur, CMC, drift, dan ketidakpastian kalibrasi.
            </p>
            <Link href="/dashboard/instruments">
              <Button className="w-full">Buka Database Instrumen</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="h-6 w-6" />
              <CardTitle>Kalkulator Budget Ketidakpastian</CardTitle>
            </div>
            <CardDescription>
              Hitung ketidakpastian pengukuran
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Buat dan kelola template budget ketidakpastian untuk berbagai jenis
              pengukuran dengan komponen-komponen yang dapat disesuaikan.
            </p>
            <Link href="/dashboard/calculator">
              <Button className="w-full">Buka Kalkulator</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
