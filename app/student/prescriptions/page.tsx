"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Download, Search } from "lucide-react"

// Mock data for prescriptions
const prescriptions = [
  {
    id: 1,
    date: "April 10, 2024",
    doctor: "Dr. Sarah Johnson",
    diagnosis: "Common Cold",
    medications: [
      { name: "Paracetamol", dosage: "500mg", frequency: "3 times a day", duration: "5 days" },
      { name: "Cetirizine", dosage: "10mg", frequency: "Once daily", duration: "3 days" },
    ],
  },
  {
    id: 2,
    date: "March 15, 2024",
    doctor: "Dr. Michael Chen",
    diagnosis: "Migraine",
    medications: [
      { name: "Ibuprofen", dosage: "400mg", frequency: "As needed", duration: "3 days" },
      { name: "Sumatriptan", dosage: "50mg", frequency: "As needed", duration: "PRN" },
    ],
  },
  {
    id: 3,
    date: "February 22, 2024",
    doctor: "Dr. Sarah Johnson",
    diagnosis: "Seasonal Allergies",
    medications: [
      { name: "Loratadine", dosage: "10mg", frequency: "Once daily", duration: "14 days" },
      { name: "Fluticasone Nasal Spray", dosage: "50mcg", frequency: "2 sprays each nostril", duration: "14 days" },
    ],
  },
]

export default function StudentPrescriptions() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPrescriptions = prescriptions.filter(
    (prescription) =>
      prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medications.some((med) => med.name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Prescriptions</h1>
          <p className="text-muted-foreground">View and download your prescription history.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by diagnosis, doctor, or medication..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredPrescriptions.length > 0 ? (
          <div className="grid gap-4">
            {filteredPrescriptions.map((prescription) => (
              <Card key={prescription.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{prescription.diagnosis}</CardTitle>
                      <CardDescription>
                        {prescription.date} by {prescription.doctor}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Medications</h3>
                      <div className="mt-2 space-y-2">
                        {prescription.medications.map((medication, index) => (
                          <div key={index} className="rounded-lg border p-3">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">
                                {medication.name} ({medication.dosage})
                              </div>
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              {medication.frequency} for {medication.duration}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">No Prescriptions Found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm ? "No prescriptions match your search criteria." : "You don't have any prescriptions yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
