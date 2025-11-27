"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PatientCard } from "@/components/PatientCard";
import { PatientCardCompact } from "@/components/PatientCardCompact";
import { TranscriptionStatusProvider } from "@/contexts/TranscriptionStatusContext";

// Sample patient data
const samplePatients = [
  {
    id: "1",
    first_name: "Bessie",
    last_name: "Cooper",
    mrn: "123456789",
    date_of_birth: "1955-06-05",
    gender: "Female",
    phone: "(270) 555-0117",
    email: "bessie.cooper@example.com",
    last_appointment: "2023-06-26T10:00:00Z",
    last_appointment_id: "apt-1",
    next_appointment: "2024-07-30T14:30:00Z",
    next_appointment_id: "apt-2",
  },
  {
    id: "2",
    first_name: "John",
    last_name: "Doe",
    mrn: "987654321",
    date_of_birth: "1970-03-15",
    gender: "Male",
    phone: "(555) 123-4567",
    email: "john.doe@example.com",
    last_appointment: "2024-10-10T09:00:00Z",
    last_appointment_id: "apt-3",
  },
  {
    id: "3",
    first_name: "Jane",
    last_name: "Smith",
    mrn: "456789123",
    date_of_birth: "1985-11-22",
    gender: "Female",
    phone: "(555) 987-6543",
    email: "jane.smith@example.com",
    last_appointment: "2024-10-15T11:00:00Z",
    last_appointment_id: "apt-4",
  },
];

/**
 * PatientCardsExample: Demo page showing both PatientCard variants
 *
 * This page demonstrates:
 * 1. Full-size PatientCard (for list views)
 * 2. Compact PatientCardCompact (for search results)
 */
export default function PatientCardsExamplePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const filteredPatients = samplePatients.filter(
    (patient) =>
      patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mrn?.includes(searchTerm)
  );

  return (
    <TranscriptionStatusProvider transcriptionIds={[]}>
      <AppLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Patient Card Components</h1>
          <p className="text-muted-foreground">
            Demonstration of full-size and compact patient cards
          </p>
        </div>

        {/* Section 1: Full-Size Cards */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Full-Size PatientCard</h2>
          <p className="text-sm text-muted-foreground mb-4">
            800px wide, variable height. Use in: Patients list page, patient
            detail headers.
          </p>
          <div className="space-y-4">
            {samplePatients.slice(0, 2).map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onClick={() =>
                  alert(`Clicked patient: ${patient.first_name} ${patient.last_name}`)
                }
                showAppointments={true}
              />
            ))}
          </div>
        </section>

        <hr className="border-t" />

        {/* Section 2: Compact Cards with Search */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            Compact PatientCardCompact
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            600px × 75px fixed size. Use in: Search results, quick selection
            modals, dropdowns.
          </p>

          {/* Search Bar */}
          <div className="flex gap-2 mb-6 max-w-md">
            <Input
              placeholder="Search by name or MRN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Compact Cards */}
          <div className="space-y-3">
            {filteredPatients.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No patients found matching "{searchTerm}"
              </p>
            ) : (
              filteredPatients.map((patient) => (
                <PatientCardCompact
                  key={patient.id}
                  patient={patient}
                  onClick={() => {
                    setSelectedPatient(patient.id);
                    alert(
                      `Selected patient: ${patient.first_name} ${patient.last_name}`
                    );
                  }}
                  className={
                    selectedPatient === patient.id
                      ? "ring-2 ring-primary"
                      : ""
                  }
                />
              ))
            )}
          </div>
        </section>

        <hr className="border-t" />

        {/* Section 3: Side-by-Side Comparison */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Size Comparison</h2>
          <div className="space-y-6">
            {/* Full Card */}
            <div>
              <p className="text-sm font-medium mb-2">
                Full-Size (800px × ~150px)
              </p>
              <PatientCard
                patient={samplePatients[0]!}
                showAppointments={true}
              />
            </div>

            {/* Compact Card */}
            <div>
              <p className="text-sm font-medium mb-2">
                Compact (600px × 75px)
              </p>
              <PatientCardCompact
                patient={samplePatients[0]!}
              />
            </div>
          </div>
        </section>

        {/* Section 4: Without Appointments */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            PatientCard Without Appointments
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Use on patient detail pages where appointment info is shown
            separately.
          </p>
          <PatientCard
            patient={samplePatients[1]!}
            showAppointments={false}
          />
        </section>

        {/* Section 5: Compact Card */}
        <section>
          <h2 className="text-2xl font-bold mb-4">
            PatientCardCompact
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Compact patient card without appointment status indicator.
          </p>
          <PatientCardCompact
            patient={samplePatients[2]!}
          />
        </section>
      </div>
    </AppLayout>
    </TranscriptionStatusProvider>
  );
}
